import { expect, test } from '@playwright/test';
import { createGame } from '../src/game';
import { defaultPreferences } from '../src/preferences';

const key = 'parolecompetitive:session:v1';
const date = '2026-03-10';

for (const appearance of ['light', 'dark'] as const) {
  test(`autocomplete setting lifecycle on a narrow ${appearance} screen`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const game = createGame({ date, solution: 'AMORE', scheduleId: 'v1' });
    const saved = { preferences: { ...defaultPreferences(), appearance }, games: { [date]: game } };
    await page.addInitScript(({ key, saved }) => {
      if (!sessionStorage.getItem('settings-fixture')) {
        localStorage.setItem(key, JSON.stringify(saved));
        sessionStorage.setItem('settings-fixture', '1');
      }
    }, { key, saved });
    await page.goto('/ParoleCompetitive/');
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
    await page.keyboard.type('A');
    await page.keyboard.press('Enter');
    await expect(page.locator('.toast')).toContainText(/Servono 5 lettere/);
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Impostazioni' });
    const toggle = dialog.getByRole('checkbox', { name: 'Autocomplete' });
    await expect(toggle).not.toBeChecked();
    await expect(toggle).toHaveAccessibleDescription(/rivelazione completa.*fisse.*×0,98.*×1,10.*arrotondamento/i);
    for (let i = 0; i < 20 && !(await toggle.evaluate(element => element === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Space');
    await expect(toggle).toBeChecked();
    await expect(toggle).toBeFocused();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Condivisione spoiler-free')).toBeChecked();
    await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].draft, { key, date })).toBe('A');
    await page.keyboard.press('Escape');
    await page.locator('.board').click();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await page.keyboard.type('UDIO');
    await page.keyboard.press('Enter');
    await expect(page.locator('[aria-live="polite"].visually-hidden')).toHaveText('Tentativo inviato');
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    await expect(toggle).toBeDisabled();
    await expect(toggle).toHaveAccessibleDescription(/bloccata durante la partita/i);
    await expect(dialog.getByLabel('Condivisione spoiler-free')).toBeEnabled();
    await expect(dialog.getByLabel('Condivisione spoiler-free')).toBeChecked();
    await page.keyboard.press('Escape');
    await page.locator('.board').click();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await page.keyboard.type('MORE');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Statistiche' })).toBeVisible();
    await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    await expect(toggle).toBeEnabled();
    await expect(toggle).toHaveAccessibleDescription(/solo le partite future/i);
    await toggle.uncheck();
    await expect(dialog).toBeVisible();
    const result = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date });
    expect(result.autocomplete).toBe(true);
    expect(result.status).toBe('won');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.keyboard-row')).toHaveCount(3);
  });
}

test('a stale tab cannot change either autocomplete choice after another tab starts play', async ({ context, page }) => {
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const game = createGame({ date, solution: 'AMORE', scheduleId: 'v1' });
  const saved = { preferences: defaultPreferences(), games: { [date]: game } };
  await page.addInitScript(({ key, saved }) => {
    if (!sessionStorage.getItem('settings-fixture')) {
      localStorage.setItem(key, JSON.stringify(saved));
      sessionStorage.setItem('settings-fixture', '1');
    }
  }, { key, saved });
  await page.goto('/ParoleCompetitive/');
  const stale = await context.newPage();
  await stale.addInitScript(() => window.addEventListener('storage', event => event.stopImmediatePropagation()));
  await stale.clock.setFixedTime(new Date(`${date}T12:00:00Z`));
  await stale.goto('/ParoleCompetitive/');
  await stale.getByRole('button', { name: 'Impostazioni', exact: true }).click();
  const toggle = stale.getByRole('checkbox', { name: 'Autocomplete' });
  await expect(toggle).toBeEnabled();
  await page.keyboard.type('AUDIO');
  await page.keyboard.press('Enter');
  await expect(page.locator('[aria-live="polite"].visually-hidden')).toHaveText('Tentativo inviato');
  await toggle.check();
  await expect(toggle).toBeDisabled();
  await expect(toggle).not.toBeChecked();
  const session = await stale.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(session.preferences.autocomplete).toBe(false);
  expect(session.games[date].autocomplete).toBe(false);
  await stale.reload();
  await stale.getByRole('button', { name: 'Impostazioni', exact: true }).click();
  await expect(toggle).toBeDisabled();
  await expect(toggle).not.toBeChecked();
});
