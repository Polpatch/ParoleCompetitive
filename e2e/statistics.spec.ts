import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { allowedWords } from '../src/word-data';

const key = 'parolecompetitive:session:v1';
const day = '2026-03-10';

async function openStatistics(page: Page) {
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  return page.locator('#statistics');
}

test('concurrent tabs, repeated notifications and reload count a win once', async ({ context, page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(({ key, day }) => JSON.parse(localStorage.getItem(key)!).games[day].solution as string, { key, day });
  await page.keyboard.type(solution);
  await expect.poll(() => page.evaluate(({ key, day }) => JSON.parse(localStorage.getItem(key)!).games[day].draft, { key, day })).toBe(solution);

  const other = await context.newPage();
  await other.addInitScript(() => window.addEventListener('storage', event => event.stopImmediatePropagation()));
  await other.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await other.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(other.locator('.tile').first()).toHaveText(solution[0]);
  await Promise.all([page.keyboard.press('Enter'), other.keyboard.press('Enter')]);
  await expect.poll(() => page.evaluate(({ key, day }) => JSON.parse(localStorage.getItem(key)!).games[day].status, { key, day })).toBe('won');
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(other.locator('.tile.revealing')).toHaveCount(0);
  await page.evaluate(k => {
    for (let i = 0; i < 3; i++) window.dispatchEvent(new StorageEvent('storage', { key: k }));
  }, key);
  await page.reload();
  await other.reload();
  for (const tab of [page, other]) {
    const statistics = await openStatistics(tab);
    await expect(statistics.locator('.stat-card').nth(0)).toContainText('1');
    await expect(statistics.locator('.stat-card').nth(1)).toContainText('0');
    await expect(statistics.getByRole('img', { name: /Vittorie per tentativi/ })).toHaveAttribute('aria-label', /1: 1, 2: 0/);
    await expect(statistics).toContainText('Punteggio totale: 1500');
  }
  const saved = await page.evaluate(({ key, day }) => JSON.parse(localStorage.getItem(key)!).games[day], { key, day });
  expect(saved.guesses).toHaveLength(1);
});

test('unstarted and started expiries differ and remain counted once on reload', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  const stats = await openStatistics(page);
  await expect(stats).toContainText('Punteggio totale: 0');
  await expect(stats).toContainText('Nessuna vittoria ancora.');
  await page.clock.setFixedTime(new Date('2026-03-11T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.toast')).toBeVisible();
  await expect(stats).toContainText('Punteggio totale: 0');
  await expect.poll(() => page.evaluate(k => !!JSON.parse(localStorage.getItem(k)!).games['2026-03-11'], key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-11'].solution as string, key);
  await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
  await page.locator('.board').click();
  await page.keyboard.type(allowedWords.find(word => word !== solution)!);
  await page.keyboard.press('Enter');
  await expect(page.locator('[aria-live="polite"].visually-hidden')).toHaveText('Tentativo inviato');
  await openStatistics(page);
  await page.clock.setFixedTime(new Date('2026-03-12T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(stats.locator('.stat-card').nth(1)).toContainText('1');
  await page.reload();
  await expect((await openStatistics(page)).locator('.stat-card').nth(1)).toContainText('1');
});
