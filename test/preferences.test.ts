import { describe, expect, it } from 'vitest';
import { createGame, setHard, submitGuess } from '../src/game';
import { canSelectDifficulty, defaultPreferences, selectDifficulty, selectSpoilerFree } from '../src/preferences';

function newGame(hard = false, date = '2026-11-08') {
  return createGame({ date, solution: 'CASA' + 'E', scheduleId: 'v1', hard });
}

describe('game preferences', () => {

  it('permits both directions until the first accepted guess, including after rejection', () => {
    let game = newGame();
    let prefs = defaultPreferences();
    const rejected = submitGuess(game, 'NO', new Set(), 1000);
    expect(rejected.accepted).toBe(false);
    let selected = selectDifficulty(prefs, rejected.game, 'hard', setHard);
    game = selected.game!;
    prefs = selected.preferences;
    expect(game.hard).toBe(true);
    expect(game.bonusEligible).toBe(true);
    selected = selectDifficulty(prefs, game, 'standard', setHard);
    game = selected.game!;
    prefs = selected.preferences;
    expect(game.hard).toBe(false);
    selected = selectDifficulty(prefs, game, 'hard', setHard);
    game = selected.game!;
    prefs = selected.preferences;
    expect(game.bonusEligible).toBe(true);
    expect(prefs.difficulty).toBe('hard');
  });

  it('forfeits the bonus on an active downgrade and refuses an upgrade', () => {
    const started = submitGuess(newGame(true), 'PARTE', new Set(['PARTE']), 1000).game;
    const downgraded = selectDifficulty({ difficulty: 'hard', spoilerFree: true, appearance: 'system' }, started, 'standard', setHard);
    expect(downgraded.game!.hard).toBe(false);
    expect(downgraded.game!.startedHard).toBe(true);
    expect(downgraded.game!.bonusEligible).toBe(false);
    expect(downgraded.preferences.difficulty).toBe('standard');
    expect(canSelectDifficulty(downgraded.game, 'hard')).toBe(false);
    const refused = selectDifficulty(downgraded.preferences, downgraded.game, 'hard', setHard);
    expect(refused.allowed).toBe(false);
    expect(refused.game).toBe(downgraded.game);
    expect(refused.preferences).toEqual(downgraded.preferences);
  });

  it('changes only the future preference after a game ends and privacy at any time', () => {
    const won = submitGuess(newGame(), 'CASAE', new Set(['CASAE']), 1000).game;
    const result = selectDifficulty(defaultPreferences(), won, 'hard', setHard);
    expect(result.allowed).toBe(true);
    expect(result.game).toBe(won);
    expect(result.game!.score).toBe(won.score);
    expect(result.preferences.difficulty).toBe('hard');
    const changed = selectSpoilerFree(result.preferences, false);
    expect(changed).toEqual({ difficulty: 'hard', spoilerFree: false, appearance: 'system', autocomplete: false });
    expect(won.hard).toBe(false);
  });
});
