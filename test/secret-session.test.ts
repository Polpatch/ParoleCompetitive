import { test } from 'vitest';
import assert from 'node:assert/strict';
import { ACTIVATION_DATE, allowedGuesses, boundaryAfter, challengeForSelection, type DailySelection } from '../src/daily-word';
import { createGame, expireGame, submitGuess, type Game } from '../src/game';
import { defaultPreferences } from '../src/preferences';
import { readSession, reconcile, reconcileCutover, SESSION_KEY, writeSession, type Session } from '../src/session';
import { allowedWords, vocabularyId } from '../src/word-data';

const selection = (date = ACTIVATION_DATE): DailySelection => ({ schema: 1, date, vocabularyId, challengeId: `hmac-v1:${date}:${vocabularyId}`, index: allowedWords.indexOf('AMORE') });
const instant = (date: string) => Date.parse(`${date}T12:00:00Z`);
const storage = () => {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
};
const oldGame = (status: Game['status']): Game => {
  const ready = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1', autocomplete: true });
  const playing = submitGuess(ready, 'AUDIO', allowedGuesses, instant(ACTIVATION_DATE)).game;
  if (status === 'ready') return { ...ready, draft: 'AM' };
  if (status === 'playing') return playing;
  if (status === 'won') return submitGuess(ready, 'AMORE', allowedGuesses, instant(ACTIVATION_DATE)).game;
  if (status === 'expired') return expireGame(playing, boundaryAfter(ACTIVATION_DATE));
  const repeated = Array.from({ length: 6 }, () => playing.guesses[0]);
  return { ...playing, guesses: repeated, draft: '', status: 'lost', endedAt: instant(ACTIVATION_DATE), score: 0 };
};

for (const status of ['ready', 'playing', 'won', 'lost', 'expired'] as const) {
  test(`withdraws ${status} activation record before expiry, even when discovered late`, () => {
    for (const date of [ACTIVATION_DATE, '2026-11-10']) {
      const old = oldGame(status);
      const earlier = createGame({ date: '2026-11-07', solution: 'AMORE', scheduleId: 'v1' });
      const later = createGame({ date: '2026-11-09', solution: 'AMORE', scheduleId: 'v2' });
      const state: Session = { preferences: { ...defaultPreferences(), autocomplete: false }, games: { [old.date]: old, [earlier.date]: earlier, [later.date]: later } };
      const result = reconcile(state, instant(date), date === ACTIVATION_DATE ? selection() : undefined);
      assert.equal(state.games[earlier.date].status, 'expired');
      assert.deepEqual(state.publicGames?.[later.date], date > later.date ? expireGame(later, boundaryAfter(later.date)) : later);
      if (date === ACTIVATION_DATE) {
        assert.equal(result?.status, 'ready');
        assert.equal(result?.autocomplete, false);
        assert.equal(result?.draft, '');
        assert.equal(result?.startedAt, null);
        assert.deepEqual(result?.guesses, []);
      } else {
        assert.equal(result, null);
        assert.equal(state.games[ACTIVATION_DATE], undefined);
      }
      assert.equal(reconcileCutover(state, instant(date)), false);
    }
  });
}

test('saved acquired assignment restores progress without a network selection', () => {
  const saved = storage();
  const state = readSession(saved);
  const game = reconcile(state, instant(ACTIVATION_DATE), selection())!;
  const played = submitGuess(game, 'AUDIO', allowedGuesses, instant(ACTIVATION_DATE)).game;
  state.games[game.date] = { ...played, draft: 'RA' };
  writeSession(saved, state);
  const loaded = readSession(saved);
  assert.deepEqual(reconcile(loaded, instant(ACTIVATION_DATE)), state.games[game.date]);
  assert.deepEqual((loaded.games[game.date] as Game & { selection: DailySelection }).selection, selection());
  loaded.games[game.date] = oldGame('won');
  assert.equal(reconcileCutover(loaded, instant(ACTIVATION_DATE)), true);
  assert.deepEqual(loaded.games[game.date], state.games[game.date]);
  writeSession(saved, loaded);
  assert.deepEqual(readSession(saved).games[game.date], state.games[game.date]);
});

test('selection absence still expires earlier games and does not create or start today', () => {
  const previous = submitGuess(createGame({ date: '2026-11-07', solution: 'AMORE', scheduleId: 'v1' }), 'AUDIO', allowedGuesses, 10).game;
  const state: Session = { preferences: defaultPreferences(), games: { [previous.date]: previous } };
  assert.equal(reconcile(state, instant(ACTIVATION_DATE)), null);
  assert.equal(state.games[ACTIVATION_DATE], undefined);
  assert.equal(state.games[previous.date].endedAt, boundaryAfter(previous.date));
  assert.equal(state.games[previous.date].score, 0);
});

test('acquired and retained public post-activation games expire at the day boundary', () => {
  const date = '2026-11-09';
  const acquiredState: Session = { preferences: defaultPreferences(), games: {} };
  const acquired = reconcile(acquiredState, instant(date), selection(date))!;
  acquiredState.games[date] = submitGuess(acquired, 'AUDIO', allowedGuesses, instant(date)).game;
  assert.equal(reconcile(acquiredState, instant('2026-11-10')), null);
  assert.equal(acquiredState.games[date].endedAt, boundaryAfter(date));
  assert.equal(acquiredState.games[date].score, 0);

  const stale = submitGuess(createGame({ date, solution: 'AMORE', scheduleId: 'v2' }), 'AUDIO', allowedGuesses, instant(date)).game;
  const saved = storage();
  saved.setItem(SESSION_KEY, JSON.stringify({ preferences: defaultPreferences(), games: { [date]: stale } }));
  const state = readSession(saved);
  assert.equal(reconcile(state, instant('2026-11-10')), null);
  assert.deepEqual(state.publicGames?.[date], expireGame(stale, boundaryAfter(date)));
  writeSession(saved, state);
  state.games[date] = stale;
  assert.throws(() => writeSession(saved, state), /obsolete/);
});

test('rejects modified assignment and obsolete public writes without replacing stored data', () => {
  const saved = storage();
  const state = readSession(saved);
  const current = reconcile(state, instant(ACTIVATION_DATE), selection())!;
  writeSession(saved, state);
  const original = saved.getItem();
  state.games[current.date] = oldGame('playing');
  assert.throws(() => writeSession(saved, state), /obsolete/);
  assert.equal(saved.getItem(), original);
  const corrupt = JSON.parse(original!);
  corrupt.games[current.date].selection.index = (selection().index + 1) % allowedWords.length;
  assert.throws(() => readSession({ getItem: () => JSON.stringify(corrupt) }), /selection/);
  const valid = selection();
  assert.equal(challengeForSelection(valid).word, 'AMORE');
  assert.equal(saved.getItem(), original);
});

test('a conflicting same-day assignment cannot replace a retained game', () => {
  const saved = storage();
  const first = readSession(saved);
  const retained = reconcile(first, instant(ACTIVATION_DATE), selection())!;
  first.games[retained.date] = submitGuess(retained, 'AUDIO', allowedGuesses, instant(ACTIVATION_DATE)).game;
  writeSession(saved, first);
  const original = saved.getItem();

  const conflicting = { ...selection(), index: (selection().index + 1) % allowedWords.length };
  assert.deepEqual(reconcile(readSession(saved), instant(ACTIVATION_DATE), conflicting), first.games[retained.date]);

  const stale = { preferences: defaultPreferences(), games: {} };
  reconcile(stale, instant(ACTIVATION_DATE), conflicting);
  assert.throws(() => writeSession(saved, stale), /conflicting acquired selection/);
  assert.equal(saved.getItem(), original);
});
