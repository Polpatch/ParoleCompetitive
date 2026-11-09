import { ACTIVATION_DATE, boundaryAfter, romeDate, wordForDate, allowedGuesses, challengeForSelection, validateSelection, type DailySelection } from './daily-word';
import { createGame, expireGame, setDraft, setHard, submitGuess, type Game } from './game';
import { defaultPreferences, selectDifficulty, selectSpoilerFree, type Difficulty, type Preferences } from './preferences';
import { hasValidAssignment, validatePersistedGame } from './persisted-game';

export const SESSION_KEY = 'parolecompetitive:session:v1';
const CUTOVER = 'secret-selection-2026-11-08';
export interface Session { preferences: Preferences; games: Record<string, Game>; publicGames?: Record<string, Game>; cutover?: string; cutoverGame?: Game }

export function readSession(storage: Pick<Storage, 'getItem'>): Session {
  const raw = storage.getItem(SESSION_KEY);
  if (raw === null) return { preferences: defaultPreferences(), games: {} };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Invalid saved session');
  const session = value as Session;
  if (!session.preferences || !['standard', 'hard'].includes(session.preferences.difficulty) || typeof session.preferences.spoilerFree !== 'boolean' || !session.games || typeof session.games !== 'object') throw new Error('Invalid saved session');
  if (session.preferences.appearance === undefined) session.preferences.appearance = 'system';
  else if (!['system', 'light', 'dark'].includes(session.preferences.appearance)) throw new Error('Invalid saved session');
  if (session.preferences.autocomplete === undefined) session.preferences.autocomplete = false;
  else if (typeof session.preferences.autocomplete !== 'boolean') throw new Error('Invalid saved session');
  if (session.cutover !== undefined && typeof session.cutover !== 'string') throw new Error('Invalid cutover marker');
  if (session.cutoverGame !== undefined && session.cutover === CUTOVER) {
    const saved = validatePersistedGame(session.cutoverGame);
    if (saved.date !== ACTIVATION_DATE || !hasValidAssignment(saved) ||
        !allowedGuesses.has(saved.solution) || saved.guesses.some(guess => !allowedGuesses.has(guess.word))) throw new Error('Invalid cutover game');
  }
  for (const [date, saved] of Object.entries(session.games)) {
    const game = validatePersistedGame(saved);
    if (game.date !== date || !allowedGuesses.has(game.solution) || game.guesses.some(guess => !allowedGuesses.has(guess.word))) throw new Error('Invalid saved game');
  }
  if (session.publicGames !== undefined) {
    if (!session.publicGames || typeof session.publicGames !== 'object' || Array.isArray(session.publicGames)) throw new Error('Invalid public games');
    for (const [date, saved] of Object.entries(session.publicGames)) {
      const game = validatePersistedGame(saved);
      if (date <= ACTIVATION_DATE || game.date !== date || hasValidAssignment(game) ||
          !allowedGuesses.has(game.solution) || game.guesses.some(guess => !allowedGuesses.has(guess.word))) throw new Error('Invalid public game');
    }
  }
  return session;
}

/** Withdraw the superseded activation-day challenge before ordinary expiry. */
export function reconcileCutover(session: Session, now: number): boolean {
  if (romeDate(now) < ACTIVATION_DATE) return false;
  const affected = session.games[ACTIVATION_DATE];
  const withdrawn = !!affected && !hasValidAssignment(affected);
  if (withdrawn) {
    if (session.cutover === CUTOVER && session.cutoverGame) session.games[ACTIVATION_DATE] = session.cutoverGame;
    else delete session.games[ACTIVATION_DATE];
  }
  if (session.cutover !== CUTOVER) delete session.cutoverGame;
  session.cutover = CUTOVER;
  return withdrawn;
}

export function reconcile(session: Session, now: number, selection?: DailySelection): Game | null {
  const date = romeDate(now);
  reconcileCutover(session, now);
  for (const [savedDate, saved] of Object.entries(session.games)) {
    if (savedDate > ACTIVATION_DATE && !hasValidAssignment(saved)) {
      session.publicGames ??= {};
      if (!session.publicGames[savedDate]) session.publicGames[savedDate] = saved;
      delete session.games[savedDate];
    }
  }
  for (const [savedDate, saved] of Object.entries(session.publicGames ?? {})) {
    if (savedDate < date && (saved.status === 'ready' || saved.status === 'playing'))
      session.publicGames![savedDate] = expireGame(saved, boundaryAfter(savedDate));
  }
  for (const [previousDate, game] of Object.entries(session.games)) {
    if (previousDate < date && (previousDate < ACTIVATION_DATE || hasValidAssignment(game)) &&
        (game.status === 'ready' || game.status === 'playing')) session.games[previousDate] = expireGame(game, boundaryAfter(previousDate));
  }
  const existing = session.games[date];
  if (existing && (date < ACTIVATION_DATE || hasValidAssignment(existing))) return existing;
  if (date >= ACTIVATION_DATE) {
    const acquired = validateSelection(selection, date);
    if (!acquired || existing) return null;
    const challenge = challengeForSelection(acquired);
    const game = createGame({ date, solution: challenge.word, scheduleId: challenge.scheduleVersion, hard: session.preferences.difficulty === 'hard', autocomplete: session.preferences.autocomplete });
    session.games[date] = { ...game, selection: acquired } as Game;
  } else if (!existing) {
    const challenge = wordForDate(date);
    session.games[date] = createGame({ date, solution: challenge.word, scheduleId: challenge.scheduleVersion, hard: session.preferences.difficulty === 'hard', autocomplete: session.preferences.autocomplete });
  }
  return session.games[date] ?? null;
}

export function changeDifficulty(session: Session, game: Game, difficulty: Difficulty): boolean {
  const result = selectDifficulty(session.preferences, game, difficulty, setHard);
  if (!result.allowed || !result.game) return false;
  session.preferences = result.preferences;
  session.games[game.date] = result.game;
  return true;
}

export function changeAutocomplete(session: Session, game: Game, enabled: boolean): boolean {
  if (game.status === 'playing') return false;
  session.preferences = { ...session.preferences, autocomplete: enabled };
  if (game.status === 'ready') session.games[game.date] = { ...game, autocomplete: enabled };
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

export function writeSession(storage: Pick<Storage, 'setItem'> & Partial<Pick<Storage, 'getItem'>>, session: Session): void {
  const previous = storage.getItem?.(SESSION_KEY);
  const priorSession = previous ? JSON.parse(previous) as Session : undefined;
  for (const [date, game] of Object.entries(session.games)) {
    if (date >= ACTIVATION_DATE && !hasValidAssignment(game)) throw new Error('Refusing obsolete public challenge');
    const prior = priorSession?.games[date];
    if (prior && hasValidAssignment(prior) && hasValidAssignment(game) &&
        (prior as Game & { selection: DailySelection }).selection.index !==
        (game as Game & { selection: DailySelection }).selection.index) throw new Error('Refusing conflicting acquired selection');
  }
  for (const [date, game] of Object.entries(session.publicGames ?? {})) {
    const prior = priorSession?.publicGames?.[date] ?? priorSession?.games[date];
    if (!prior || hasValidAssignment(prior) ||
        (JSON.stringify(prior) !== JSON.stringify(game) &&
         JSON.stringify(expireGame(prior, boundaryAfter(date))) !== JSON.stringify(game)))
      throw new Error('Refusing obsolete public challenge');
  }
  const activationGame = session.games[ACTIVATION_DATE];
  if (session.cutover === CUTOVER && activationGame && hasValidAssignment(activationGame)) session.cutoverGame = activationGame;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}
