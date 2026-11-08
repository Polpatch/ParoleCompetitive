import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { boundaryAfter, observeDailyWord, romeDate, wordForDate } from '../src/daily-word';
import { allowedWords, solutionsV1 } from '../src/word-data';

describe('Rome daily challenge', () => {
  it('uses Rome rather than the device time zone and is deterministic', () => {
    const date = romeDate(Date.parse('2026-01-01T23:15:00Z'));
    expect(date).toBe('2026-01-02');
    expect(wordForDate(date)).toEqual(wordForDate(romeDate(Date.parse('2026-01-02T21:00:00Z'))));
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

  it('preserves the published schedule through regeneration', () => {
    const before = wordForDate('2026-11-08');
    const data = readFileSync('src/word-data.ts', 'utf8');
    execFileSync(process.execPath, ['scripts/generate-words.mjs']);
    expect(readFileSync('src/word-data.ts', 'utf8')).toBe(data);
    expect(wordForDate('2026-11-08')).toEqual(before);
  });
});
