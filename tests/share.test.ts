import { afterEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createGame, type Game } from '../src/game';
import { prepareResult, resultText, sharePrepared, snapshotResult } from '../src/share';

const game: Game = { ...createGame({ date: '2026-01-01', solution: 'ALBER', scheduleId: 'private' }),
  status: 'won', score: 123, guesses: [
    { word: 'PIANO', feedback: ['green', 'yellow', 'gray', 'green', 'gray'] },
    { word: 'ALBER', feedback: ['green', 'green', 'green', 'green', 'green'] },
  ] };

afterEach(() => vi.unstubAllGlobals());

test('snapshot is gated, retains challenge identity and strips words without mutating the game', () => {
  assert.equal(snapshotResult(game, game.date, false), null);
  assert.equal(snapshotResult(game, '2026-01-02', true), null);
  assert.equal(snapshotResult({ ...game, status: 'expired' }, game.date, true), null);
  const before = JSON.stringify(game);
  const snapshot = snapshotResult(game, game.date, true)!;
  assert.equal(JSON.stringify(game), before);
  assert.equal(snapshot.scheduleId, game.scheduleId);
  assert.doesNotMatch(JSON.stringify(snapshot), /PIANO|ALBER/);
  game.guesses[0].feedback[0] = 'gray';
  assert.equal(snapshot.rows[0][0], 'green');
  game.guesses[0].feedback[0] = 'green';
});

test('PNG card uses the effective appearance, private grid and only title, date and score', async () => {
  const drawn: { color: string; x: number; y: number; width: number; height: number }[] = [];
  const labels: { text: string; font: string; color: string }[] = [];
  const ctx = {
    fillStyle: '', font: '', textAlign: '',
    fillRect(x: number, y: number, width: number, height: number) { drawn.push({ color: this.fillStyle, x, y, width, height }); },
    fillText(text: string) { labels.push({ text, font: this.font, color: this.fillStyle }); },
  };
  const documentElement = { dataset: { appearance: 'light' } };
  vi.stubGlobal('document', { documentElement, createElement: () => ({ width: 0, height: 0, getContext: () => ctx, toBlob: (cb: (blob: Blob) => void) => cb(new Blob(['png'], { type: 'image/png' })) }) });
  let deviceDark = false;
  vi.stubGlobal('window', { matchMedia: () => ({ matches: deviceDark }) });
  const snapshot = snapshotResult(game, game.date, true)!;
  for (const [appearance, device, background, neutral] of [
    ['light', true, '#fffefa', '#e5e7eb'],
    ['dark', false, '#222724', '#46534b'],
    ['system', false, '#fffefa', '#e5e7eb'],
    ['system', true, '#222724', '#46534b'],
  ] as const) {
    documentElement.dataset.appearance = appearance;
    deviceDark = device;
    drawn.length = 0; labels.length = 0;
    const prepared = await prepareResult(snapshot);
    assert.equal(prepared.file.type, 'image/png');
    assert.deepEqual(labels.map(label => label.text), ['Parole Competitive', game.date, '123']);
    assert.equal(drawn.length, 31);
    assert.equal(drawn[0].color, background);
    assert.deepEqual(drawn.slice(1, 6).map(cell => cell.color), Array(5).fill(neutral));
    assert.equal(new Set([drawn[6].color, neutral, '#ca8a04', '#6b7280']).size, 4);
    assert.equal(prepared.text.split('\n')[4], '⬜⬜⬜⬜⬜');
  }
  assert.equal(resultText(snapshot, false).split('\n')[4], '🟩🟨⬛🟩⬛');
  drawn.length = 0;
  await prepareResult(snapshot, false);
  assert.deepEqual(drawn.slice(1, 6).map(cell => cell.color), ['#16a34a', '#ca8a04', '#6b7280', '#16a34a', '#6b7280']);
});

test('native support, fallback, denial, cancellation and errors have distinct outcomes', async () => {
  const prepared = { date: game.date, scheduleId: game.scheduleId, file: new File(['png'], 'result.png', { type: 'image/png' }), text: 'risultato privato' };
  const share = vi.fn().mockResolvedValue(undefined);
  const copy = vi.fn().mockResolvedValue(undefined);
  const canShare = vi.fn().mockReturnValue(true);
  vi.stubGlobal('navigator', { share, canShare, clipboard: { writeText: copy } });
  assert.deepEqual(await sharePrepared(prepared), { kind: 'shared', message: 'Condivisione completata' });
  assert.deepEqual(canShare.mock.calls[0][0].files, [prepared.file]);
  assert.equal(copy.mock.calls.length, 0);
  share.mockRejectedValueOnce(Object.assign(new Error(), { name: 'AbortError' }));
  assert.deepEqual(await sharePrepared(prepared), { kind: 'cancelled', message: '' });
  assert.equal(copy.mock.calls.length, 0);
  share.mockRejectedValueOnce(new Error('failed'));
  assert.deepEqual(await sharePrepared(prepared), { kind: 'error', message: 'Condivisione non riuscita. Riprova' });
  assert.equal(copy.mock.calls.length, 0);
  canShare.mockReturnValue(false);
  assert.deepEqual(await sharePrepared(prepared), { kind: 'copied', message: 'Risultato copiato' });
  assert.equal(copy.mock.calls[0][0], prepared.text);
  copy.mockRejectedValueOnce(new Error('denied'));
  const manual = await sharePrepared(prepared);
  assert.deepEqual(manual, { kind: 'manual', message: 'Copia il testo qui sotto', text: prepared.text });
  canShare.mockImplementationOnce(() => { throw new Error('failed'); });
  assert.deepEqual(await sharePrepared(prepared), { kind: 'error', message: 'Condivisione non disponibile. Riprova' });
});
