import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createGame, submitGuess } from '../src/game';
import { changeDifficulty, changeSpoilerFree, readSession, reconcile, writeSession, type Session } from '../src/session';

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

test('preferences and active game transition persist together across reload and days', () => {
  const storage = memoryStorage();
  const state = readSession(storage);
  const first = reconcile(state, Date.parse('2026-01-01T12:00:00Z'));
  assert.deepEqual(state.preferences, { difficulty: 'standard', spoilerFree: true });
  assert.equal(changeDifficulty(state, first, 'hard'), true);
  let game = state.games[first.date];
  game = submitGuess(game, game.solution, new Set([game.solution]), 100).game;
  state.games[game.date] = game;
  const original = JSON.stringify(game);
  assert.equal(changeDifficulty(state, game, 'standard'), true);
  assert.equal(JSON.stringify(state.games[game.date]), original);
  changeSpoilerFree(state, false);
  writeSession(storage, state);
  const loaded = readSession(storage);
  assert.deepEqual(loaded.preferences, { difficulty: 'standard', spoilerFree: false });
  assert.equal(JSON.stringify(loaded.games[game.date]), original);
  const next = reconcile(loaded, Date.parse('2026-01-02T12:00:00Z'));
  assert.equal(next.hard, false);
});

test('rejected guess does not lock difficulty; downgrade is permanent for an active game', () => {
  const game = createGame({ date: '2026-01-01', solution: 'ABACA', scheduleId: 'v1' });
  const state: Session = { preferences: { difficulty: 'standard', spoilerFree: true }, games: { [game.date]: game } };
  const rejected = submitGuess(game, 'ZZZZZ', new Set(['AACCC']), 1);
  assert.equal(rejected.accepted, false);
  assert.equal(changeDifficulty(state, rejected.game, 'hard'), true);
  const started = submitGuess(state.games[game.date], 'AACCC', new Set(['AACCC']), 2).game;
  assert.equal(started.status, 'playing');
  assert.equal(changeDifficulty(state, started, 'standard'), true);
  const downgraded = state.games[game.date];
  assert.equal(downgraded.bonusEligible, false);
  assert.equal(changeDifficulty(state, downgraded, 'hard'), false);
  assert.equal(state.preferences.difficulty, 'standard');
  assert.equal(state.games[game.date], downgraded);
});

test('clock rollback restores the dated terminal game without allowing a replay', () => {
  const storage = memoryStorage();
  const session = readSession(storage);
  const instant = Date.parse('2026-01-01T12:00:00Z');
  const first = reconcile(session, instant);
  session.games[first.date] = submitGuess(first, first.solution, new Set([first.solution]), instant).game;
  reconcile(session, Date.parse('2026-01-02T12:00:00Z'));
  writeSession(storage, session);
  const restored = reconcile(readSession(storage), instant);
  assert.equal(restored.status, 'won');
  assert.equal(restored.guesses.length, 1);
  assert.equal(submitGuess(restored, restored.solution, new Set([restored.solution]), instant).game, restored);
});

test('saved games with out-of-dictionary solutions or guesses are rejected', () => {
  const storage = memoryStorage();
  const state = readSession(storage);
  const game = reconcile(state, Date.parse('2026-01-01T12:00:00Z'));
  state.games[game.date] = { ...game, solution: 'ZZZZZ' };
  writeSession(storage, state);
  assert.throws(() => readSession(storage));
  state.games[game.date] = submitGuess(game, 'ZZZZZ', new Set(['ZZZZZ']), 1000).game;
  writeSession(storage, state);
  assert.throws(() => readSession(storage));
});
