import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
// The publisher deliberately uses only Node built-ins and runs without installed dependencies.
// @ts-expect-error JavaScript publisher has no TypeScript declarations
import { assertPromotion, publish, romeDate, selectIndex, validateBundle, validateRecord, vocabulary } from '../scripts/publish-daily.mjs';

const key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
const words = ['ACQUA', 'BELLO', 'ZUPPA'];
const id = createHash('sha256').update(words.join('\n') + '\n').digest('hex');
const vocab = { words, id };
const directories: string[] = [];
afterEach(async () => { vi.useRealTimers(); await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true }))); });
async function directory() { const path = await mkdtemp(join(tmpdir(), 'daily-test-')); directories.push(path); return path; }


describe('trusted daily publisher', () => {
  it('uses the complete HMAC digest and exact date bytes, including leading-zero vectors', () => {
    // Independently checked using openssl dgst -sha256 -mac HMAC -macopt hexkey:...
    // 2026-11-08: 8ad07e553197e3fc5ba1b31572d42e132bee13601216ea32ce58b9a7fa9a9b65
    // 2028-05-13: 00b32e2e6f47362716755631f90e5341dd07313d8469fbc353d244f0aa7c8216
    expect(selectIndex(key, '2026-11-08', 7679)).toBe(4511);
    expect(selectIndex(key, '2028-05-13', 7679)).toBe(2526);
    expect(selectIndex(key, '2026-11-08', 7679)).toBe(4511);
    expect(selectIndex(key, '2026-11-08', 1)).toBe(0);
    expect(() => selectIndex('', '2026-11-08', 3)).toThrow();
    expect(() => selectIndex('z'.repeat(64), '2026-11-08', 3)).toThrow();
  });
  it('checks the ordered vocabulary and exact identity bytes', () => {
    const source = `export const allowedWords = ${JSON.stringify(words)};\nexport const vocabularyId = '${id}';\n`;
    expect(vocabulary(source)).toEqual(vocab);
    expect(() => vocabulary(source.replace('BELLO', 'CACAO'))).toThrow();
    expect(() => vocabulary(source.replace(JSON.stringify(words), JSON.stringify([...words].reverse())))).toThrow();
  });
  it('validates the actual ordered client vocabulary and identity in one bundle', () => {
    for (const quote of ['"', "'", '`']) {
      const bundledWords = `[${words.map(word => `${quote}${word}${quote}`).join(',')}]`;
      expect(() => validateBundle([`${bundledWords};${id}`], vocab)).not.toThrow();
      const compactWords = `${quote}${words.join('.')}${quote}.split(${quote}.${quote})`;
      expect(() => validateBundle([`${compactWords};${id}`], vocab)).not.toThrow();
      expect(() => validateBundle([`${quote}${[...words].reverse().join('.')}${quote}.split(${quote}.${quote});${id}`], vocab)).toThrow('ordered');
    }
    expect(() => validateBundle([`${JSON.stringify([...words].reverse())};${id}`], vocab)).toThrow('ordered');
    expect(() => validateBundle([JSON.stringify(words), id], vocab)).toThrow('ordered');
    expect(() => validateBundle([`${JSON.stringify(words)};${'f'.repeat(64)}`], vocab)).toThrow('ordered');
  });
  it('fixes once, reuses without key, and rejects changed vocabularies', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-08T12:00:00Z'));
    const dir = await directory();
    await expect(publish(dir, '2026-11-08', vocab, '')).rejects.toThrow('PAROLE_DAILY_HMAC_KEY');
    const path = await publish(dir, '2026-11-08', vocab, key);
    const fixed = await readFile(path, 'utf8');
    await publish(dir, '2026-11-08', vocab, '');
    await publish(dir, '2026-11-08', vocab, 'ff'.repeat(32));
    expect(await readFile(path, 'utf8')).toBe(fixed);
    await expect(publish(dir, '2026-11-08', { words, id: 'f'.repeat(64) }, key)).rejects.toThrow('incompatible');
    expect(await readFile(path, 'utf8')).toBe(fixed);
    validateRecord(JSON.parse(fixed), '2026-11-08', vocab);
    await writeFile(path, '{');
    await expect(publish(dir, '2026-11-08', vocab, key)).rejects.toThrow('not valid JSON');
  });
  it('retains a fixed assignment after a failed promotion and recovers it without the key', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-08T12:00:00Z'));
    const dir = await directory();
    const path = await publish(dir, '2026-11-08', vocab, key);
    const fixed = await readFile(path, 'utf8');
    // Simulate promotion being blocked after the assignment has been written.
    expect(() => assertPromotion('verified', 'new-main', '2026-11-08')).toThrow('Main changed');
    expect(await readFile(path, 'utf8')).toBe(fixed);
    const recovered = await publish(dir, '2026-11-08', vocab, '');
    expect(await readFile(recovered, 'utf8')).toBe(fixed);
  });
  it('does not backfill missed days or create future records', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-10T12:00:00Z'));
    const dir = await directory();
    await expect(publish(dir, '2026-11-09', vocab, key)).rejects.toThrow('current Rome date');
    await expect(publish(dir, '2026-11-11', vocab, key)).rejects.toThrow('current Rome date');
    await publish(dir, '2026-11-10', vocab, key);
    expect(await readdir(dir)).toEqual(['2026-11-10.json']);
  });
  it('rejects malformed and unexpected durable branch contents', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-10T12:00:00Z'));
    const dir = await directory();
    await writeFile(join(dir, '2026-11-11.json'), '{}');
    await expect(publish(dir, '2026-11-10', vocab, key)).rejects.toThrow('future');
    await rm(join(dir, '2026-11-11.json'));
    await writeFile(join(dir, '2026-11-09.json'), '{}');
    await expect(publish(dir, '2026-11-10', vocab, key)).rejects.toThrow('malformed');
    expect(await readdir(dir)).toEqual(['2026-11-09.json']);
  });
  it('blocks stale main revisions and midnight-crossing promotion', () => {
    const before = new Date('2026-11-08T22:59:59Z');
    const after = new Date('2026-11-08T23:00:00Z');
    expect(() => assertPromotion('verified', 'verified', '2026-11-08', before)).not.toThrow();
    expect(() => assertPromotion('verified', 'new-main', '2026-11-08', before)).toThrow('Main changed');
    expect(() => assertPromotion('verified', 'verified', '2026-11-08', after)).toThrow('Rome date changed');
  });
  it('tracks Rome day boundaries through daylight saving changes', () => {
    expect(romeDate(new Date('2026-03-28T23:30:00Z'))).toBe('2026-03-29');
    expect(romeDate(new Date('2026-03-29T22:30:00Z'))).toBe('2026-03-30');
    expect(romeDate(new Date('2026-10-24T22:30:00Z'))).toBe('2026-10-25');
    expect(romeDate(new Date('2026-10-25T22:30:00Z'))).toBe('2026-10-25');
  });
});
