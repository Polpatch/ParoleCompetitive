import { describe, expect, it } from 'vitest';
import { createGame, expireGame, setDraft, setHard, submitGuess } from '../src/game';
import { validatePersistedGame } from '../src/persisted-game';

const allowed = new Set(['SALTO', 'SANTO', 'TASCA']);
const initial = () => createGame({ date: '2026-03-29', solution: 'SALTO', scheduleId: 'historic-v1', hard: true });
const roundTrip = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe('persisted game validation', () => {
  it('restores accepted feedback, draft, difficulty and original start after closure', () => {
    const first = submitGuess(initial(), 'SANTO', allowed, 1000).game;
    const draft = setDraft(setHard(first, false), 'TAS');
    const restored = validatePersistedGame(roundTrip(draft));
    expect(restored).toEqual(draft);
    const won = submitGuess(restored, 'SALTO', allowed, 61000).game;
    expect(validatePersistedGame(roundTrip(won))).toEqual(won);
    expect(won.startedAt).toBe(1000);
    expect(won.endedAt).toBe(61000);
  });

  it('accepts both started and unstarted expiry records', () => {
    const first = submitGuess(initial(), 'SANTO', allowed, 1000).game;
    for (const game of [expireGame(initial(), 2000), expireGame(first, 2000)]) {
      expect(validatePersistedGame(roundTrip(game))).toEqual(game);
    }
  });

  it('rejects invalid identities, feedback, timing and terminal scores', () => {
    const first = submitGuess(initial(), 'SANTO', allowed, 1000).game;
    const won = submitGuess(first, 'SALTO', allowed, 2000).game;
    const corrupt = [
      { ...first, scheduleId: '' },
      { ...first, solution: 'salto' },
      { ...first, guesses: [{ word: 'SANTO', feedback: ['green', 'green', 'green', 'green', 'green'] }] },
      { ...first, startedAt: null },
      { ...first, status: 'lost', score: 0, endedAt: 2000 },
      { ...won, score: 1 },
      { ...won, draft: 'A' },
      { ...first, bonusEligible: true, hard: false },
    ];
    for (const value of corrupt) expect(() => validatePersistedGame(roundTrip(value))).toThrow();
  });
});
