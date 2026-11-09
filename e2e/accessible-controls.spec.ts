import { expect, test } from '@playwright/test';

const storageKey = 'parolecompetitive:session:v1';

for (const width of [320, 1280]) {
  test(`window controls preserve play and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto('/ParoleCompetitive/');
    await page.keyboard.type('AB');
    await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'].draft, storageKey)).toBe('AB');
    const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey);

    for (const name of ['Impostazioni', 'Come si gioca', 'Statistiche']) {
      const trigger = page.getByRole('button', { name, exact: true });
      for (let i = 0; i < 50 && !(await trigger.evaluate(element => element === document.activeElement)); i++) {
        await page.keyboard.press('Tab');
      }
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toBeVisible();
      await trigger.click();
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

    const settings = page.getByRole('button', { name: 'Impostazioni', exact: true });
    await settings.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
    await expect(settings).toBeFocused();
    await settings.focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(settings).toBeFocused();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey)).toEqual(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('system appearance follows device changes without dismissing settings or changing play', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await page.keyboard.type('AB');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'].draft, storageKey)).toBe('AB');
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'], storageKey);
  await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
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
