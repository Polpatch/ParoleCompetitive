import { test } from 'vitest';
import assert from 'node:assert/strict';
import { deriveStatistics, type StatisticsGame } from '../src/statistics';

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
