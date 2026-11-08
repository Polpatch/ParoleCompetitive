import { evaluateGuess, scoreGame, type Game, type Guess } from './game';

/** Validate a stored game without substituting the current word schedule. */
export function validatePersistedGame(value: unknown): Game {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid game');
  const game = value as Game;
  if (typeof game.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(game.date) ||
      typeof game.solution !== 'string' || !/^[A-Z]{5}$/.test(game.solution) ||
      typeof game.scheduleId !== 'string' || !game.scheduleId ||
      !Array.isArray(game.guesses) || game.guesses.length > 6 ||
      typeof game.draft !== 'string' || !/^[A-Z]{0,5}$/.test(game.draft) ||
      typeof game.startedHard !== 'boolean' || typeof game.hard !== 'boolean' || typeof game.bonusEligible !== 'boolean' ||
      (game.bonusEligible && (!game.startedHard || !game.hard)) ||
      (game.hard && !game.startedHard) ||
      (game.startedAt !== null && (typeof game.startedAt !== 'number' || !Number.isFinite(game.startedAt))) ||
      (game.endedAt !== null && (typeof game.endedAt !== 'number' || !Number.isFinite(game.endedAt)))) {
    throw new Error('Invalid game');
  }
  for (const guess of game.guesses as Guess[]) {
    if (!guess || typeof guess.word !== 'string' || !/^[A-Z]{5}$/.test(guess.word) ||
        !Array.isArray(guess.feedback) || guess.feedback.length !== 5) {
      throw new Error('Invalid guess');
    }
    const feedback = evaluateGuess(game.solution, guess.word);
    if (guess.feedback.some((item, index) => item !== feedback[index])) throw new Error('Invalid guess');
  }
  const count = game.guesses.length;
  const winningIndex = game.guesses.findIndex(guess => guess.word === game.solution);
  if (winningIndex !== -1 && (game.status !== 'won' || winningIndex !== count - 1)) throw new Error('Invalid outcome');
  if ((count === 0) !== (game.startedAt === null)) throw new Error('Invalid start');
  switch (game.status) {
    case 'ready':
      if (count || game.endedAt !== null || game.score !== null) throw new Error('Invalid ready game');
      break;
    case 'playing':
      if (!count || count >= 6 || winningIndex !== -1 || game.endedAt !== null || game.score !== null) throw new Error('Invalid playing game');
      break;
    case 'won':
      if (winningIndex !== count - 1 || winningIndex < 0 || game.startedAt === null || game.endedAt === null || game.draft !== '' || game.score !== scoreGame(game.guesses, game.startedAt, game.endedAt, game.bonusEligible)) throw new Error('Invalid win');
      break;
    case 'lost':
      if (count !== 6 || winningIndex !== -1 || game.endedAt === null || game.score !== 0 || game.draft !== '') throw new Error('Invalid loss');
      break;
    case 'expired':
      if (count >= 6 || winningIndex !== -1 || (count ? game.endedAt === null || game.score !== 0 : game.endedAt !== null || game.score !== null)) throw new Error('Invalid expiry');
      break;
    default:
      throw new Error('Invalid status');
  }
  return game;
}
