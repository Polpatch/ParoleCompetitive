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
