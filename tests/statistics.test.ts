import { test } from 'vitest';
import assert from 'node:assert/strict';
import { deriveStatistics, type StatisticsGame } from '../src/statistics';
import { ACTIVATION_DATE, allowedGuesses } from '../src/daily-word';
import { createGame, submitGuess } from '../src/game';
import { defaultPreferences } from '../src/preferences';
import { readSession, reconcile, reconcileCutover, writeSession, type Session } from '../src/session';
import { allowedWords, vocabularyId } from '../src/word-data';

function game(status: StatisticsGame['status'], attempts: number, endedAt: number | null, score = 0, startedAt: number | null = 1): StatisticsGame {
  return { status, guesses: Array.from({ length: attempts }, () => ({})), startedAt, endedAt, score };
}

test('empty and unstarted days do not change statistics', () => {
  const empty = { wins: 0, losses: 0, distribution: [0, 0, 0, 0, 0, 0], latestScore: null };
  assert.deepEqual(deriveStatistics({}), empty);
  assert.deepEqual(deriveStatistics({
    '2026-01-01': game('expired', 0, 100, 0, null),
    '2026-01-02': game('ready', 0, null, 0, null),
    '2026-01-03': game('playing', 1, null),
  }), empty);
});

test('wins appear in the first and sixth buckets and latest completion wins', () => {
  const records = {
    '2026-01-01': game('won', 1, 300, 1500),
    '2026-01-02': game('won', 6, 200, 250),
  };
  assert.deepEqual(deriveStatistics(records), {
    wins: 2, losses: 0, distribution: [1, 0, 0, 0, 0, 1], latestScore: 1500,
  });
});

test('losses and started expiry count, while unstarted expiry leaves latest score unchanged', () => {
  const records: Record<string, StatisticsGame> = {
    '2026-01-01': game('won', 1, 100, 1000),
    '2026-01-02': game('lost', 6, 200),
    '2026-01-03': game('expired', 2, 300),
    '2026-01-04': game('expired', 0, 400, 0, null),
  };
  assert.deepEqual(deriveStatistics(records), {
    wins: 1, losses: 2, distribution: [1, 0, 0, 0, 0, 0], latestScore: 0,
  });
  delete records['2026-01-02'];
  delete records['2026-01-03'];
  assert.equal(deriveStatistics(records).latestScore, 1000);
});

test('reload and repeated deliveries from competing tabs use one record per date', () => {
  const result = game('won', 6, 100, 300);
  const records = { '2026-01-01': result };
  const expected = { wins: 1, losses: 0, distribution: [0, 0, 0, 0, 0, 1], latestScore: 300 };
  assert.deepEqual(deriveStatistics(records), expected);
  const reopened = JSON.parse(JSON.stringify(records));
  reopened['2026-01-01'] = { ...result };
  reopened['2026-01-01'] = { ...result };
  assert.deepEqual(deriveStatistics(reopened), expected);
});

test('withdrawing a completed day restores statistics from the surviving outcomes', () => {
  const records: Record<string, StatisticsGame> = {
    '2026-01-01': game('won', 6, 100, 250),
    '2026-01-02': game('lost', 6, 200),
    '2026-01-03': game('won', 1, 300, 1500),
  };
  delete records['2026-01-03'];
  assert.deepEqual(deriveStatistics(records), {
    wins: 1, losses: 1, distribution: [0, 0, 0, 0, 0, 1], latestScore: 0,
  });
  delete records['2026-01-02'];
  assert.deepEqual(deriveStatistics(records), {
    wins: 1, losses: 0, distribution: [0, 0, 0, 0, 0, 1], latestScore: 250,
  });
  delete records['2026-01-01'];
  assert.deepEqual(deriveStatistics(records), {
    wins: 0, losses: 0, distribution: [0, 0, 0, 0, 0, 0], latestScore: null,
  });
});

test('replacement withdraws only the old outcome and ignores replay after a new result', () => {
  const now = Date.parse(`${ACTIVATION_DATE}T12:00:00Z`);
  const oldReady = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' });
  const oldWon = submitGuess(oldReady, 'AMORE', allowedGuesses, now - 1000).game;
  const earlier = submitGuess(createGame({ date: '2026-01-01', solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', allowedGuesses, now - 2000).game;
  const session: Session = { preferences: defaultPreferences(), games: { [earlier.date]: earlier, [ACTIVATION_DATE]: oldWon } };
  assert.equal(reconcileCutover(session, now), true);
  assert.deepEqual(deriveStatistics(session.games), { wins: 1, losses: 0, distribution: [1, 0, 0, 0, 0, 0], latestScore: earlier.score });
  const selection = { schema: 1 as const, date: ACTIVATION_DATE, vocabularyId, challengeId: `hmac-v1:${ACTIVATION_DATE}:${vocabularyId}`, index: allowedWords.indexOf('AMORE') };
  const fresh = reconcile(session, now, selection)!;
  assert.equal(fresh.solution, 'AMORE');
  const won = submitGuess(fresh, fresh.solution, allowedGuesses, now).game;
  session.games[ACTIVATION_DATE] = won;
  let stored: string | null = null;
  const storage = {
    getItem: (_key: string) => stored,
    setItem: (_key: string, value: string) => { stored = value; },
  };
  writeSession(storage, session);
  const expected = deriveStatistics(session.games);
  assert.equal(expected.wins, 2);
  const reopened = readSession(storage);
  assert.deepEqual(deriveStatistics(reopened.games), expected);
  reopened.games[ACTIVATION_DATE] = oldWon;
  assert.equal(reconcileCutover(reopened, now), true);
  assert.equal(reopened.games[ACTIVATION_DATE].scheduleId, selection.challengeId);
  assert.deepEqual(deriveStatistics(reopened.games), expected);
  assert.equal(reconcileCutover(reopened, now), false);
  writeSession(storage, reopened);
  assert.deepEqual(deriveStatistics(readSession(storage).games), expected);
});

test('withdrawing an activation-day loss leaves no result when it was the only outcome', () => {
  const now = Date.parse(`${ACTIVATION_DATE}T12:00:00Z`);
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' });
  const started = submitGuess(old, 'AUDIO', allowedGuesses, now - 1000).game;
  const session: Session = { preferences: defaultPreferences(), games: { [ACTIVATION_DATE]: { ...started, status: 'expired', endedAt: now, score: 0 } } };
  assert.equal(deriveStatistics(session.games).losses, 1);
  reconcileCutover(session, now);
  assert.deepEqual(deriveStatistics(session.games), { wins: 0, losses: 0, distribution: [0, 0, 0, 0, 0, 0], latestScore: null });
});
