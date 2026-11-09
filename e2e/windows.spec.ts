import { expect, test } from '@playwright/test';
import { allowedWords } from '../src/word-data';

const key = 'parolecompetitive:session:v1';

test('modal controls contain focus and preserve a draft', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await page.keyboard.type('A');
  for (const name of ['Impostazioni', 'Come si gioca', 'Statistiche']) {
    const trigger = page.getByRole('button', { name, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(name);
    await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await expect.poll(() => page.evaluate(k => Object.values(JSON.parse(localStorage.getItem(k)!).games).some((game: any) => game.draft === 'A'), key)).toBe(true);
});

test('local first-guess victory opens one recap with fixed zero duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(dialog).toContainText('0:00');
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Chiudi' }).click();
  await expect(page.getByRole('button', { name: 'Statistiche', exact: true })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(dialog).toContainText('0:00');
});

test('backdrop dismisses, panel clicks do not, and background stays inert', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await page.keyboard.type('A');
  await page.getByRole('button', { name: 'Come si gioca', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await dialog.click();
  await page.keyboard.type('B');
  await expect(dialog).toBeVisible();
  await expect(page.locator('.tile').nth(1)).toHaveText('');
  await page.locator('.backdrop').click({ position: { x: 2, y: 2 } });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Come si gioca', exact: true })).toBeFocused();
});

test('an open statistics dialog follows the next day without its previous result', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(dialog).toContainText('Durata: 0:00');
  await page.clock.setFixedTime(new Date('2026-03-11T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(dialog).toContainText('Vittorie: 1');
  await expect(dialog).not.toContainText('Durata:');
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
});

test('recap duration is fixed at the terminal submission, including hours', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(allowedWords.find(word => word !== solution)!);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Tentativo accettato');
  await page.clock.setFixedTime(new Date('2026-03-10T13:01:01.900Z'));
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(dialog).toContainText('Durata: 1:01:01');
  await page.clock.setFixedTime(new Date('2026-03-10T14:00:00Z'));
  await dialog.getByRole('button', { name: 'Chiudi' }).click();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(dialog).toContainText('Durata: 1:01:01');
});
