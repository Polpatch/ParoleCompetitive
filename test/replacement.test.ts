import { test } from 'vitest';
import assert from 'node:assert/strict';
import { ACTIVATION_DATE, allowedGuesses, boundaryAfter } from '../src/daily-word';
import { createGame, editDraft, evaluateGuess, expireGame, submitGuess, type Game } from '../src/game';
import { defaultPreferences } from '../src/preferences';
import { readSession, reconcile, reconcileCutover, writeSession, type Session } from '../src/session';
import { deriveStatistics } from '../src/statistics';
import { allowedWords, vocabularyId } from '../src/word-data';

const selection = { schema: 1 as const, date: ACTIVATION_DATE, vocabularyId, challengeId: `hmac-v1:${ACTIVATION_DATE}:${vocabularyId}`, index: allowedWords.indexOf('AMORE') };

const activation = Date.parse(`${ACTIVATION_DATE}T12:00:00Z`);
const oldGame = (status: Game['status']): Game => {
  const ready = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' });
  if (status === 'ready') return { ...ready, draft: 'AM' };
  const playing = submitGuess(ready, 'AUDIO', allowedGuesses, activation).game;
  if (status === 'playing') return playing;
  if (status === 'won') return submitGuess(ready, 'AMORE', allowedGuesses, activation).game;
  if (status === 'expired') return expireGame(playing, boundaryAfter(ACTIVATION_DATE));
  return { ...playing, guesses: Array.from({ length: 6 }, () => ({ word: 'AUDIO', feedback: evaluateGuess('AMORE', 'AUDIO') })), status: 'lost', endedAt: activation + 1, score: 0 };
};
const earlier = submitGuess(createGame({ date: '2026-01-01', solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', allowedGuesses, 1).game;
const state = (game: Game): Session => ({ preferences: { ...defaultPreferences(), difficulty: 'hard', spoilerFree: false }, games: { [earlier.date]: earlier, [ACTIVATION_DATE]: game } });
const storage = () => {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
};

for (const status of ['ready', 'playing', 'won', 'lost', 'expired'] as const) {
  test(`withdraws an old ${status} challenge without a result, including delayed discovery`, () => {
    for (const delayed of [false, true]) {
      const session = state(oldGame(status));
      const now = delayed ? boundaryAfter(ACTIVATION_DATE) + 12 * 3600000 : activation;
      const preferences = { ...session.preferences };
      assert.equal(reconcileCutover(session, now), true);
      assert.equal(session.games[ACTIVATION_DATE], undefined);
      const current = reconcile(session, now, delayed ? undefined : selection);
      assert.deepEqual(session.preferences, preferences);
      assert.deepEqual(session.games[earlier.date], earlier);
      assert.equal(deriveStatistics(session.games).wins, 1);
      assert.equal(deriveStatistics(session.games).losses, 0);
      if (delayed) assert.equal(session.games[ACTIVATION_DATE], undefined);
      else {
        assert.equal(current!.scheduleId, selection.challengeId);
        assert.equal(current!.status, 'ready');
        assert.deepEqual(current!.guesses, []);
        assert.equal(current!.draft, '');
        assert.equal(current!.startedAt, null);
        assert.equal(current!.endedAt, null);
        assert.equal(current!.score, null);
        assert.equal(current!.hard, true);
      }
    }
  });
}
test('schedule identity distinguishes challenges even when their solutions match', () => {
  const solution = 'AMORE';
  const session = state(createGame({ date: ACTIVATION_DATE, solution, scheduleId: 'v1' }));
  const replacement = reconcile(session, activation, selection)!;
  assert.equal(replacement.solution, solution);
  assert.equal(replacement.scheduleId, selection.challengeId);
  assert.equal(replacement.status, 'ready');
});


test('serialized reopening preserves new progress and cannot restore a stale old challenge', () => {
  const session = state(oldGame('won'));
  const fresh = reconcile(session, activation, selection)!;
  const replacement = submitGuess(fresh, fresh.solution, allowedGuesses, activation + 1).game;
  session.games[ACTIVATION_DATE] = replacement;
  const saved = storage();
  writeSession(saved, session);
  const reopened = readSession(saved);
  assert.deepEqual(reconcile(reopened, activation), replacement);
  assert.equal(reconcileCutover(reopened, activation), false);
  assert.equal(deriveStatistics(reopened.games).wins, 2);
  reopened.games[ACTIVATION_DATE] = oldGame('playing');
  assert.equal(reconcileCutover(reopened, activation), true);
  assert.deepEqual(reopened.games[ACTIVATION_DATE], replacement);
  assert.equal(deriveStatistics(reopened.games).losses, 0);
});

test('replacement uses future autocomplete and preserves its own positional draft on reopening', () => {
  const previous = oldGame('playing');
  previous.autocomplete = true;
  previous.draft = 'A M  ';
  const session = state(previous);
  session.preferences.autocomplete = true;
  const fresh = reconcile(session, activation, selection)!;
  assert.equal(fresh.autocomplete, true);
  assert.equal(fresh.draft, '');
  assert.deepEqual(fresh.guesses, []);
  const first = editDraft(submitGuess(fresh, 'AUDIO', allowedGuesses, activation + 1).game, 'E');
  if (first.status !== 'playing') throw new Error('Expected a nonterminal replacement');
  assert.equal(first.draft, 'AE   ');
  session.games[ACTIVATION_DATE] = first;
  const saved = storage();
  writeSession(saved, session);
  const loaded = readSession(saved);
  assert.deepEqual(reconcile(loaded, activation), first);
  loaded.games[ACTIVATION_DATE] = previous;
  assert.equal(reconcileCutover(loaded, activation), true);
  assert.deepEqual(loaded.games[ACTIVATION_DATE], first);
});
