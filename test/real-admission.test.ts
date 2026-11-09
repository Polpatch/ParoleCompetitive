import { test } from 'vitest';
import assert from 'node:assert/strict';
import { allowedGuesses } from '../src/daily-word';
import { defaultPreferences } from '../src/preferences';
import { changeDraft, playGuess, type Session } from '../src/session';
import { createGame, evaluateGuess, submitGuess } from '../src/game';

const fresh = (hard = false) => createGame({ date: '2026-01-01', solution: 'AMORE', scheduleId: 'v1', hard });

test('real dictionary admits AUDIO and OZONO case-insensitively with ordinary feedback and timing', () => {
  for (const word of ['audio', 'oZoNo']) {
    const game = fresh();
    const state: Session = { preferences: defaultPreferences(), games: { [game.date]: game } };
    changeDraft(state, game, word);
    assert.equal(playGuess(state, state.games[game.date], 1234), null);
    const result = state.games[game.date];
    assert.deepEqual(result.guesses, [{ word: word.toUpperCase(), feedback: evaluateGuess(game.solution, word.toUpperCase()) }]);
    assert.equal(result.startedAt, 1234);
    assert.equal(result.endedAt, null);
    assert.equal(result.status, 'playing');
  }
  const game = fresh();
  const state: Session = { preferences: defaultPreferences(), games: { [game.date]: game } };
  assert.equal(allowedGuesses.has('ZZZZZ'), false);
  changeDraft(state, game, 'ZZZZZ');
  const before = state.games[game.date];
  assert.ok(playGuess(state, before, 1234));
  assert.equal(state.games[game.date], before);
  assert.equal(before.startedAt, null);
  assert.equal(before.guesses.length, 0);
});

test('real dictionary does not bypass absent-letter or hard-mode restrictions', () => {
  const first = submitGuess(fresh(true), 'AUDIO', allowedGuesses, 1234);
  assert.equal(first.accepted, true);
  const absent = submitGuess(first.game, 'AUDIO', allowedGuesses, 2345);
  assert.equal(absent.accepted, false);
  assert.match(absent.error!, /esclusa/);
  assert.equal(absent.game, first.game);
  assert.ok(allowedGuesses.has('MORSA'));
  const hard = submitGuess(first.game, 'MORSA', allowedGuesses, 2345);
  assert.equal(hard.accepted, false);
  assert.match(hard.error!, /difficile/);
  assert.equal(hard.game, first.game);
  assert.equal(hard.game.startedAt, 1234);
  assert.equal(hard.game.guesses.length, 1);
});
