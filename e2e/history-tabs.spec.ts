import { expect, test } from '@playwright/test';
import { createGame, submitGuess } from '../src/game';
import { allowedWords, vocabularyId } from '../src/word-data';

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
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
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
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
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
  await expect(dialog.getByRole('group', { name: 'Griglia della partita' }).locator('.tile')).toHaveCount(30);
  await expect(dialog.getByText('Durata: 0:00', { exact: false })).toBeVisible();
  await dialog.getByRole('tab', { name: 'Statistiche' }).click();
  await dialog.getByRole('tab', { name: 'Storico' }).click();
  await expect(dialog.locator('.history-entry button')).toHaveAttribute('aria-expanded', 'true');
  await dialog.getByRole('button', { name: 'Chiudi' }).last().click();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(dialog.getByRole('tab', { name: 'Statistiche' })).toHaveAttribute('aria-selected', 'true');
  await dialog.getByRole('tab', { name: 'Storico' }).click();
  await expect(dialog.locator('.history-entry button')).toHaveAttribute('aria-expanded', 'false');
});

test('empty history and independent expansions survive a day update', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-09T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await page.getByRole('tab', { name: 'Storico' }).click();
  await expect(page.getByText('Nessuna partita conclusa conservata.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
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
    await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
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
