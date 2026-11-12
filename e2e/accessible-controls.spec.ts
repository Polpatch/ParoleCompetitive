import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const storageKey = 'parolecompetitive:session:v1';

async function openAction(page: Page, name: string) {
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

for (const width of [320, 1280]) {
  test(`window controls preserve play and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto('/ParoleCompetitive/');
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
    await page.keyboard.type('AB');
    await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'].draft, storageKey)).toBe('AB');
    const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey);

    const trigger = page.locator('#menu-trigger');
    const menu = page.locator('.menu-actions');
    await expect(menu).toBeHidden();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await page.keyboard.type('C');
    await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'].draft, storageKey)).toBe('AB');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    for (const name of ['Impostazioni', 'Come si gioca', 'Statistiche']) {
      await trigger.click();
      const action = page.getByRole('button', { name, exact: true });
      await action.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(name === 'Statistiche' ? 'Vittorie' : name === 'Impostazioni' ? 'Difficoltà' : 'tentativi');
      await dialog.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.type('C');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey)).toEqual(before);
    }

    await openAction(page, 'Impostazioni');
    await page.getByRole('button', { name: 'Chiudi finestra', exact: true }).click();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Space');
    await expect(menu).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(menu).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('system appearance follows device changes without dismissing settings or changing play', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.type('AB');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'].draft, storageKey)).toBe('AB');
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey);
  await openAction(page, 'Impostazioni');
  const dialog = page.getByRole('dialog');
  await page.getByLabel('Sistema', { exact: true }).check();
  const light = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(light);
  await expect(dialog).toBeVisible();
  await page.getByLabel('Chiaro', { exact: true }).check();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).preferences.appearance, storageKey)).toBe('light');
  const fixed = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).toHaveCSS('background-color', fixed);
  await page.getByLabel('Scuro', { exact: true }).check();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).preferences.appearance, storageKey)).toBe('dark');
  const dark = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('body')).toHaveCSS('background-color', dark);
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey)).toEqual(before);
});
