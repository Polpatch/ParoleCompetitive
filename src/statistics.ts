/**
 * Derive device-local statistics from persisted local daily game records.
 *
 * `recordsByDate` maps each challenge date to its single persisted game record.
 * The caller is responsible for serializing daily writes and refreshing this
 * view when another tab changes the records. No statistics are stored here.
 * `latestScore` is null until a started game concludes.
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
  latestScore: number | null;
}

export function deriveStatistics(recordsByDate: Readonly<Record<string, StatisticsGame>>): Statistics {
  const statistics: Statistics = {
    wins: 0,
    losses: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    latestScore: null,
  };
  let latestEndedAt = -Infinity;
  let latestDate = '';

  for (const [date, game] of Object.entries(recordsByDate)) {
    if (game.status === 'won') {
      statistics.wins += 1;
      statistics.distribution[game.guesses.length - 1] += 1;
    } else if (game.status === 'lost' || (game.status === 'expired' && game.startedAt !== null)) {
      statistics.losses += 1;
    } else {
      continue;
    }

    const endedAt = game.endedAt;
    if (endedAt !== null && (endedAt > latestEndedAt || (endedAt === latestEndedAt && date > latestDate))) {
      latestEndedAt = endedAt;
      latestDate = date;
      statistics.latestScore = game.status === 'won' ? game.score : 0;
    }
  }
  return statistics;
}
