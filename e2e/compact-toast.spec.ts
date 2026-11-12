import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openAction(page: Page, name: string) {
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

test('compact game and toast remain usable through modal rerenders', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.clock.install({ time: new Date('2026-03-10T12:00:00Z') });
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.tile')).toHaveCount(30);
  await expect(page.locator('.keyboard-row')).toHaveCount(3);
  await page.keyboard.press('Enter');
  const toast = page.locator('.toast');
  await expect(toast).toBeVisible();
  const bounds = await toast.boundingBox();
  expect(bounds!.x + bounds!.width / 2).toBeCloseTo(page.viewportSize()!.width / 2, 0);
  const header = await page.locator('.topbar').boundingBox();
  expect(bounds!.y).toBeLessThan(header!.y + header!.height);
  const text = await toast.innerText();
  await page.keyboard.press('Enter');
  await expect(toast).toHaveCount(1);
  expect(await toast.innerText()).toBe(text);
  await page.clock.fastForward(1000);
  await openAction(page, 'Come si gioca');
  const dialog = page.getByRole('dialog');
  const inDialogToast = dialog.locator('.toast');
  await expect(inDialogToast).toBeVisible();
  await expect(dialog).toContainText('non si sincronizzano');
  await page.keyboard.press('Escape');
  await expect(page.locator('.toast')).toBeVisible();
  await page.clock.fastForward(3001);
  await expect(toast).toHaveClass(/is-closing/);
  await page.clock.fastForward(200);
  await expect(toast).toHaveCount(0);
});

test('toast pauses on hover and can be dismissed without blocking the game', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-03-10T12:00:00Z') });
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.press('Enter');
  const toast = page.locator('.toast');
  await expect(toast).toBeVisible();
  await toast.hover();
  await page.clock.fastForward(5000);
  await expect(toast).toBeVisible();
  await toast.getByRole('button', { name: 'Chiudi notifica' }).click();
  await expect(toast).toHaveClass(/is-closing/);
  await page.clock.fastForward(200);
  await expect(toast).toHaveCount(0);
  await page.getByRole('button', { name: 'A', exact: true }).click();
  await expect(page.locator('.tile').first()).toHaveText('A');
});
test('repeated Enter is deduplicated and keyboard focus pauses the active lifetime', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-03-10T12:00:00Z') });
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.down('Enter');
  await expect(page.locator('.toast')).toBeVisible();
  const announcement = await page.locator('[aria-live="polite"]').last().textContent();
  for (let i = 0; i < 5; i++) await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expect(page.locator('.toast')).toHaveCount(1);
  expect(await page.locator('[aria-live="polite"]').last().textContent()).toBe(announcement);
  await page.clock.fastForward(1000);
  await page.getByRole('button', { name: 'Chiudi notifica' }).focus();
  await page.clock.fastForward(5000);
  await openAction(page, 'Statistiche');
  await page.clock.fastForward(2500);
  await expect(page.locator('.toast')).toBeVisible();
  await page.clock.fastForward(600);
  await expect(page.locator('.toast')).toHaveClass(/is-closing/);
  await page.clock.fastForward(200);
  await expect(page.locator('.toast')).toHaveCount(0);
});

for (const [width, height, textSize] of [[320, 480, '100%'], [640, 320, '100%'], [320, 568, '150%']]) {
  test(`accessible scrolling at ${width}x${height}, text ${textSize}`, async ({ page }) => {
    await page.setViewportSize({ width: Number(width), height: Number(height) });
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
    await page.evaluate(size => { document.documentElement.style.fontSize = size; }, String(textSize));
    const lastKey = page.getByRole('button', { name: 'Cancella' });
    await lastKey.scrollIntoViewIfNeeded();
    await expect(lastKey).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const [width, height] of [[360, 640], [390, 844], [1280, 800]]) {
  test(`game surface and dialogs at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    for (const name of ['Impostazioni', 'Come si gioca', 'Statistiche']) {
      await page.locator('#menu-trigger').click();
      await page.getByRole('button', { name, exact: true }).click();
      const dialog = page.getByRole('dialog', { name });
      await expect(dialog).toBeVisible();
      await expect(page.locator('main')).toHaveAttribute('inert', '');
      await expect(dialog.getByRole('button', { name: 'Chiudi finestra', exact: true })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('#menu-trigger')).toBeFocused();
    }
    await openAction(page, 'Come si gioca');
    const content = page.locator('.modal-content');
    expect(await content.evaluate(element => getComputedStyle(element).overflowY)).toBe('auto');
    if (height === 640) expect(await content.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await page.locator('.backdrop').click({ position: { x: 2, y: 2 } });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

test('unavailable selection and persistent storage warning remain visible', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-09T12:00:00Z'));
  await page.route('**/daily/current.json**', route => route.abort());
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new Error('unavailable'); } });
  });
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByText('Salvataggio non disponibile:', { exact: false })).toBeVisible();
  await expect(page.getByText('Sfida di oggi non disponibile. Riprova più tardi')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Riprova' })).toBeEnabled();
});

test('reduced motion completes a result and preserves the dark modal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  const solution = await page.evaluate(() => JSON.parse(localStorage.getItem('parolecompetitive:session:v1')!).games['2026-03-10'].solution as string);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Statistiche' })).toBeVisible();
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.getByText('Durata: 0:00')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeVisible();
});
