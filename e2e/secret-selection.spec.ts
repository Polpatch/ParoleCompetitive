import { expect, test } from '@playwright/test';
import { allowedWords, vocabularyId } from '../src/word-data';
import { createGame, submitGuess } from '../src/game';
import { defaultPreferences } from '../src/preferences';

const key = 'parolecompetitive:session:v1';
const date = '2026-11-08';
const selection = (day: string, index = 0) => ({
  schema: 1, date: day, vocabularyId, challengeId: `hmac-v1:${day}:${vocabularyId}`, index,
});

test('unavailable selection creates no game, explicit retry acquires once and survives offline reload', async ({ page }) => {
  let requests = 0;
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await page.route('**/daily/current.json*', async route => {
    requests++;
    if (requests === 1 || requests > 2) await route.abort();
    else await route.fulfill({ json: selection(date) });
  });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('status')).toContainText('non è ancora disponibile');
  expect(requests).toBe(1);
  const savedWhileUnavailable = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(savedWhileUnavailable.games[date]).toBeUndefined();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('#statistics')).toContainText('Vittorie: 0 · Sconfitte: 0');
  await page.getByRole('button', { name: 'Chiudi' }).click();
  await page.getByRole('button', { name: 'Riprova', exact: true }).click();
  await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date]?.solution, { key, date })).toBe(allowedWords[0]);
  expect(requests).toBe(2);
  await page.keyboard.type('A');
  await expect(page.locator('.tile').first()).toHaveText('A');
  await page.reload();
  await expect(page.locator('.tile').first()).toHaveText('A');
  expect(await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].solution, { key, date })).toBe(allowedWords[0]);
});

test('previous unfinished games expire while today is unavailable', async ({ page }) => {
  const ready = createGame({ date: '2026-11-06', solution: 'AMORE', scheduleId: 'v1' });
  const started = submitGuess(
    createGame({ date: '2026-11-07', solution: 'AMORE', scheduleId: 'v1' }),
    'AUDIO', new Set(['AUDIO']), Date.parse('2026-11-07T12:00:00Z'),
  ).game;
  const saved = { preferences: defaultPreferences(), games: { [ready.date]: ready, [started.date]: started } };
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await page.addInitScript(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key, saved });
  await page.route('**/daily/current.json*', route => route.abort());
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('status')).toContainText('non è ancora disponibile');
  const games = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games, key);
  expect(games[date]).toBeUndefined();
  expect(games[ready.date].status).toBe('expired');
  expect(games[started.date].status).toBe('expired');
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('#statistics')).toContainText('Vittorie: 0 · Sconfitte: 1');
});

test('an incompatible vocabulary cannot start a game', async ({ page }) => {
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await page.route('**/daily/current.json*', route => route.fulfill({
    json: { ...selection(date), vocabularyId: 'incompatible' },
  }));
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'Ricarica pagina', exact: true })).toBeVisible();
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(saved.games[date]).toBeUndefined();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('#statistics')).toContainText('Vittorie: 0 · Sconfitte: 0');
});

test('the abandoned November 9 cutover does not erase the previous secret result', async ({ page }) => {
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/daily/current.json*', async route => {
    const day = await page.evaluate(() => new Date().toISOString().slice(0, 10));
    await route.fulfill({ json: selection(day) });
  });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(({ key, date }) => !!JSON.parse(localStorage.getItem(key) ?? '{}').games?.[date], { key, date })).toBe(true);
  await page.keyboard.type(allowedWords[0]);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Statistiche' })).toContainText('Vittorie: 1');
  await page.clock.setFixedTime(new Date('2026-11-09T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect.poll(() => page.evaluate(k => !!JSON.parse(localStorage.getItem(k) ?? '{}').games?.['2026-11-09'], key)).toBe(true);
  await expect(page.getByRole('dialog', { name: 'Statistiche' })).toContainText('Vittorie: 1 · Sconfitte: 0');
  const games = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games, key);
  expect(games[date].status).toBe('won');
  expect(games['2026-11-09'].status).toBe('ready');
});

test('an obsolete acquisition cannot replace the next day challenge', async ({ page }) => {
  let releaseOld!: () => void;
  let completeOld!: () => void;
  const oldResponse = new Promise<void>(resolve => { releaseOld = resolve; });
  const oldCompleted = new Promise<void>(resolve => { completeOld = resolve; });
  let requests = 0;
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await page.route('**/daily/current.json*', async route => {
    requests++;
    if (requests === 1) {
      await oldResponse;
      await route.fulfill({ json: selection(date, 0) });
      completeOld();
    } else {
      await route.fulfill({ json: selection('2026-11-09', 1) });
    }
  });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => requests).toBe(1);
  await page.clock.setFixedTime(new Date('2026-11-09T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-11-09']?.solution, key)).toBe(allowedWords[1]);
  releaseOld();
  await oldCompleted;
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  const games = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games, key);
  expect(games[date]).toBeUndefined();
  expect(games['2026-11-09'].solution).toBe(allowedWords[1]);
});
