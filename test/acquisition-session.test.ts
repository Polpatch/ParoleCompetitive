import { test } from 'vitest';
import assert from 'node:assert/strict';
import { ACTIVATION_DATE, allowedGuesses, boundaryAfter } from '../src/daily-word';
import { createGame, submitGuess } from '../src/game';
import { defaultPreferences } from '../src/preferences';
import { readSession, reconcile, SESSION_KEY, writeSession } from '../src/session';
import { deriveStatistics } from '../src/statistics';
import { allowedWords, vocabularyId } from '../src/word-data';

const selection = (date: string) => ({ schema: 1 as const, date, vocabularyId, challengeId: `hmac-v1:${date}:${vocabularyId}`, index: allowedWords.indexOf('AMORE') });
const storage = (value: unknown) => {
  let raw = JSON.stringify(value);
  return { getItem: (key: string) => key === SESSION_KEY ? raw : null, setItem: (_key: string, next: string) => { raw = next; } };
};

test('later public challenge remains separate from an acquired game and expires without a selection', () => {
  const date = '2026-11-09';
  const ready = createGame({ date, solution: 'AMORE', scheduleId: 'v1' });
  const playing = submitGuess(ready, 'AUDIO', allowedGuesses, Date.parse(`${date}T12:00:00Z`)).game;
  const saved = storage({ preferences: defaultPreferences(), games: { [date]: playing } });
  const session = readSession(saved);
  assert.equal(reconcile(session, Date.parse('2026-11-10T12:00:00Z')), null);
  assert.equal(session.publicGames?.[date].endedAt, boundaryAfter(date));
  assert.equal(session.publicGames?.[date].score, 0);
  writeSession(saved, session);
  const restored = readSession(saved);
  assert.equal(deriveStatistics(restored.publicGames!).losses, 1);
  const current = reconcile(restored, Date.parse('2026-11-10T12:00:00Z'), selection('2026-11-10'))!;
  assert.equal(current.scheduleId, selection('2026-11-10').challengeId);
  writeSession(saved, restored);
  assert.deepEqual(readSession(saved).publicGames?.[date], session.publicGames?.[date]);
});

test('a later public result and acquired result on the same date both survive reopening', () => {
  const date = '2026-11-09';
  const old = createGame({ date, solution: 'AMORE', scheduleId: 'v1' });
  const won = submitGuess(old, 'AMORE', allowedGuesses, 100).game;
  const saved = storage({ preferences: defaultPreferences(), games: { [date]: won } });
  const session = readSession(saved);
  const acquired = reconcile(session, Date.parse(`${date}T12:00:00Z`), selection(date))!;
  session.games[date] = submitGuess(acquired, 'AMORE', allowedGuesses, 200).game;
  writeSession(saved, session);
  const restored = readSession(saved);
  assert.deepEqual(restored.publicGames?.[date], won);
  assert.deepEqual(restored.games[date], session.games[date]);
  assert.equal(deriveStatistics({ public: restored.publicGames![date], acquired: restored.games[date] }).wins, 2);
  restored.games[date] = old;
  assert.throws(() => writeSession(saved, restored), /obsolete/);
});

test('activation withdrawal precedes expiry even without a selection', () => {
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' });
  const playing = submitGuess(old, 'AUDIO', allowedGuesses, 100).game;
  const saved = storage({ preferences: defaultPreferences(), games: { [ACTIVATION_DATE]: playing } });
  const session = readSession(saved);
  assert.equal(reconcile(session, Date.parse('2026-11-10T12:00:00Z')), null);
  assert.equal(session.games[ACTIVATION_DATE], undefined);
  assert.equal(deriveStatistics(session.games).losses, 0);
  writeSession(saved, session);
  assert.equal(readSession(saved).games[ACTIVATION_DATE], undefined);
});
