/**
 * Derive device-local statistics from persisted local daily game records.
 *
 * The caller supplies records keyed by challenge identity, serializes daily
 * writes and refreshes this view when another tab changes the records.
 * No statistics are stored here.
 */
export interface StatisticsGame {
  status: 'ready' | 'playing' | 'won' | 'lost' | 'expired';
  guesses: readonly unknown[];
  startedAt: number | null;
  endedAt: number | null;
  score: number | null;
}

export interface Statistics {
  wins: number;
  losses: number;
  distribution: number[];
  totalScore: number;
}

export function deriveStatistics(recordsByDate: Readonly<Record<string, StatisticsGame>>): Statistics {
  const statistics: Statistics = {
    wins: 0,
    losses: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    totalScore: 0,
  };

  for (const game of Object.values(recordsByDate)) {
    if (game.status === 'won') {
      statistics.wins += 1;
      statistics.distribution[game.guesses.length - 1] += 1;
      statistics.totalScore += game.score ?? 0;
    } else if (game.status === 'lost' || (game.status === 'expired' && game.startedAt !== null)) {
      statistics.losses += 1;
    } else {
      continue;
    }
  }
  return statistics;
}
