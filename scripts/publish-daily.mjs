import { createHash, createHmac } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export function romeDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function assertPromotion(revision, currentRevision, date, now = new Date()) {
  if (!revision || revision !== currentRevision) throw new Error('Main changed since verification; dispatch a new run');
  if (date !== romeDate(now)) throw new Error('Rome date changed; dispatch a new run');
}

export function vocabulary(source) {
  const wordsMatch = source.match(/^export const allowedWords = (\[.*\]);$/m);
  const idMatch = source.match(/^export const vocabularyId = ["']([a-f0-9]{64})["'];$/m);
  if (!wordsMatch || !idMatch) throw new Error('Generated vocabulary or vocabularyId is missing');
  const words = JSON.parse(wordsMatch[1]);
  if (!Array.isArray(words) || !words.length || words.some((word, i) => !/^[A-Z]{5}$/.test(word) || (i > 0 && words[i - 1] >= word))) throw new Error('Canonical vocabulary is malformed or unordered');
  const id = createHash('sha256').update(words.join('\n') + '\n', 'utf8').digest('hex');
  if (id !== idMatch[1]) throw new Error('Canonical vocabulary identity does not match its contents');
  return { words, id };
}

export function validateBundle(bundles, vocab) {
  const representations = ['"', "'", '`'].flatMap(quote => [
    `[${vocab.words.map(word => `${quote}${word}${quote}`).join(',')}]`,
    `${quote}${vocab.words.join('.')}${quote}.split(${quote}.${quote})`,
  ]);
  if (!bundles.some(bundle => bundle.includes(vocab.id) && representations.some(words => bundle.includes(words)))) {
    throw new Error('Built client does not contain the ordered canonical vocabulary and identity');
  }
}

export function selectIndex(key, date, length) {
  if (!/^[0-9a-fA-F]{64}$/.test(key || '')) throw new Error('PAROLE_DAILY_HMAC_KEY must contain exactly 64 hexadecimal digits');
  if (!Number.isSafeInteger(length) || length < 1) throw new Error('Invalid vocabulary length');
  const digest = createHmac('sha256', Buffer.from(key, 'hex')).update(date, 'utf8').digest('hex');
  return Number(BigInt(`0x${digest}`) % BigInt(length));
}

export function validateRecord(record, date, vocab) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || Object.keys(record).sort().join(',') !== 'challengeId,date,index,schema,vocabularyId' || record.schema !== 1 || record.date !== date || record.vocabularyId !== vocab.id || record.challengeId !== `hmac-v1:${date}:${vocab.id}` || !Number.isSafeInteger(record.index) || record.index < 0 || record.index >= vocab.words.length) throw new Error(`Fixed record ${date} is malformed or incompatible with this vocabulary; do not replace it`);
}

export async function publish(dataDir, date, vocab, key) {
  if (date !== romeDate()) throw new Error('Candidate date is no longer the current Rome date');
  const entries = await readdir(dataDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    if (!entry.isFile() || !/^\d{4}-\d{2}-\d{2}\.json$/.test(entry.name) || entry.name.slice(0, 10) > date) throw new Error(`Unexpected or future entry on daily-data branch: ${entry.name}`);
    const day = entry.name.slice(0, 10);
    const parsed = new Date(`${day}T00:00:00Z`);
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== day) throw new Error(`Invalid date on daily-data branch: ${entry.name}`);
    let existing;
    try { existing = JSON.parse(await readFile(join(dataDir, entry.name), 'utf8')); } catch { throw new Error(`Fixed record ${day} is not valid JSON; do not replace it`); }
    if (!existing || typeof existing !== 'object' || Array.isArray(existing) || Object.keys(existing).sort().join(',') !== 'challengeId,date,index,schema,vocabularyId' || existing.schema !== 1 || existing.date !== day || !/^[a-f0-9]{64}$/.test(existing.vocabularyId) || existing.challengeId !== `hmac-v1:${day}:${existing.vocabularyId}` || !Number.isSafeInteger(existing.index) || existing.index < 0) throw new Error(`Fixed record ${day} is malformed; do not replace it`);
  }
  const path = join(dataDir, `${date}.json`);
  let contents;
  try { contents = await readFile(path, 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const index = selectIndex(key, date, vocab.words.length);
    if (date !== romeDate()) throw new Error('Rome date changed before fixing the assignment');
    contents = JSON.stringify({ schema: 1, date, vocabularyId: vocab.id, challengeId: `hmac-v1:${date}:${vocab.id}`, index }) + '\n';
    await writeFile(path, contents, { flag: 'wx' });
  }
  let record;
  try { record = JSON.parse(contents); } catch { throw new Error(`Fixed record ${date} is not valid JSON; do not replace it`); }
  validateRecord(record, date, vocab);
  return path;
}

async function main() {
  const [command, dataDir, date, destination] = process.argv.slice(2);
  const vocab = vocabulary(await readFile('src/word-data.ts', 'utf8'));
  if (command === 'publish') {
    const path = await publish(dataDir, date, vocab, process.env.PAROLE_DAILY_HMAC_KEY);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(path, destination);
  } else if (command === 'validate') {
    if (date !== romeDate()) throw new Error('Candidate date is no longer the current Rome date');
    validateRecord(JSON.parse(await readFile(destination, 'utf8')), date, vocab);
    const assets = await readdir('dist/assets');
    const bundles = await Promise.all(assets.filter(name => name.endsWith('.js')).map(name => readFile(join('dist/assets', name), 'utf8')));
    validateBundle(bundles, vocab);
  } else if (command === 'date') console.log(romeDate());
  else if (command === 'guard') assertPromotion(process.env.VERIFIED_REVISION, process.env.CURRENT_REVISION, process.env.CANDIDATE_DATE);
  else throw new Error('Unknown publisher command');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
