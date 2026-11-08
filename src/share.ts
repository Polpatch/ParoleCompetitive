import type { Feedback, Game } from './game';

export interface ResultSnapshot {
  readonly date: string;
  readonly outcome: 'won' | 'lost';
  readonly attempts: number;
  readonly score: number;
  readonly rows: readonly (readonly Feedback[])[];
}

type Cell = Feedback | 'neutral';
const colors: Record<Cell, string> = {
  neutral: '#e5e7eb', gray: '#6b7280', yellow: '#ca8a04', green: '#16a34a',
};
const symbols: Record<Cell, string> = { neutral: '⬜', gray: '⬛', yellow: '🟨', green: '🟩' };

// Snapshot only public result data, after the caller has finished the reveal.
export function snapshotResult(game: Game, today: string, revealed: boolean): ResultSnapshot | null {
  if (!revealed || game.date !== today || (game.status !== 'won' && game.status !== 'lost') || game.score === null) return null;
  return {
    date: game.date, outcome: game.status, attempts: game.guesses.length, score: game.score,
    rows: game.guesses.map(guess => [...guess.feedback]),
  };
}

function grid(result: ResultSnapshot, spoilerFree: boolean): Cell[][] {
  return Array.from({ length: 6 }, (_, row) => Array.from({ length: 5 }, (_, col) =>
    (row === 0 && spoilerFree) ? 'neutral' : result.rows[row]?.[col] ?? 'neutral'));
}

function summary(result: ResultSnapshot): string[] {
  return ['Parole Competitive', result.date, `${result.outcome === 'won' ? 'Vittoria' : 'Sconfitta'} · ${result.attempts}/6`, `Punteggio: ${result.score}`];
}

export function resultText(result: ResultSnapshot, spoilerFree = true): string {
  return [...summary(result), ...grid(result, spoilerFree).map(row => row.map(cell => symbols[cell]).join(''))].join('\n');
}

export interface PreparedResult { readonly file: File; readonly text: string }

// Call before the share button gesture: canvas encoding is asynchronous.
export async function prepareResult(result: ResultSnapshot, spoilerFree = true): Promise<PreparedResult> {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossibile preparare l’immagine del risultato.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 30px sans-serif';
  summary(result).forEach((line, index) => ctx.fillText(line, 45, 55 + index * 45));
  grid(result, spoilerFree).forEach((row, y) => row.forEach((cell, x) => {
    ctx.fillStyle = colors[cell];
    ctx.fillRect(45 + x * 82, 220 + y * 82, 70, 70);
  }));
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Impossibile preparare l’immagine del risultato.')), 'image/png'));
  return { file: new File([blob], 'risultato.png', { type: 'image/png' }), text: resultText(result, spoilerFree) };
}

export type ShareOutcome =
  | { kind: 'shared' | 'copied' | 'cancelled' | 'error'; message: string }
  | { kind: 'manual'; message: string; text: string };

// Invoke directly from the user gesture, without awaiting image preparation first.
export async function sharePrepared(result: PreparedResult): Promise<ShareOutcome> {
  const data: ShareData = { files: [result.file] };
  let supported: boolean;
  try {
    supported = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare(data);
  } catch {
    return { kind: 'error', message: 'Impossibile verificare la condivisione. Riprova.' };
  }
  if (supported) {
    try {
      await navigator.share(data);
      return { kind: 'shared', message: 'Condivisione completata.' };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return { kind: 'cancelled', message: '' };
      return { kind: 'error', message: 'Impossibile condividere il risultato. Riprova.' };
    }
  }
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(result.text);
    return { kind: 'copied', message: 'Risultato copiato negli appunti.' };
  } catch {
    return { kind: 'manual', message: 'Copia automatica non riuscita. Copia il testo manualmente.', text: result.text };
  }
}
