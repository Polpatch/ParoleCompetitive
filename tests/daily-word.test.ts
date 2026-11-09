import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ACTIVATION_DATE, allowedGuesses, boundaryAfter, challengeForSelection, observeDailyWord, romeDate, validateSelection, wordForDate } from '../src/daily-word';
import { allowedWords, solutionsV1, vocabularyId } from '../src/word-data';
import { createSelectionSource } from '../src/selection-source';

const record = (date: string, index = 0) => ({ schema: 1, date, vocabularyId, challengeId: `hmac-v1:${date}:${vocabularyId}`, index });

describe('Rome daily challenge', () => {
  it('uses Rome rather than the device time zone and is deterministic', () => {
    const date = romeDate(Date.parse('2026-01-01T23:15:00Z'));
    expect(date).toBe('2026-01-02');
    expect(wordForDate(date)).toEqual(wordForDate(romeDate(Date.parse('2026-01-02T21:00:00Z'))));
  });

  it('requires a published challenge from 8 November 2026', () => {
    expect(ACTIVATION_DATE).toBe('2026-11-08');
    expect(romeDate(Date.parse('2026-11-07T22:59:59Z'))).toBe('2026-11-07');
    expect(romeDate(Date.parse('2026-11-07T23:00:00Z'))).toBe(ACTIVATION_DATE);
    expect(wordForDate('2026-11-07').scheduleVersion).toBe('v1');
    expect(() => wordForDate(ACTIVATION_DATE)).toThrow();
  });

  it.each([
    ['2026-01-01', '2026-01-01T23:00:00.000Z'],
    ['2026-03-29', '2026-03-29T22:00:00.000Z'],
    ['2026-10-25', '2026-10-25T23:00:00.000Z'],
  ])('locates the next midnight after %s', (date, expected) => {
    const boundary = boundaryAfter(date);
    expect(new Date(boundary).toISOString()).toBe(expected);
    expect(romeDate(boundary - 1)).toBe(date);
    expect(romeDate(boundary)).not.toBe(date);
  });

  it.each([
    ['2026-03-29T00:59:59Z', '2026-03-29T01:00:00Z'],
    ['2026-10-25T00:59:59Z', '2026-10-25T01:00:00Z'],
  ])('keeps the same challenge across the clock change at %s', (before, after) => {
    expect(romeDate(Date.parse(before))).toBe('2026-' + (before.includes('-03-') ? '03-29' : '10-25'));
    expect(wordForDate(romeDate(Date.parse(after)))).toEqual(wordForDate(romeDate(Date.parse(before))));
  });

  it('reconciles directly to the current date when a visible timer fires late', () => {
    let instant = Date.parse('2026-10-24T12:00:00Z');
    let callback: (() => void) | undefined;
    const offered: string[] = [];
    const document = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState });
    const stop = observeDailyWord({
      document,
      now: () => instant,
      onDay: challenge => offered.push(challenge.date),
      setTimer: ((fn: () => void) => { callback = fn; return 1; }) as typeof setTimeout,
      clearTimer: (() => {}) as typeof clearTimeout,
    });
    instant = Date.parse('2026-10-28T12:00:00Z');
    callback?.();
    expect(offered).toEqual(['2026-10-24', '2026-10-28']);
    stop();
  });

  it('reconciles directly to the current date when visibility returns', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-03-28T12:00:00Z'));
      const document = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState });
      const offered: string[] = [];
      const stop = observeDailyWord({ document, onDay: challenge => offered.push(challenge.date) });
      document.visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
      vi.setSystemTime(new Date('2026-04-01T12:00:00Z'));
      document.visibilityState = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
      expect(offered).toEqual(['2026-03-28', '2026-04-01']);
      stop();
    } finally { vi.useRealTimers(); }
  });

  it('announces a new challenge at midnight while visible', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-03-29T21:59:59Z'));
      const document = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState });
      const offered: string[] = [];
      const stop = observeDailyWord({ document, onDay: challenge => offered.push(challenge.date) });
      vi.advanceTimersByTime(1000);
      expect(offered).toEqual(['2026-03-29', '2026-03-30']);
      stop();
    } finally { vi.useRealTimers(); }
  });

  it('ships distinct valid solutions inside the allowed dictionary', () => {
    expect(new Set(allowedWords).size).toBe(allowedWords.length);
    expect(new Set(solutionsV1).size).toBe(solutionsV1.length);
    expect(allowedWords.every(word => /^[A-Z]{5}$/.test(word))).toBe(true);
    const allowed = new Set(allowedWords);
    expect(solutionsV1.every(word => allowed.has(word))).toBe(true);
    expect(allowedWords.length).toBeGreaterThan(solutionsV1.length);
  });

  it('preserves all previously allowed guesses and pinned source fingerprints', () => {
    const sources = [
      ['1000_parole_italiane_comuni.txt', '9be6e9b73dfa4fd7155c768edf1a91d0ea25cbf8e2b3a964e29a8c357e238867'],
      ['60000_parole_italiane.txt', '2d8d2ea8f50eed05de6f0dbf99e07fafdc836889c14429f1cfa689ba762e803e'],
      ['660000_parole_italiane.txt', '1fc0688a5cc60366d9e849580d1fe9f87fe7bf4c8c996f2d2e640ada3610bc03'],
    ];
    for (const [file, checksum] of sources) {
      const contents = readFileSync(`data/upstream/${file}`);
      expect(createHash('sha256').update(contents).digest('hex')).toBe(checksum);
      if (file !== '660000_parole_italiane.txt') {
        for (const entry of contents.toString('utf8').split(/\r?\n/)) {
          if (/^[a-zA-Z]{5}$/.test(entry)) expect(allowedGuesses.has(entry.toUpperCase())).toBe(true);
        }
      }
    }
  });

  it('keeps the canonical membership, ordering and identity for guesses and solutions', () => {
    const normalize = (text: string) => text.split(/\r?\n/).filter(word => /^[a-zA-Z]{5}$/.test(word)).map(word => word.toUpperCase());
    const inputs = ['1000_parole_italiane_comuni.txt', '60000_parole_italiane.txt', '660000_parole_italiane.txt']
      .flatMap(file => normalize(readFileSync(`data/upstream/${file}`, 'utf8')));
    const additions = normalize(readFileSync('data/additions.txt', 'utf8'));
    const exclusions = new Set(normalize(readFileSync('data/exclusions.txt', 'utf8')));
    const expected = [...new Set([...inputs, ...additions])].filter(word => !exclusions.has(word)).sort();
    expect(allowedWords).toEqual(expected);
    expect(allowedWords).toHaveLength(7679);
    expect(vocabularyId).toBe('e9aa54a4193cd1ceebbdf78b1f827e27c2a4e0d6c87fb10c4769ce5edf6d0787');
    expect(createHash('sha256').update(allowedWords.join('\n') + '\n').digest('hex')).toBe(vocabularyId);
    for (const word of ['AUDIO', 'OZONO', 'ABBAI', 'ADOBE', 'ABACA', 'LUIGI']) {
      expect(allowedGuesses.has(word)).toBe(true);
      const selection = record('2026-11-08', allowedWords.indexOf(word));
      expect(challengeForSelection(validateSelection(selection)!).word).toBe(word);
    }
    expect(allowedGuesses.has('LAZIO')).toBe(false);
    expect(allowedGuesses.has('HELLO')).toBe(false);
  });

  it('retains v1 historical assignments through regeneration', () => {
    expect(wordForDate('2026-01-01')).toEqual({ date: '2026-01-01', word: 'ABITO', scheduleVersion: 'v1' });
    expect(wordForDate('2026-01-02')).toEqual({ date: '2026-01-02', word: 'ACQUA', scheduleVersion: 'v1' });
    const before = wordForDate('2026-11-07');
    const data = readFileSync('src/word-data.ts', 'utf8');
    execFileSync(process.execPath, ['scripts/generate-words.mjs']);
    expect(readFileSync('src/word-data.ts', 'utf8')).toBe(data);
    expect(wordForDate('2026-11-07')).toEqual(before);
    expect(() => wordForDate('2026-11-09')).toThrow();
  });
});

describe('published daily selection', () => {
  it('validates all fields and rejects incompatible or impossible records', () => {
    const valid = record('2026-11-08');
    expect(validateSelection(valid, valid.date)).toEqual(valid);
    for (const invalid of [
      null, {}, { ...valid, schema: 2 }, record('2026-02-30'), record('2026-11-31'),
      { ...record('2026-11-09'), date: '2026-11-08' }, { ...valid, vocabularyId: 'wrong' },
      { ...valid, index: -1 }, { ...valid, index: 7679 }, { ...valid, index: 1.5 },
      { ...valid, challengeId: 'v1' }, { ...valid, extra: true },
    ]) expect(validateSelection(invalid, '2026-11-08')).toBeNull();
    expect(validateSelection(record('2026-11-31'))).toBeNull();
    expect(validateSelection(record('2026-11-09'), '2026-11-08')).toBeNull();
  });

  it('shares duplicate requests, rejects failures and ignores obsolete completions', async () => {
    let now = Date.parse('2026-11-08T12:00:00Z');
    const responses: ((value: Response) => void)[] = [];
    const fetcher = vi.fn(() => { const deferred = Promise.withResolvers<Response>(); responses.push(deferred.resolve); return deferred.promise; });
    const source = createSelectionSource(fetcher as unknown as typeof fetch, () => now);
    const first = source.acquire('2026-11-08');
    expect(source.acquire('2026-11-08')).toBe(first);
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = Date.parse('2026-11-09T12:00:00Z');
    const second = source.acquire('2026-11-09');
    responses[1](new Response(JSON.stringify(record('2026-11-09'))));
    expect(await second).toEqual({ kind: 'available', selection: record('2026-11-09') });
    responses[0](new Response(JSON.stringify(record('2026-11-08'))));
    expect(await first).toEqual({ kind: 'obsolete' });
    const failed = source.acquire('2026-11-09');
    responses[2](new Response('', { status: 404 }));
    expect(await failed).toEqual({ kind: 'unavailable' });
  });

  it('rejects a delayed completion after midnight even without a newer request', async () => {
    let now = Date.parse('2026-11-08T12:00:00Z');
    const deferred = Promise.withResolvers<Response>();
    const source = createSelectionSource(() => deferred.promise, () => now);
    const request = source.acquire('2026-11-08');
    now = Date.parse('2026-11-09T00:00:00Z');
    deferred.resolve(new Response(JSON.stringify(record('2026-11-08'))));
    expect(await request).toEqual({ kind: 'obsolete' });
  });

  it('leaves a network failure unavailable without retrying automatically', async () => {
    const fetcher = vi.fn(async () => { throw new Error('offline'); });
    const source = createSelectionSource(fetcher as typeof fetch, () => Date.parse('2026-11-08T12:00:00Z'));
    expect(await source.acquire('2026-11-08')).toEqual({ kind: 'unavailable' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([
    [new Response('not json'), 'unavailable'],
    [new Response(JSON.stringify(record('2026-11-08', -1))), 'unavailable'],
    [new Response(JSON.stringify({ ...record('2026-11-08'), schema: 2 })), 'incompatible'],
    [new Response(JSON.stringify({ ...record('2026-11-08'), vocabularyId: 'wrong' })), 'incompatible'],
  ])('classifies invalid published responses', async (response, kind) => {
    const source = createSelectionSource(async () => response, () => Date.parse('2026-11-08T12:00:00Z'));
    expect(await source.acquire('2026-11-08')).toEqual({ kind });
  });
});
