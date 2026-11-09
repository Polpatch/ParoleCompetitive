import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const storageKey = 'parolecompetitive:session:v1';

test('touch gestures remain unrestricted while selection is suppressed only on keyboard keys', async ({ page }) => {
  await page.setContent('<main><p>Guide text</p><div class="keyboard"><button>A</button></div><textarea>Manual copy text</textarea></main>');
  await page.addStyleTag({ path: 'src/style.css' });

  for (const selector of ['html', 'body', 'main', 'p', '.keyboard', '.keyboard button', 'textarea']) {
    await expect(page.locator(selector)).toHaveCSS('touch-action', 'auto');
  }
  await expect(page.locator('.keyboard button')).toHaveCSS('user-select', 'none');
  await expect(page.locator('p')).not.toHaveCSS('user-select', 'none');
  await expect(page.locator('textarea')).not.toHaveCSS('user-select', 'none');
  const stylesheet = await readFile('src/style.css', 'utf8');
  expect(stylesheet).toMatch(/\.keyboard button\s*\{[^}]*-webkit-touch-callout:\s*none/);
});

for (const width of [320, 1280]) {
  test(`window controls preserve play and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto('/ParoleCompetitive/');
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
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
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
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
