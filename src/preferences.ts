export type Difficulty = 'standard' | 'hard';
export type Appearance = 'system' | 'light' | 'dark';
export interface Preferences {
  difficulty: Difficulty;
  spoilerFree: boolean;
  appearance: Appearance;
  autocomplete?: boolean;
}

/** Minimal game state needed by the preference transition. */
export interface PreferenceGame {
  status: 'ready' | 'playing' | 'won' | 'lost' | 'expired';
  hard: boolean;
}

export function defaultPreferences(): Preferences {
  return { difficulty: 'standard', spoilerFree: true, appearance: 'system', autocomplete: false };
}

function validatePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object') throw new TypeError('Invalid game preferences');
  const preferences = value as Record<string, unknown>;
  if ((preferences.difficulty !== 'standard' && preferences.difficulty !== 'hard') ||
      typeof preferences.spoilerFree !== 'boolean' ||
      (preferences.appearance !== undefined && !['system', 'light', 'dark'].includes(preferences.appearance as string)) ||
      (preferences.autocomplete !== undefined && typeof preferences.autocomplete !== 'boolean')) {
    throw new TypeError('Invalid game preferences');
  }
  return { difficulty: preferences.difficulty, spoilerFree: preferences.spoilerFree, appearance: (preferences.appearance ?? 'system') as Appearance, autocomplete: (preferences.autocomplete ?? false) as boolean };
}


/** Whether the requested difficulty is selectable for the current game. */
export function canSelectDifficulty(game: PreferenceGame | null, difficulty: Difficulty): boolean {
  if (difficulty !== 'standard' && difficulty !== 'hard') throw new TypeError('Invalid difficulty');
  return !(game && game.status === 'playing' && !game.hard && difficulty === 'hard');
}

/**
 * Select a future preference and, while a game is unfinished, transition it
 * through the game engine's setHard(game, enabled) function. A forbidden
 * upgrade leaves both values unchanged. Terminal records are never changed.
 * The caller must commit the returned preference and game together through its
 * serialized persistence mechanism, and handle storage errors visibly.
 */
export function selectDifficulty<T extends PreferenceGame>(
  preferences: Preferences,
  game: T | null,
  difficulty: Difficulty,
  setHard: (game: T, enabled: boolean) => T,
): { preferences: Preferences; game: T | null; allowed: boolean } {
  const current = validatePreferences(preferences);
  if (!canSelectDifficulty(game, difficulty)) return { preferences: current, game, allowed: false };
  const active = game && (game.status === 'ready' || game.status === 'playing');
  const nextGame = active && game.hard !== (difficulty === 'hard')
    ? setHard(game, difficulty === 'hard')
    : game;
  return { preferences: { ...current, difficulty }, game: nextGame, allowed: true };
}

/** Change sharing privacy without changing a game or a previously shared item. */
export function selectSpoilerFree(preferences: Preferences, enabled: boolean): Preferences {
  if (typeof enabled !== 'boolean') throw new TypeError('Invalid spoiler preference');
  return { ...validatePreferences(preferences), spoilerFree: enabled };
}
