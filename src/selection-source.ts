import { romeDate, validateSelection, type DailySelection } from './daily-word';
import { vocabularyId as vocabularyIdentity } from './word-data';

export type SelectionResult =
  | { kind: 'available'; selection: DailySelection }
  | { kind: 'unavailable' | 'incompatible' | 'obsolete' };

/** One in-flight request per day, with obsolete requests unable to win a race. */
export function createSelectionSource(fetchSelection: typeof fetch = fetch, now: () => number = Date.now) {
  let pending: { date: string; promise: Promise<SelectionResult> } | undefined;
  let generation = 0;
  return {
    acquire(date: string): Promise<SelectionResult> {
      if (pending?.date === date) return pending.promise;
      const request = ++generation;
      const promise = (async (): Promise<SelectionResult> => {
        let result: SelectionResult;
        try {
          const response = await fetchSelection(`${import.meta.env.BASE_URL}daily/current.json`, { cache: 'no-store' });
          if (!response.ok) result = { kind: 'unavailable' };
          else {
            const value: unknown = await response.json();
            const selection = validateSelection(value, date);
            if (selection) result = { kind: 'available', selection };
            else if (value && typeof value === 'object' &&
              ((typeof (value as Record<string, unknown>).schema === 'number' && (value as Record<string, unknown>).schema !== 1) ||
               (typeof (value as Record<string, unknown>).vocabularyId === 'string' &&
                (value as Record<string, unknown>).vocabularyId !== vocabularyIdentity))) {
              result = { kind: 'incompatible' };
            } else result = { kind: 'unavailable' };
          }
        } catch { result = { kind: 'unavailable' }; }
        if (request !== generation || romeDate(now()) !== date) return { kind: 'obsolete' };
        return result;
      })();
      pending = { date, promise };
      void promise.then(() => { if (pending?.promise === promise) pending = undefined; });
      return promise;
    },
  };
}
