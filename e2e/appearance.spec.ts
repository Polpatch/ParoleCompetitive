import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openAction(page: Page, name: string) {
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

const key = 'parolecompetitive:session:v1';

test('system follows the device, manual choices override it, and the open settings retain focus and scroll', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.type('A');
  await openAction(page, 'Impostazioni');
  const dialog = page.getByRole('dialog', { name: 'Impostazioni' });
  const system = dialog.getByRole('radio', { name: 'Sistema' });
  const light = dialog.getByRole('radio', { name: 'Chiaro' });
  const dark = dialog.getByRole('radio', { name: 'Scuro' });
  await expect(system).toBeChecked();
  const lightBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await system.focus();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(lightBackground);
  const darkBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await expect(system).toBeChecked();
  await expect(system).toBeFocused();
  await expect(dialog).toBeVisible();
  await light.check();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  await expect(light).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('background-color', lightBackground);
  await page.emulateMedia({ colorScheme: 'light' });
  await dark.check();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect(dark).toBeFocused();
  const scroll = await dialog.locator('.modal-content').evaluate(el => el.scrollTop);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).toHaveCSS('background-color', darkBackground);
  expect(await dialog.locator('.modal-content').evaluate(el => el.scrollTop)).toBe(scroll);
  await expect(dark).toBeChecked();
  await page.reload();
  await openAction(page, 'Impostazioni');
  await expect(dark).toBeChecked();
  await expect(page.locator('.tile').first()).toHaveText('A');
  await system.check();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'system');
  await expect(page.locator('body')).toHaveCSS('background-color', lightBackground);
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).preferences.appearance, key)).toBe('system');
});

test('legacy progress, score and statistics survive appearance changes', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.locator('#statistics')).toContainText('Vittorie1');
  const saved = await page.evaluate(k => {
    const state = JSON.parse(localStorage.getItem(k)!);
    delete state.preferences.appearance;
    localStorage.setItem(k, JSON.stringify(state));
    return state;
  }, key);
  await page.reload();
  await openAction(page, 'Impostazioni');
  await expect(page.getByRole('radio', { name: 'Sistema' })).toBeChecked();
  await page.getByRole('radio', { name: 'Scuro' }).check();
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).preferences.appearance, key)).toBe('dark');
  const restored = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(restored.games).toEqual(saved.games);
  expect(restored.preferences).toEqual({ ...saved.preferences, appearance: 'dark' });
  await page.getByRole('button', { name: 'Chiudi finestra', exact: true }).click();
  await openAction(page, 'Statistiche');
  await expect(page.locator('#statistics')).toContainText('Vittorie1');
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
  await page.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect(
    page.locator('.toast').or(page.getByRole('textbox', { name: 'Testo da copiare' })),
  ).toBeVisible();
  await expect(page.locator('.tile.green').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('.keyboard button:disabled').first()).toBeDisabled();
});

test('unavailable storage keeps the appearance in memory and displays the warning', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('storage unavailable'); };
  });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('alert')).toContainText('Salvataggio non disponibile');
  await openAction(page, 'Impostazioni');
  await page.getByRole('radio', { name: 'Chiaro' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  const lightBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('radio', { name: 'Scuro' }).check();
  await expect.poll(() => page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(lightBackground);
  await expect(page.getByRole('radio', { name: 'Scuro' })).toBeChecked();
  await page.getByRole('button', { name: 'Chiudi finestra', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Salvataggio non disponibile');
});

for (const appearance of ['Chiaro', 'Scuro'] as const) {
  test(`tiles, controls, focus and sharing feedback remain legible in ${appearance}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ParoleCompetitive/');
    await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
    const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
    await openAction(page, 'Impostazioni');
    const settings = page.getByRole('dialog', { name: 'Impostazioni' });
    await settings.getByRole('radio', { name: appearance }).check();
    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return false;
      const style = getComputedStyle(active);
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 3;
    })).toBe(true);
    await settings.getByRole('button', { name: 'Chiudi finestra', exact: true }).click();
    await page.locator('.board').click();
    await page.keyboard.type(solution);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Statistiche' });
    await expect(dialog).toBeVisible();
    await expect(page.locator('.tile.green').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.keyboard button.green').first()).toHaveCSS('background-color', 'rgb(35, 117, 77)');
    await expect(page.locator('.keyboard button:disabled').first()).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Condividi risultato' }).click();
    await expect(page.locator('.toast')).toBeVisible();
  });
}
