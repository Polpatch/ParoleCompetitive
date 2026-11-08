import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createGame, evaluateGuess, keyboardKnowledge, hardConstraints, scoreGame, setDraft, setHard, submitGuess, expireGame, type Game, type Guess } from '../src/game';

const words = new Set(['AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'FFFFF', 'ABACA', 'AACCC', 'CAAAC']);
const fresh = (hard = false) => createGame({ date: '2026-01-01', solution: 'AAAAA', scheduleId: 'v1', hard });
const submit = (game: Game, word: string, now: number) => submitGuess(game, word, words, now);

test('duplicates consume exact positions first and remaining occurrences left to right', () => {
  assert.deepEqual(evaluateGuess('ABACA', 'AACCC'), ['green', 'yellow', 'gray', 'green', 'gray']);
  assert.deepEqual(evaluateGuess('ABACA', 'CAAAC'), ['yellow', 'yellow', 'green', 'yellow', 'gray']);
  assert.equal(keyboardKnowledge([{ word: 'CAAAC', feedback: evaluateGuess('ABACA', 'CAAAC') }]).C, 'yellow');
  assert.equal(keyboardKnowledge([{ word: 'AACCC', feedback: evaluateGuess('ABACA', 'AACCC') }, { word: 'CAAAC', feedback: evaluateGuess('ABACA', 'CAAAC') }]).A, 'green');
});

test('sixth correct guess wins; six incorrect guesses lose and lock', () => {
  for (const last of ['AAAAA', 'FFFFF']) {
    let game = fresh();
    for (const word of ['BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'FFFFF'].slice(0, 4)) game = submit(game, word, 1000).game;
    game = submit(game, last === 'FFFFF' ? 'AAAAA' : 'FFFFF', 2000).game;
    // Use a separate solution for the losing sequence so no guess solves it.
    if (last === 'FFFFF') {
      game = createGame({ date: '2026-01-01', solution: 'ABACA', scheduleId: 'v1' });
      for (const word of ['BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'FFFFF']) game = submit(game, word, 1000).game;
      game = submit(game, 'AAAAA', 2000).game;
      assert.equal(game.status, 'lost');
      assert.equal(game.score, 0);
    } else {
      game = submit(game, 'AAAAA', 2000).game;
      assert.equal(game.status, 'won');
      assert.equal(game.guesses.length, 6);
    }
    assert.equal(submit(game, 'AAAAA', 3000).game, game);
  }
});

test('rejection does not consume a guess or start time', () => {
  const game = fresh();
  for (const word of ['AB', 'ABÀCD', 'ZZZZZ']) {
    const result = submit(game, word, 1000);
    assert.equal(result.game, game);
    assert.ok(result.error);
    assert.equal(game.startedAt, null);
  }
  const played = submit(game, 'BBBBB', 1000).game;
  assert.equal(submit(played, 'BBBBB', 2000).game, played);
  assert.equal(setDraft(played, 'B'), played);
});

test('hard mode uses maximum observed multiplicity rather than sum', () => {
  const guesses: Guess[] = [
    { word: 'AACCC', feedback: ['yellow', 'green', 'gray', 'gray', 'gray'] },
    { word: 'CAAAC', feedback: ['gray', 'green', 'yellow', 'gray', 'gray'] },
  ];
  const constraints = hardConstraints(guesses);
  assert.equal(constraints.minimum.A, 2);
  assert.equal(constraints.green[1], 'A');
  assert.ok(constraints.excluded[0].has('A'));
  assert.ok(constraints.excluded[2].has('A'));
  const game: Game = { ...fresh(true), guesses, startedAt: 1000, status: 'playing' };
  const allowed = new Set(['DADDD', 'DADDA']);
  assert.ok(submitGuess(game, 'DADDD', allowed, 2000).error);
  assert.equal(submitGuess(game, 'DADDA', allowed, 2000).accepted, true);
});

test('score applies row deltas, consecutive stagnation and one final rounding', () => {
  const rows: Pick<Guess, 'feedback'>[] = [
    { feedback: ['green', 'gray', 'gray', 'gray', 'gray'] },
    { feedback: ['green', 'gray', 'gray', 'gray', 'gray'] },
    { feedback: ['gray', 'gray', 'gray', 'gray', 'gray'] },
    { feedback: ['green', 'yellow', 'gray', 'gray', 'gray'] },
  ];
  // 1000 + 100 + 0 - 50 + 140 = 1190; 30 seconds and four guesses.
  assert.equal(scoreGame(rows, 1000, 31000, false), Math.round(1190 / 6));
  assert.equal(scoreGame(rows, 1000, 31000, true), Math.round(1190 / 6 * 1.1));
  assert.notEqual(scoreGame(rows, 1000, 1000, true), Math.round(Math.round(1190 / 4) * 1.1));
});

test('first win has zero elapsed time; reopening preserves start and downgrade removes bonus', () => {
  const first = submit(fresh(true), 'AAAAA', 12345).game;
  assert.equal(first.startedAt, first.endedAt);
  assert.equal(first.score, 1650);
  let game = submit(fresh(true), 'BBBBB', 1000).game;
  game = JSON.parse(JSON.stringify(game));
  game = setHard(game, false);
  assert.equal(game.bonusEligible, false);
  assert.equal(setHard(game, true), game);
  game = submit(game, 'AAAAA', 61000).game;
  assert.equal(game.startedAt, 1000);
  assert.equal(game.score, scoreGame(game.guesses, 1000, 61000, false));
});

test('expiry uses the actual supplied boundary and ignores unstarted games for results', () => {
  const unstarted = expireGame(fresh(), 5000);
  assert.equal(unstarted.endedAt, null);
  assert.equal(unstarted.score, null);
  const started = expireGame(submit(fresh(), 'BBBBB', 1000).game, 5000);
  assert.equal(started.endedAt, 5000);
  assert.equal(started.score, 0);
  assert.equal(expireGame(started, 9000), started);
});
