import { allowedWords, solutionsV1 } from './word-data';

export const SCHEDULE_VERSION = 'v1';
export const allowedGuesses = new Set(allowedWords);
const DAY = 86400000;
const EPOCH = Date.UTC(2026, 0, 1);
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome', calendar: 'gregory', numberingSystem: 'latn',
  year: 'numeric', month: '2-digit', day: '2-digit',
});

export function romeDate(instant = Date.now()): string {
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function dayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Math.floor((Date.UTC(year, month - 1, day) - EPOCH) / DAY);
}

export function wordForDate(date: string): DailyChallenge {
  const index = ((dayNumber(date) % solutionsV1.length) + solutionsV1.length) % solutionsV1.length;
  return { date, word: solutionsV1[index], scheduleVersion: SCHEDULE_VERSION };
}

// Locate the start of the day after date in UTC, including DST transitions.
export function boundaryAfter(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const midnightUtc = Date.UTC(year, month - 1, day + 1);
  let low = midnightUtc - 15 * 3600000;
  let high = midnightUtc + 15 * 3600000;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (romeDate(middle) <= date) low = middle;
    else high = middle;
  }
  return high;
}

export interface DailyChallenge {
  date: string;
  word: string;
  scheduleVersion: string;
}

export interface DailyWordObserverOptions {
  onDay: (challenge: DailyChallenge) => void;
  now?: () => number;
  document?: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>;
  setTimer?: typeof setTimeout;
  clearTimer?: typeof clearTimeout;
}

export function observeDailyWord({ onDay, now = Date.now, document: doc = globalThis.document, setTimer = setTimeout, clearTimer = clearTimeout }: DailyWordObserverOptions): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  const reconcile = () => {
    if (stopped || doc?.visibilityState === 'hidden') return;
    if (timer !== undefined) clearTimer(timer);
    const instant = now();
    const date = romeDate(instant);
    onDay(wordForDate(date));
    timer = setTimer(reconcile, Math.max(1, boundaryAfter(date) - instant));
  };
  doc?.addEventListener('visibilitychange', reconcile);
  reconcile();
  return () => {
    stopped = true;
    if (timer !== undefined) clearTimer(timer);
    doc?.removeEventListener('visibilitychange', reconcile);
  };
}
