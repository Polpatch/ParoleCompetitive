// Framework-independent daily game rules. Times are epoch milliseconds; dates and
// schedule identifiers are supplied by the daily-word/calendar implementation.
// Callers must serialize and persist the returned record before revealing feedback.
// The daily-word provider must supply a solution from the same allowed dictionary
// passed to submitGuess; its schedule and dictionary must be validated together.

export type Feedback = 'gray' | 'yellow' | 'green';
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost' | 'expired';
export interface Guess { word: string; feedback: Feedback[] }
export interface Game {
  date: string; solution: string; scheduleId: string; guesses: Guess[];
  draft: string; startedAt: number | null; endedAt: number | null;
  status: GameStatus; score: number | null; startedHard: boolean;
  hard: boolean; bonusEligible: boolean;
}

const terminal = new Set(['won', 'lost', 'expired']);
const rank: Record<Feedback, number> = { gray: 1, yellow: 2, green: 3 };

export function createGame({ date, solution, scheduleId, hard = false }: { date: string; solution: string; scheduleId: string; hard?: boolean }): Game {
  if (!/^[A-Z]{5}$/.test(solution)) throw new Error('Invalid solution');
  return { date, solution, scheduleId, guesses: [], draft: '', startedAt: null,
    endedAt: null, status: 'ready', score: null, startedHard: Boolean(hard),
    hard: Boolean(hard), bonusEligible: Boolean(hard) };
}

// Greens consume solution occurrences before yellows are allocated left to right.
export function evaluateGuess(solution: string, word: string): Feedback[] {
  const result: Feedback[] = Array(5).fill('gray');
  const remaining: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (word[i] === solution[i]) result[i] = 'green';
    else remaining[solution[i]] = (remaining[solution[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'green' && remaining[word[i]] > 0) {
      result[i] = 'yellow';
      remaining[word[i]]--;
    }
  }
  return result;
}

export function keyboardKnowledge(guesses: readonly Guess[]): Record<string, Feedback> {
  const keys: Record<string, Feedback> = {};
  for (const { word, feedback } of guesses) {
    for (let i = 0; i < 5; i++) {
      if (!keys[word[i]] || rank[feedback[i]] > rank[keys[word[i]]]) {
        keys[word[i]] = feedback[i];
      }
    }
  }
  return keys;
}

export function hardConstraints(guesses: readonly Guess[]) {
  const green: (string | null)[] = Array(5).fill(null);
  const excluded = Array.from({ length: 5 }, () => new Set<string>());
  const minimum: Record<string, number> = {};
  for (const { word, feedback } of guesses) {
    const count: Record<string, number> = {};
    for (let i = 0; i < 5; i++) {
      if (feedback[i] === 'green') green[i] = word[i];
      if (feedback[i] === 'yellow') excluded[i].add(word[i]);
      if (feedback[i] !== 'gray') count[word[i]] = (count[word[i]] || 0) + 1;
    }
    for (const [letter, amount] of Object.entries(count)) {
      minimum[letter] = Math.max(minimum[letter] || 0, amount);
    }
  }
  return { green, excluded, minimum };
}

export function scoreGame(guesses: readonly Pick<Guess, 'feedback'>[], startedAt: number, endedAt: number, bonusEligible: boolean): number {
  let base = 1000, previousGreen = 0, previousYellow = 0, stagnation = 0;
  for (const { feedback } of guesses) {
    const green = feedback.filter(value => value === 'green').length;
    const yellow = feedback.filter(value => value === 'yellow').length;
    const deltaGreen = Math.max(0, green - previousGreen);
    const deltaYellow = Math.max(0, yellow - previousYellow);
    stagnation = deltaGreen || deltaYellow ? 0 : stagnation + 1;
    base += 100 * deltaGreen + 40 * deltaYellow - 50 * Math.max(0, stagnation - 1);
    previousGreen = green;
    previousYellow = yellow;
  }
  if (!guesses.length) return 0;
  const seconds = Math.max(0, (endedAt - startedAt) / 1000);
  return Math.round(Math.max(0, base) / (guesses.length * (1 + seconds / 60)) * (bonusEligible ? 1.1 : 1));
}

// Difficulty can be selected freely before the first accepted guess. After it,
// only a permanent downgrade is allowed. Returns the unchanged record on refusal.
export function setHard(game: Game, enabled: boolean): Game {
  enabled = Boolean(enabled);
  if (terminal.has(game.status) || (game.startedAt !== null && enabled && !game.hard)) return game;
  if (game.startedAt === null) return { ...game, hard: enabled, startedHard: enabled, bonusEligible: enabled };
  return { ...game, hard: enabled, bonusEligible: game.bonusEligible && enabled };
}

// Draft changes are inert after a terminal outcome; callers enforce reveal locking.
export function setDraft(game: Game, draft: string): Game {
  if (terminal.has(game.status)) return game;
  if (!/^[A-Za-z]{0,5}$/.test(draft)) return game;
  const normalized = draft.toUpperCase();
  const keys = keyboardKnowledge(game.guesses);
  if ([...normalized].some(letter => keys[letter] === 'gray')) return game;
  return { ...game, draft: normalized };
}

// `allowed` is a Set of uppercase, vetted common words including the solution.
// The caller must reconcile concurrent records before calling this function.
// A rejection returns the identical game and an Italian explanation.
export function submitGuess(game: Game, input: string, allowed: ReadonlySet<string>, now: number): { game: Game; error: string | null; accepted: boolean } {
  if (terminal.has(game.status)) return { game, error: null, accepted: false };
  if (typeof input !== 'string' || !/^[A-Za-z]{5}$/.test(input)) {
    return { game, error: 'Inserisci esattamente cinque lettere dalla A alla Z.', accepted: false };
  }
  const word = input.toUpperCase();
  const keys = keyboardKnowledge(game.guesses);
  if ([...word].some(letter => keys[letter] === 'gray')) {
    return { game, error: 'La parola contiene una lettera già esclusa.', accepted: false };
  }
  if (!allowed.has(word)) return { game, error: 'La parola non è presente nel dizionario.', accepted: false };
  if (game.hard) {
    const { green, excluded, minimum } = hardConstraints(game.guesses);
    const counts: Record<string, number> = {};
    for (let i = 0; i < 5; i++) {
      counts[word[i]] = (counts[word[i]] || 0) + 1;
      if ((green[i] && green[i] !== word[i]) || excluded[i].has(word[i])) {
        return { game, error: 'La parola non rispetta gli indizi della modalità difficile.', accepted: false };
      }
    }
    if (Object.entries(minimum).some(([letter, count]) => (counts[letter] || 0) < count)) {
      return { game, error: 'La parola non rispetta gli indizi della modalità difficile.', accepted: false };
    }
  }
  const feedback = evaluateGuess(game.solution, word);
  const guesses = [...game.guesses, { word, feedback }];
  const startedAt = game.startedAt ?? now;
  const won = word === game.solution;
  const lost = !won && guesses.length === 6;
  const endedAt = won || lost ? now : null;
  const next: Game = { ...game, guesses, draft: '', startedAt, endedAt,
    status: won ? 'won' : lost ? 'lost' : 'playing',
    score: won ? scoreGame(guesses, startedAt, now, game.bonusEligible) : lost ? 0 : null };
  return { game: next, error: null, accepted: true };
}

// The calendar supplies the actual Europe/Rome boundary, not discovery time.
export function expireGame(game: Game, boundary: number): Game {
  if (terminal.has(game.status)) return game;
  return { ...game, status: 'expired', endedAt: game.startedAt === null ? null : boundary,
    score: game.startedAt === null ? null : 0 };
}
