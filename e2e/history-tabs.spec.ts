import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createGame, expireGame, submitGuess } from '../src/game';
import { resultText, snapshotResult } from '../src/share';
import { allowedWords, vocabularyId } from '../src/word-data';

async function openAction(page: Page, name: string) {
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

test('history breaks terminal-time ties by date descending', async ({ page }) => {
  const end = Date.parse('2026-03-10T12:00:00Z');
  const solution = allowedWords[0];
  const games = Object.fromEntries(['2026-03-08', '2026-03-09'].map(date => {
    const game = createGame({ date, solution, scheduleId: 'test' });
    return [date, submitGuess(game, solution, new Set(allowedWords), end).game];
  }));
  await page.addInitScript(games => localStorage.setItem('parolecompetitive:session:v1', JSON.stringify({
    preferences: { difficulty: 'standard', spoilerFree: false, appearance: 'system', autocomplete: false },
    games,
  })), games);
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await openAction(page, 'Statistiche');
  await page.getByRole('tab', { name: 'Storico' }).click();
  const entries = page.locator('.history-entry');
  await expect(entries).toHaveCount(2);
  await entries.nth(0).locator('button').click();
  await entries.nth(1).locator('button').click();
  await expect(entries.nth(0)).toContainText('Data: 2026-03-09');
  await expect(entries.nth(1)).toContainText('Data: 2026-03-08');
});

test('same-day acquired and public history ties sort by challenge identity', async ({ page }) => {
  const date = '2026-11-09';
  const end = Date.parse(`${date}T12:00:00Z`);
  const selection = { schema: 1, date, vocabularyId, challengeId: `hmac-v1:${date}:${vocabularyId}`, index: 0 };
  const acquired = { ...createGame({ date, solution: allowedWords[0], scheduleId: selection.challengeId }), selection };
  const publicGame = createGame({ date, solution: allowedWords[1], scheduleId: 'a-public' });
  const allowed = new Set(allowedWords);
  const games = { [date]: { ...submitGuess(acquired, acquired.solution, allowed, end).game, selection } };
  const publicGames = { [date]: submitGuess(publicGame, publicGame.solution, allowed, end).game };
  await page.addInitScript(({ games, publicGames }) => localStorage.setItem('parolecompetitive:session:v1', JSON.stringify({
    preferences: { difficulty: 'standard', spoilerFree: false, appearance: 'system', autocomplete: false },
    games, publicGames,
  })), { games, publicGames });
  await page.clock.setFixedTime(new Date('2026-11-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await openAction(page, 'Statistiche');
  await expect(page.locator('#statistics')).toContainText('Punteggio totale: 3000');
  await page.getByRole('tab', { name: 'Storico' }).click();
  const entries = page.locator('.history-entry');
  await expect(entries).toHaveCount(2);
  await expect(entries.nth(0)).toContainText(publicGame.solution);
  await expect(entries.nth(1)).toContainText(acquired.solution);
});

test('summary and local history retain expansions until the dialog closes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  const solution = await page.evaluate(() => JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games['2026-03-10'].solution as string);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Punteggio totale: 1500')).toBeVisible();
  await expect(dialog.locator('.chart-column')).toHaveCount(6);
  await expect(dialog.locator('#history')).toBeHidden();
  await dialog.getByRole('tab', { name: 'Statistiche' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: 'Storico' })).toHaveAttribute('aria-selected', 'true');
  await expect(dialog.locator('#statistics')).toBeHidden();
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  const entry = dialog.locator('.history-entry button');
  await expect(entry).toHaveAttribute('aria-expanded', 'false');
  await entry.click();
  await expect(entry).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('group', { name: 'Griglia della partita' }).locator('.tile')).toHaveCount(5);
  await expect(dialog.getByText('Durata: 0:00', { exact: false })).toBeVisible();
  await dialog.getByRole('tab', { name: 'Statistiche' }).click();
  await dialog.getByRole('tab', { name: 'Storico' }).click();
  await expect(dialog.locator('.history-entry button')).toHaveAttribute('aria-expanded', 'true');
  await dialog.getByRole('button', { name: 'Chiudi finestra' }).click();
  await openAction(page, 'Statistiche');
  await expect(dialog.getByRole('tab', { name: 'Statistiche' })).toHaveAttribute('aria-selected', 'true');
  await dialog.getByRole('tab', { name: 'Storico' }).click();
  await expect(dialog.locator('.history-entry button')).toHaveAttribute('aria-expanded', 'false');
});

test('empty history and independent expansions survive a day update', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-09T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await openAction(page, 'Statistiche');
  await page.getByRole('tab', { name: 'Storico' }).click();
  await expect(page.getByText('Nessuna partita conclusa conservata.', { exact: false })).toBeVisible();
  await expect(page.getByText('senza sincronizzazione né recupero dei dati cancellati', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Chiudi finestra', exact: true }).click();
  for (const day of ['2026-03-09', '2026-03-10']) {
    if (day === '2026-03-10') {
      await page.clock.setFixedTime(new Date(`${day}T12:00:00Z`));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await expect.poll(() => page.evaluate(date => !!JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games[date], day)).toBe(true);
    }
    const solution = await page.evaluate(date => JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games[date].solution as string, day);
    await page.locator('.board').click();
    await page.keyboard.type(solution);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Statistiche' })).toBeVisible();
    await page.getByRole('button', { name: 'Chiudi finestra', exact: true }).click();
  }
  await openAction(page, 'Statistiche');
  await page.getByRole('tab', { name: 'Storico' }).click();
  const entries = page.locator('.history-entry');
  await expect(entries).toHaveCount(2);
  await entries.nth(0).locator('button').click();
  await entries.nth(1).locator('button').click();
  await expect(entries.nth(0)).toContainText('Data: 2026-03-10');
  await expect(entries.nth(1)).toContainText('Data: 2026-03-09');
  await page.clock.setFixedTime(new Date('2026-03-11T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('tab', { name: 'Storico' })).toHaveAttribute('aria-selected', 'true');
  await expect(entries.nth(0).locator('button')).toHaveAttribute('aria-expanded', 'true');
  await expect(entries.nth(1).locator('button')).toHaveAttribute('aria-expanded', 'true');
});

test('history shows only saved accepted rows and never changes the active game or shares', async ({ page }) => {
  const allowed = new Set(allowedWords);
  const solution = 'ABATE';
  const wrong = 'BEATA';
  const make = (date: string, count: number, outcome: 'won' | 'lost' | 'expired') => {
    const start = Date.parse(`${date}T12:00:00Z`);
    let game = createGame({ date, solution, scheduleId: `history-${date}` });
    for (let i = 0; i < count; i++) {
      const word = outcome === 'won' && i === count - 1 ? solution : wrong;
      const result = submitGuess(game, word, allowed, start + i * 1000);
      expect(result.accepted).toBe(true);
      game = result.game;
    }
    return outcome === 'expired' ? expireGame(game, start + 60000) : game;
  };
  const records = [
    make('2026-03-06', 1, 'won'),
    make('2026-03-07', 2, 'won'),
    make('2026-03-08', 6, 'lost'),
    make('2026-03-09', 2, 'expired'),
  ];
  const shared = resultText(snapshotResult(records[0], records[0].date, true)!, false).split('\n').slice(4);
  expect(shared).toHaveLength(6);
  expect(shared.every(row => [...row].length === 5)).toBe(true);
  expect(shared.join('')).not.toContain(solution);
  const empty = expireGame(createGame({ date: '2026-03-05', solution, scheduleId: 'empty' }), Date.parse('2026-03-06T00:00:00Z'));
  const unfinished = submitGuess(
    createGame({ date: '2026-03-10', solution: wrong, scheduleId: 'unfinished' }),
    solution, allowed, Date.parse('2026-03-10T11:59:00Z'),
  );
  expect(unfinished.accepted).toBe(true);
  expect(unfinished.game.status).toBe('playing');
  const games = Object.fromEntries([...records, empty, unfinished.game].map(game => [game.date, game]));
  await page.addInitScript(games => {
    localStorage.setItem('parolecompetitive:session:v1', JSON.stringify({
      preferences: { difficulty: 'standard', spoilerFree: false, appearance: 'system', autocomplete: false },
      games,
    }));
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: () => {
      (window as Window & { historyShareCalls?: number }).historyShareCalls = ((window as Window & { historyShareCalls?: number }).historyShareCalls ?? 0) + 1;
      return Promise.resolve();
    } });
  }, games);
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await expect(page.getByRole('group', { name: 'Griglia dei tentativi' }).locator('.tile')).toHaveCount(30);
  await page.keyboard.type('A');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games['2026-03-10'].draft)).toBe('A');
  const before = await page.evaluate(() => localStorage.getItem('parolecompetitive:session:v1'));
  await openAction(page, 'Statistiche');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  const totals = await dialog.locator('#statistics').innerText();
  await dialog.getByRole('tab', { name: 'Storico' }).click();
  const entries = dialog.locator('.history-entry');
  await expect(entries).toHaveCount(records.length);
  await expect(dialog.locator('#history')).not.toContainText(unfinished.game.solution);
  for (const [index, saved] of [...records].reverse().entries()) {
    const entry = entries.nth(index);
    await entry.locator('button').click();
    await expect(entry.locator('button')).toHaveAttribute('aria-expanded', 'true');
    await expect(entry).toContainText(`Data: ${saved.date}`);
    await expect(entry).toContainText(`Tentativi: ${saved.guesses.length}`);
    await expect(entry).toContainText(`Punti: ${saved.score}`);
    const seconds = Math.max(0, (saved.endedAt! - saved.startedAt!) / 1000);
    await expect(entry).toContainText(`Durata: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
    const tiles = entry.getByRole('group', { name: 'Griglia della partita' }).locator('.tile');
    await expect(tiles).toHaveCount(saved.guesses.length * 5);
    const expected = saved.guesses.flatMap(guess => [...guess.word].map((letter, i) => ({
      letter,
      feedback: guess.feedback[i],
      label: `${letter}: ${{ green: 'posizione corretta', yellow: 'presente, posizione diversa', gray: 'assente' }[guess.feedback[i]]}`,
    })));
    for (const [i, tile] of expected.entries()) {
      await expect(tiles.nth(i)).toHaveText(tile.letter);
      await expect(tiles.nth(i)).toHaveClass(new RegExp(`\\b${tile.feedback}\\b`));
      await expect(tiles.nth(i)).toHaveAttribute('aria-label', tile.label);
    }
    await expect(entry.locator('.revealing')).toHaveCount(0);
  }
  for (const button of await entries.locator('button').all()) await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  await dialog.getByRole('tab', { name: 'Statistiche' }).click();
  expect(await dialog.locator('#statistics').innerText()).toBe(totals);
  await dialog.getByRole('tab', { name: 'Statistiche' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: 'Storico' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('tab', { name: 'Statistiche' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: 'Storico' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.revealing')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('parolecompetitive:session:v1'))).toBe(before);
  expect(await page.evaluate(() => (window as Window & { historyShareCalls?: number }).historyShareCalls ?? 0)).toBe(0);
});

test('an unrevealed terminal result stays out of history until its reveal completes', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-03-10T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  const solution = await page.evaluate(() => JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games['2026-03-10'].solution as string);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await openAction(page, 'Statistiche');
  await page.getByRole('tab', { name: 'Storico' }).click();
  await expect(page.locator('.history-entry')).toHaveCount(0);
  await expect(page.locator('#history')).not.toContainText(solution);
  await page.clock.runFor(2200);
  await page.getByRole('tab', { name: 'Storico' }).dispatchEvent('click');
  await expect(page.locator('.history-entry')).toHaveCount(1);
  await expect(page.locator('.history-entry')).toContainText(solution);
});

test('withdrawn activation-day results do not enter history', async ({ page }) => {
  const date = '2026-11-08';
  const saved = submitGuess(createGame({ date, solution: 'ABATE', scheduleId: 'old-public' }), 'ABATE', new Set(allowedWords), Date.parse(`${date}T12:00:00Z`)).game;
  await page.addInitScript(saved => localStorage.setItem('parolecompetitive:session:v1', JSON.stringify({
    preferences: { difficulty: 'standard', spoilerFree: false, appearance: 'system', autocomplete: false },
    games: { [saved.date]: saved },
  })), saved);
  await page.clock.setFixedTime(new Date('2026-11-09T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await openAction(page, 'Statistiche');
  await page.getByRole('tab', { name: 'Storico' }).click();
  await expect(page.locator('.history-entry')).toHaveCount(0);
  await expect(page.locator('#history')).not.toContainText(saved.solution);
  expect(await page.evaluate(date => JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games[date], date)).toBeUndefined();
});
