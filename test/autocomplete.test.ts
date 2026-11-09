import { describe, expect, it } from 'vitest';
import { createGame, editDraft, expireGame, fixedLetters, scoreGame, setHard, submitGuess } from '../src/game';
import { validatePersistedGame } from '../src/persisted-game';
import { changeAutocomplete, reconcile, type Session } from '../src/session';
import { defaultPreferences } from '../src/preferences';

const allowed = new Set(['AACCC', 'ABACC', 'ABACA', 'ADADA', 'AAAAA', 'BBBBB']);
const initial = (hard = false) => createGame({ date: '2026-01-01', solution: 'ABACA', scheduleId: 'v1', hard, autocomplete: true });

describe('autocomplete drafts', () => {
  it('accumulates duplicate and noncontiguous greens, skipping them on entry and deletion', () => {
    let game = submitGuess(initial(), 'AACCC', allowed, 1000).game;
    expect(game.draft).toBe('A  C ');
    expect(fixedLetters(game)).toEqual(['A', '', '', 'C', '']);
    game = editDraft(editDraft(editDraft(game, 'B'), 'A'), 'A');
    expect(game.draft).toBe('ABACA');
    expect(editDraft(game, 'A').draft).toBe('ABACA');
    game = editDraft(game, 'Backspace');
    expect(game.draft).toBe('ABAC ');
    const rejected = submitGuess(game, game.draft, allowed, 2000);
    expect(rejected.accepted).toBe(false);
    expect(rejected.game).toBe(game);
    game = editDraft(editDraft(game, 'Backspace'), 'Backspace');
    expect(editDraft(game, 'Backspace').draft).toBe('A  C ');
    const second = submitGuess(game, 'ABACA', allowed, 3000);
    expect(second.game.status).toBe('won');
    expect(second.game.draft).toBe('');
    expect(editDraft(second.game, 'A')).toBe(second.game);
  });

  it('restores positional drafts and keeps legacy records disabled', () => {
    const played = submitGuess(initial(), 'AACCC', allowed, 1000).game;
    const draft = editDraft(played, 'B');
    expect(validatePersistedGame(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
    const legacy = createGame({ date: '2026-01-01', solution: 'ABACA', scheduleId: 'v1' });
    delete legacy.autocomplete;
    expect(validatePersistedGame(JSON.parse(JSON.stringify(legacy))).autocomplete).toBeUndefined();
    expect(expireGame(draft, 5000).score).toBe(0);
  });

  it('accumulates greens across rows without inventing duplicate positions', () => {
    const first = submitGuess(initial(), 'AACCC', allowed, 1000).game;
    const second = submitGuess(first, 'ABACC', allowed, 2000).game;
    expect(second.draft).toBe('ABAC ');
    expect(fixedLetters(second)).toEqual(['A', 'B', 'A', 'C', '']);
    expect(editDraft(second, 'A').draft).toBe('ABACA');
  });

  it('locks the per-game choice only on acceptance and retains future choices after completion', () => {
    const game = initial();
    const session: Session = { preferences: defaultPreferences(), games: { [game.date]: game } };
    expect(submitGuess(game, 'NO', allowed, 1).game).toBe(game);
    expect(changeAutocomplete(session, game, false)).toBe(true);
    expect(changeAutocomplete(session, session.games[game.date], true)).toBe(true);
    const playing = submitGuess(session.games[game.date], 'AACCC', allowed, 2).game;
    expect(changeAutocomplete(session, playing, false)).toBe(false);
    expect(session.preferences.autocomplete).toBe(true);
    const won = submitGuess(playing, 'ABACA', allowed, 3).game;
    session.games[game.date] = won;
    expect(changeAutocomplete(session, won, false)).toBe(true);
    expect(session.games[game.date].score).toBe(won.score);
    expect(reconcile(session, Date.parse('2026-01-02T12:00:00Z'))!.autocomplete).toBe(false);
  });

  it('applies both score multipliers before one rounding, including first-guess wins', () => {
    const won = submitGuess(initial(), 'ABACA', allowed, 10).game;
    expect(won.score).toBe(1470);
    const hardWon = submitGuess(initial(true), 'ABACA', allowed, 10).game;
    expect(hardWon.score).toBe(1617);
    const rows = [{ feedback: ['green', 'gray', 'gray', 'gray', 'gray'] as const }];
    const mutable = rows.map(row => ({ feedback: [...row.feedback] }));
    expect(scoreGame(mutable, 0, 17000, true, true)).toBe(Math.round(1100 / (1 + 17 / 60) * 1.1 * 0.98));
    const played = submitGuess(initial(true), 'AACCC', allowed, 0).game;
    expect(setHard(played, false).bonusEligible).toBe(false);
  });

  it('applies autocomplete without prior green help and after a hard downgrade', () => {
    const words = new Set(['BBBBB', 'AAAAA', 'AACCC', 'ABACA']);
    let noHelp = createGame({ date: '2026-01-01', solution: 'AAAAA', scheduleId: 'v1', autocomplete: true });
    noHelp = submitGuess(noHelp, 'BBBBB', words, 1000).game;
    expect(noHelp.draft).toBe('     ');
    noHelp = submitGuess(noHelp, 'AAAAA', words, 2000).game;
    expect(noHelp.score).toBe(scoreGame(noHelp.guesses, 1000, 2000, false, true));
    let downgraded = submitGuess(initial(true), 'AACCC', words, 1000).game;
    downgraded = setHard(downgraded, false);
    downgraded = submitGuess(downgraded, 'ABACA', words, 2000).game;
    expect(downgraded.score).toBe(scoreGame(downgraded.guesses, 1000, 2000, false, true));
  });
});
