import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createGame, submitGuess } from '../src/game';
import { changeAutocomplete, changeDifficulty, changeSpoilerFree, readSession, reconcile, writeSession, type Session } from '../src/session';
import { ACTIVATION_DATE } from '../src/daily-word';
import { allowedWords, vocabularyId } from '../src/word-data';

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

test('preferences and active game transition persist together across reload and days', () => {
  const storage = memoryStorage();
  const state = readSession(storage);
  const first = reconcile(state, Date.parse('2026-01-01T12:00:00Z'))!;
  assert.deepEqual(state.preferences, { difficulty: 'standard', spoilerFree: true, appearance: 'system', autocomplete: false });
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
  assert.deepEqual(loaded.preferences, { difficulty: 'standard', spoilerFree: false, appearance: 'system', autocomplete: false });
  assert.equal(JSON.stringify(loaded.games[game.date]), original);
  const next = reconcile(loaded, Date.parse('2026-01-02T12:00:00Z'))!;
  assert.equal(next.hard, false);
});

test('rejected guess does not lock difficulty; downgrade is permanent for an active game', () => {
  const game = createGame({ date: '2026-01-01', solution: 'ABACA', scheduleId: 'v1' });
  const state: Session = { preferences: { difficulty: 'standard', spoilerFree: true, appearance: 'system', autocomplete: false }, games: { [game.date]: game } };
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
  const first = reconcile(session, instant)!;
  session.games[first.date] = submitGuess(first, first.solution, new Set([first.solution]), instant).game;
  reconcile(session, Date.parse('2026-01-02T12:00:00Z'));
  writeSession(storage, session);
  const restored = reconcile(readSession(storage), instant)!;
  assert.equal(restored.status, 'won');
  assert.equal(restored.guesses.length, 1);
  assert.equal(submitGuess(restored, restored.solution, new Set([restored.solution]), instant).game, restored);
});

test('saved games with out-of-dictionary solutions or guesses are rejected', () => {
  const storage = memoryStorage();
  const state = readSession(storage);
  const game = reconcile(state, Date.parse('2026-01-01T12:00:00Z'))!;
  state.games[game.date] = { ...game, solution: 'ZZZZZ' };
  writeSession(storage, state);
  assert.throws(() => readSession(storage));
  state.games[game.date] = submitGuess(game, 'ZZZZZ', new Set(['ZZZZZ']), 1000).game;
  writeSession(storage, state);
  assert.throws(() => readSession(storage));
});

test('appearance survives reload and later days without changing a completed game', () => {
  const storage = memoryStorage();
  const session = readSession(storage);
  const game = reconcile(session, Date.parse('2026-01-01T12:00:00Z'))!;
  session.games[game.date] = submitGuess(game, game.solution, new Set([game.solution]), 1000).game;
  const completed = structuredClone(session.games[game.date]);
  for (const appearance of ['light', 'dark', 'system'] as const) {
    session.preferences.appearance = appearance;
    writeSession(storage, session);
    const restored = readSession(storage);
    assert.equal(restored.preferences.appearance, appearance);
    assert.deepEqual(restored.games[game.date], completed);
    reconcile(restored, Date.parse('2026-01-02T12:00:00Z'));
    assert.equal(restored.preferences.appearance, appearance);
    assert.deepEqual(restored.games[game.date], completed);
  }
});

test('legacy session defaults appearance without changing saved progress and rejects invalid appearance', () => {
  const storage = memoryStorage();
  const session = readSession(storage);
  const game = reconcile(session, Date.parse('2026-01-01T12:00:00Z'))!;
  session.preferences.difficulty = 'hard';
  session.preferences.spoilerFree = false;
  session.games[game.date] = submitGuess(game, game.solution, new Set([game.solution]), 1234).game;
  const legacy = JSON.parse(JSON.stringify(session));
  delete legacy.preferences.appearance;
  storage.setItem('parolecompetitive:session:v1', JSON.stringify(legacy));
  const restored = readSession(storage);
  assert.deepEqual(restored.preferences, { ...legacy.preferences, appearance: 'system' });
  assert.deepEqual(restored.games, legacy.games);
  legacy.preferences.appearance = 'sepia';
  storage.setItem('parolecompetitive:session:v1', JSON.stringify(legacy));
  assert.throws(() => readSession(storage));
});

test('autocomplete choices survive rejection, reopening, completion and the next day independently', () => {
  const storage = memoryStorage();
  const now = Date.parse('2026-03-10T12:00:00Z');
  let state = readSession(storage);
  let game = reconcile(state, now)!;
  assert.equal(game.autocomplete, false);
  game = { ...game, draft: 'AM' };
  state.games[game.date] = game;
  assert.equal(submitGuess(game, game.draft, new Set(), now).accepted, false);
  assert.equal(changeAutocomplete(state, game, true), true);
  assert.equal(state.games[game.date].draft, 'AM');
  writeSession(storage, state);
  state = readSession(storage);
  game = reconcile(state, now)!;
  assert.equal(game.autocomplete, true);
  assert.equal(state.preferences.autocomplete, true);
  const wrong = game.solution === 'AMORE' ? 'AUDIO' : 'AMORE';
  game = submitGuess(game, wrong, new Set([wrong, game.solution]), now).game;
  state.games[game.date] = game;
  assert.equal(changeAutocomplete(state, game, false), false);
  assert.equal(state.games[game.date], game);
  assert.equal(state.preferences.autocomplete, true);
  game = submitGuess(game, game.solution, new Set([wrong, game.solution]), now + 1000).game;
  state.games[game.date] = game;
  const completed = JSON.stringify(game);
  assert.equal(changeAutocomplete(state, game, false), true);
  assert.equal(JSON.stringify(state.games[game.date]), completed);
  writeSession(storage, state);
  state = readSession(storage);
  assert.equal(reconcile(state, now)!.autocomplete, true);
  assert.equal(state.preferences.autocomplete, false);
  assert.equal(JSON.stringify(state.games[game.date]), completed);
  assert.equal(reconcile(state, now + 86400000)!.autocomplete, false);
});

test('replacement challenge takes future autocomplete preference rather than withdrawn choice', () => {
  const storage = memoryStorage();
  const state = readSession(storage);
  state.preferences.autocomplete = true;
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1', autocomplete: false });
  state.games[old.date] = old;
  const selection = { schema: 1 as const, date: ACTIVATION_DATE, vocabularyId, challengeId: `hmac-v1:${ACTIVATION_DATE}:${vocabularyId}`, index: allowedWords.indexOf('AMORE') };
  const replacement = reconcile(state, Date.parse(`${ACTIVATION_DATE}T12:00:00Z`), selection)!;
  assert.equal(replacement.autocomplete, true);
  assert.equal(state.preferences.autocomplete, true);
  writeSession(storage, state);
  assert.equal(readSession(storage).games[old.date].autocomplete, true);
});

test('legacy sessions default autocomplete and reject invalid stored values', () => {
  const storage = memoryStorage();
  const state = readSession(storage);
  delete state.preferences.autocomplete;
  writeSession(storage, state);
  assert.equal(readSession(storage).preferences.autocomplete, false);
  storage.setItem('parolecompetitive:session:v1', JSON.stringify({ ...state, preferences: { ...state.preferences, autocomplete: 'yes' } }));
  assert.throws(() => readSession(storage));
});
