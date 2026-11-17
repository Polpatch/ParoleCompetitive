import { afterEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createGame, type Game } from '../src/game';
import { prepareResult, resultText, sharePrepared, shareText, snapshotResult } from '../src/share';

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

test('text keeps the first-win exception and canonical URL last without private metadata', () => {
  const firstWin = { ...snapshotResult(game, game.date, true)!, attempts: 1, rows: [['green', 'green', 'green', 'green', 'green'] as const] };
  const text = resultText(firstWin);
  assert.equal(text.split('\n')[4], '🟩🟩🟩🟩🟩');
  assert.equal(text.split('\n').at(-1), 'https://polpatch.github.io/ParoleCompetitive/');
  assert.doesNotMatch(text, /private|ALBER|PIANO/);
});

test('PNG keeps private six-row feedback and effective appearance in the compact card', async () => {
  const drawn: { color: string; x: number; y: number; width: number; height: number }[] = [];
  const labels: string[] = [];
  const ctx = {
    fillStyle: '', font: '', textAlign: '',
    fillRect(x: number, y: number, width: number, height: number) { drawn.push({ color: this.fillStyle, x, y, width, height }); },
    fillText(text: string) { labels.push(text); },
  };
  const documentElement = { dataset: { appearance: 'light' } };
  vi.stubGlobal('document', { documentElement, createElement: () => ({ width: 0, height: 0, getContext: () => ctx, toBlob: (cb: (blob: Blob) => void) => cb(new Blob(['png'], { type: 'image/png' })) }) });
  let deviceDark = false;
  vi.stubGlobal('window', { matchMedia: () => ({ matches: deviceDark }) });
  const snapshot = snapshotResult(game, game.date, true)!;
  for (const [appearance, device, background, neutral] of [
    ['light', true, '#f5f7f2', '#fffefa'],
    ['dark', false, '#181b19', '#222724'],
    ['system', false, '#f5f7f2', '#fffefa'],
    ['system', true, '#181b19', '#222724'],
  ] as const) {
    documentElement.dataset.appearance = appearance;
    deviceDark = device;
    for (const [result, firstRow] of [
      [snapshot, neutral],
      [{ ...snapshot, outcome: 'lost' as const, attempts: 6, score: 0 }, neutral],
      [{ ...snapshot, attempts: 1, rows: [Array(5).fill('green')] }, '#23754d'],
    ] as const) {
      drawn.length = 0; labels.length = 0;
      const prepared = await prepareResult(result);
      const cells = drawn.filter(cell => cell.width === cell.height && cell.width > 1);
      assert.equal(prepared.file.type, 'image/png');
      assert.deepEqual(labels, ['ParoleCompetitive', game.date, String(result.score)]);
      assert.equal(drawn[0].color, background);
      assert.ok(drawn[0].width <= 360 && drawn[0].height <= 450);
      assert.equal(cells.length, 30);
      assert.deepEqual(cells.slice(0, 5).map(cell => cell.color), Array(5).fill(firstRow));
      assert.ok(cells[0].x + cells[0].width < cells[1].x);
      assert.ok(cells[0].y + cells[0].height < cells[5].y);
      assert.equal(prepared.text.split('\n').at(-1), 'https://polpatch.github.io/ParoleCompetitive/');
    }
  }
  drawn.length = 0;
  await prepareResult(snapshot, false);
  assert.deepEqual(drawn.filter(cell => cell.width === cell.height && cell.width > 1).slice(0, 5).map(cell => cell.color), ['#23754d', '#8a6500', '#53635b', '#23754d', '#53635b']);
  assert.equal(resultText(snapshot, false).split('\n')[4], '🟩🟨⬛🟩⬛');
});

test('image sharing sends only the file and canonical link and never falls back after cancellation or failure', async () => {
  const prepared = { date: game.date, scheduleId: game.scheduleId, file: new File(['png'], 'result.png', { type: 'image/png' }), text: 'private result' };
  const share = vi.fn().mockResolvedValue(undefined);
  const canShare = vi.fn().mockReturnValue(true);
  const copy = vi.fn();
  vi.stubGlobal('navigator', { share, canShare, clipboard: { writeText: copy } });
  assert.deepEqual(await sharePrepared(prepared), { kind: 'shared', message: 'Condivisione completata' });
  const data = { files: [prepared.file], text: 'https://polpatch.github.io/ParoleCompetitive/' };
  assert.deepEqual(canShare.mock.calls[0][0], data);
  assert.deepEqual(share.mock.calls[0][0], data);
  share.mockRejectedValueOnce(Object.assign(new Error(), { name: 'AbortError' }));
  assert.deepEqual(await sharePrepared(prepared), { kind: 'cancelled', message: '' });
  share.mockRejectedValueOnce(new Error('failed'));
  assert.deepEqual(await sharePrepared(prepared), { kind: 'error', message: 'Condivisione non riuscita. Riprova' });
  canShare.mockImplementationOnce(() => { throw new Error('failed'); });
  assert.deepEqual(await sharePrepared(prepared), { kind: 'error', message: 'Condivisione non disponibile. Riprova' });
  canShare.mockReturnValue(false);
  assert.deepEqual(await sharePrepared(prepared), { kind: 'error', message: 'Condivisione immagini non disponibile' });
  assert.equal(copy.mock.calls.length, 0);
});

test('text sharing uses native share, then clipboard, then manual fallback', async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  const copy = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { share, clipboard: { writeText: copy } });
  assert.deepEqual(await shareText('plain text'), { kind: 'shared', message: 'Condivisione completata' });
  assert.deepEqual(share.mock.calls[0][0], { text: 'plain text' });
  share.mockRejectedValueOnce(Object.assign(new Error(), { name: 'AbortError' }));
  assert.deepEqual(await shareText('cancelled text'), { kind: 'cancelled', message: '' });
  assert.equal(copy.mock.calls.length, 0);
  share.mockRejectedValueOnce(new Error('failed'));
  assert.deepEqual(await shareText('failed text'), { kind: 'error', message: 'Condivisione non riuscita. Riprova' });
  assert.equal(copy.mock.calls.length, 0);
  vi.stubGlobal('navigator', { share, canShare: () => false, clipboard: { writeText: copy } });
  assert.deepEqual(await shareText('unsupported text'), { kind: 'copied', message: 'Risultato copiato' });
  assert.equal(copy.mock.calls.at(-1)![0], 'unsupported text');
  vi.stubGlobal('navigator', { clipboard: { writeText: copy } });
  assert.deepEqual(await shareText('copied'), { kind: 'copied', message: 'Risultato copiato' });
  copy.mockRejectedValueOnce(new Error('denied'));
  assert.deepEqual(await shareText('manual'), { kind: 'manual', message: 'Copia il testo qui sotto', text: 'manual' });
});
