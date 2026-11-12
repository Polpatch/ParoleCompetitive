import { expect, test } from '@playwright/test';

for (const [width, height] of [[320, 568], [360, 640], [390, 844], [1280, 800]]) {
  test(`anchored keyboard and centered board/date at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const header = rect('.game-content > header'), board = rect('.board-group'), keyboard = rect('.keyboard');
      return { header: header.bottom, top: board.top, bottom: board.bottom, keyboard: keyboard.top,
        keyboardBottom: keyboard.bottom, height: innerHeight, scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth, width: innerWidth };
    });
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.height);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width);
    expect(geometry.height - geometry.keyboardBottom).toBeLessThanOrEqual(10);
    expect(Math.abs((geometry.top - geometry.header) - (geometry.keyboard - geometry.bottom))).toBeLessThan(3);
    await expect(page.locator('.live-board .tile')).toHaveCount(30);
    await expect(page.locator('.keyboard-row')).toHaveCount(3);
  });
}

test('short view scrolls the upper area while retaining the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 320 });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  const content = page.locator('.game-content');
  expect(await content.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  const keyboard = page.locator('.keyboard');
  const before = await keyboard.boundingBox();
  await page.locator('.live-board .tile').last().scrollIntoViewIfNeeded();
  const last = await page.locator('.live-board .tile').last().boundingBox();
  const after = await keyboard.boundingBox();
  expect(after!.y).toBe(before!.y);
  expect(last!.y + last!.height).toBeLessThanOrEqual(after!.y);
  await page.locator('#menu-trigger').focus();
  await expect(page.locator('#menu-trigger')).toBeFocused();
});

test('extreme height falls back to whole-page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 160 });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  await page.getByRole('button', { name: 'Cancella' }).scrollIntoViewIfNeeded();
  const box = await page.getByRole('button', { name: 'Cancella' }).boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(160);
});


test('enlarged text and unavailable warnings remain reachable above the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.clock.setFixedTime(new Date('2026-11-09T12:00:00Z'));
  await page.route('**/daily/current.json**', route => route.abort());
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new Error('unavailable'); } });
  });
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '150%'; });
  const keyboard = page.locator('.keyboard');
  const retry = page.getByRole('button', { name: 'Riprova' });
  await expect(retry).toBeEnabled();
  await retry.scrollIntoViewIfNeeded();
  const retryBox = await retry.boundingBox();
  const keyboardBox = await keyboard.boundingBox();
  expect(retryBox!.y + retryBox!.height).toBeLessThanOrEqual(keyboardBox!.y + 1);
  await page.getByText('Salvataggio non disponibile:', { exact: false }).scrollIntoViewIfNeeded();
  const warning = await page.getByText('Salvataggio non disponibile:', { exact: false }).boundingBox();
  expect(warning!.y + warning!.height).toBeLessThanOrEqual(keyboardBox!.y + 1);
  await page.locator('.live-board .tile').last().scrollIntoViewIfNeeded();
  const tile = await page.locator('.live-board .tile').last().boundingBox();
  expect(tile!.y + tile!.height).toBeLessThanOrEqual(keyboardBox!.y + 1);
});