import { allowedWords, solutionsV1, vocabularyId } from './word-data';

export const ACTIVATION_DATE = '2026-11-08';
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
  if (date >= ACTIVATION_DATE) throw new Error('Published selection required');
  const index = ((dayNumber(date) % solutionsV1.length) + solutionsV1.length) % solutionsV1.length;
  return { date, word: solutionsV1[index], scheduleVersion: 'v1' };
}

export interface DailySelection {
  schema: 1;
  date: string;
  vocabularyId: string;
  challengeId: string;
  index: number;
}

export function validateSelection(value: unknown, date?: string): DailySelection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).sort().join(',') !== 'challengeId,date,index,schema,vocabularyId' ||
      record.schema !== 1 || typeof record.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(record.date) || record.date < ACTIVATION_DATE ||
      (date !== undefined && record.date !== date) || record.vocabularyId !== vocabularyId ||
      !Number.isInteger(record.index) || (record.index as number) < 0 || (record.index as number) >= allowedWords.length ||
      record.challengeId !== `hmac-v1:${record.date}:${vocabularyId}`) return null;
  const instant = Date.parse(`${record.date}T00:00:00Z`);
  if (!Number.isFinite(instant) || new Date(instant).toISOString().slice(0, 10) !== record.date) return null;
  return record as unknown as DailySelection;
}

export function challengeForSelection(selection: DailySelection): DailyChallenge {
  return { date: selection.date, word: allowedWords[selection.index], scheduleVersion: selection.challengeId };
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
  onDay: (day: { date: string }) => void;
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
    onDay({ date });
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
