import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

test('mobile reloads retain the initial viewport scale', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto(process.env.PAROLE_TEST_URL ?? '/ParoleCompetitive/');

  for (let reload = 0; reload < 5; reload++) {
    await page.reload();
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
    const viewport = await page.evaluate(() => ({
      scale: window.visualViewport?.scale,
      width: window.visualViewport?.width,
      layoutWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.scale).toBeCloseTo(1, 2);
    expect(viewport.width).toBeCloseTo(390, 0);
    expect(viewport.layoutWidth).toBe(390);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(390);
    await expect(page.locator('.live-board .tile')).toHaveCount(30);
    await expect(page.locator('.keyboard-row')).toHaveCount(3);
    await expect(page.locator('.live-board .tile').last()).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Invio' })).toBeInViewport();
  }
});
