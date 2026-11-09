import { expect, test } from '@playwright/test';

test('production project site loads its assets and accepts a letter', async ({ page, baseURL }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  const failures: string[] = [];
  const assets: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin !== new URL(baseURL!).origin) return;
    if (response.status() >= 400) failures.push(`${response.status()} ${url.pathname}`);
    if (url.pathname.includes('/assets/')) assets.push(url.pathname);
  });

  const response = await page.goto('/ParoleCompetitive/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'ParoleCompetitive' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeVisible();
  const firstTile = page.getByRole('group', { name: 'Griglia dei tentativi' }).locator('.tile').first();
  await expect(firstTile).toHaveText('');
  await page.getByRole('button', { name: 'A', exact: true }).click();
  await expect(firstTile).toHaveText('A');
  expect(assets.length).toBeGreaterThan(0);
  expect(assets.every(path => path.startsWith('/ParoleCompetitive/assets/'))).toBe(true);
  expect(failures).toEqual([]);
});
