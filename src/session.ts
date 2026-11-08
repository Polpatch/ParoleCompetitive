import { boundaryAfter, romeDate, wordForDate, allowedGuesses } from './daily-word';
import { createGame, expireGame, setDraft, setHard, submitGuess, type Game } from './game';
import { defaultPreferences, selectDifficulty, selectSpoilerFree, type Difficulty, type Preferences } from './preferences';
import { validatePersistedGame } from './persisted-game';

export const SESSION_KEY = 'parolecompetitive:session:v1';
export interface Session { preferences: Preferences; games: Record<string, Game> }

export function readSession(storage: Pick<Storage, 'getItem'>): Session {
  const raw = storage.getItem(SESSION_KEY);
  if (raw === null) return { preferences: defaultPreferences(), games: {} };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Invalid saved session');
  const session = value as Session;
  if (!session.preferences || !['standard', 'hard'].includes(session.preferences.difficulty) || typeof session.preferences.spoilerFree !== 'boolean' || !session.games || typeof session.games !== 'object') throw new Error('Invalid saved session');
  for (const [date, saved] of Object.entries(session.games)) {
    const game = validatePersistedGame(saved);
    if (game.date !== date || !allowedGuesses.has(game.solution) || game.guesses.some(guess => !allowedGuesses.has(guess.word))) throw new Error('Invalid saved game');
  }
  return session;
}

export function reconcile(session: Session, now: number): Game {
  const date = romeDate(now);
  for (const [previousDate, game] of Object.entries(session.games)) {
    if (previousDate < date && (game.status === 'ready' || game.status === 'playing')) session.games[previousDate] = expireGame(game, boundaryAfter(previousDate));
  }
  if (!session.games[date]) {
    const challenge = wordForDate(date);
    session.games[date] = createGame({ date, solution: challenge.word, scheduleId: challenge.scheduleVersion, hard: session.preferences.difficulty === 'hard' });
  }
  return session.games[date];
}

export function changeDifficulty(session: Session, game: Game, difficulty: Difficulty): boolean {
  const result = selectDifficulty(session.preferences, game, difficulty, setHard);
  if (!result.allowed || !result.game) return false;
  session.preferences = result.preferences;
  session.games[game.date] = result.game;
  return true;
}

export function changeSpoilerFree(session: Session, enabled: boolean): void {
  session.preferences = selectSpoilerFree(session.preferences, enabled);
}

export function changeDraft(session: Session, game: Game, draft: string): void {
  session.games[game.date] = setDraft(game, draft);
}

export function playGuess(session: Session, game: Game, now: number): string | null {
  const result = submitGuess(game, game.draft, allowedGuesses, now);
  session.games[game.date] = result.game;
  return result.error;
}

export function writeSession(storage: Pick<Storage, 'setItem'>, session: Session): void {
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}
