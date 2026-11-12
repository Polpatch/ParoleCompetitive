import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openAction(page: Page, name: string) {
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.clock.runFor(200);
  await page.getByRole('button', { name, exact: true }).click();
}

const storageKey = 'parolecompetitive:session:v1';

test('embedded keys act on press and repeat after one second without a click duplicate', async ({ page }) => {
  const now = new Date('2026-03-10T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(key => !!localStorage.getItem(key), storageKey)).toBe(true);
  const draft = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).games['2026-03-10'].draft as string, storageKey);
  const button = page.locator('.keyboard [data-letter="A"]');
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect.poll(draft).toBe('A');
  await expect(button).toHaveClass(/held/);
  await page.clock.runFor(999);
  expect(await draft()).toBe('A');
  await page.clock.runFor(1);
  await expect.poll(draft).toBe('AA');
  await page.clock.runFor(150);
  await expect.poll(draft).toBe('AAA');
  await page.mouse.up();
  await page.clock.runFor(500);
  expect(await draft()).toBe('AAA');
  await expect(button).not.toHaveClass(/held/);
});

test('opening a modal stops a held key and semantic activation remains available', async ({ page }) => {
  const now = new Date('2026-03-10T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(key => !!localStorage.getItem(key), storageKey)).toBe(true);
  const button = page.locator('.keyboard [data-letter="A"]');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.board .tile').first()).toHaveText('A');
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator('.board .tile').nth(1)).toHaveText('A');
  await openAction(page, 'Come si gioca');
  await page.clock.runFor(2000);
  await page.mouse.up();
  await expect(page.locator('.board .tile').nth(2)).toHaveText('');
});

for (const appearance of ['light', 'dark'] as const) {
  test(`narrow keyboard keeps press feedback contained in ${appearance} appearance`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.emulateMedia({ colorScheme: appearance });
    await page.clock.install({ time: new Date('2026-03-10T12:00:00Z') });
    await page.goto('/ParoleCompetitive/');
    const rows = page.locator('.keyboard-row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator('button')).toHaveText('QWERTYUIOP'.split(''));
    await expect(rows.nth(1).locator('button')).toHaveText('ASDFGHJKL'.split(''));
    const lower = rows.nth(2).locator('button');
    await expect(lower).toHaveCount(9);
    await expect(lower.first()).toHaveAttribute('aria-label', 'Invio');
    await expect(lower.last()).toHaveAttribute('aria-label', 'Cancella');
    await expect(rows.nth(2).locator('[data-letter]')).toHaveText('ZXCVBNM'.split(''));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const positions = await lower.evaluateAll(buttons => buttons.map(button => {
      const { left, right, top } = button.getBoundingClientRect();
      return { left, right, top };
    }));
    expect(positions.every(position => position.top === positions[0].top)).toBe(true);
    expect(positions.every((position, index) => index === 0 || positions[index - 1].right <= position.left)).toBe(true);

    const key = page.locator('.keyboard [data-letter="A"]');
    await expect(key).toBeEnabled();
    await key.focus();
    await expect(key).toHaveCSS('outline-style', 'solid');
    const box = (await key.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(key).toHaveClass(/held/);
    await key.focus();
    expect(await key.evaluate(element => {
      const style = getComputedStyle(element);
      return parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
    })).toBeLessThanOrEqual(0);
    await expect(key).toHaveCSS('box-shadow', /inset/);
    await page.mouse.up();
    await expect(key).not.toHaveClass(/held/);
    await expect(key).toHaveCSS('box-shadow', 'none');

    await page.mouse.down();
    await expect(key).toHaveClass(/held/);
    await key.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', bubbles: true });
    await expect(key).not.toHaveClass(/held/);
    await expect(key).toHaveCSS('box-shadow', 'none');
    await page.mouse.up();

    await lower.last().click();
    await expect(page.locator('.board .tile').nth(1)).toHaveText('');
    await lower.first().click();
    await expect(page.locator('.toast').getByText('Servono 5 lettere dalla A alla Z')).toBeVisible();
  });
}

test('touch release and cancellation clear pressed feedback', async ({ page, context }) => {
  await page.clock.install({ time: new Date('2026-03-10T12:00:00Z') });
  await page.goto('/ParoleCompetitive/');
  const key = page.locator('.keyboard [data-letter="A"]');
  await expect(key).toBeEnabled();
  const box = (await key.boundingBox())!;
  const touchPoints = [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }];
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints });
  await expect(key).toHaveClass(/held/);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(key).not.toHaveClass(/held/);
  await expect(key).toHaveCSS('box-shadow', 'none');
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints });
  await expect(key).toHaveClass(/held/);
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(key).not.toHaveClass(/held/);
  await expect(key).toHaveCSS('box-shadow', 'none');
});
