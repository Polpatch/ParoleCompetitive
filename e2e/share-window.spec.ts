import { expect, test, type Page } from '@playwright/test';
import { allowedWords } from '../src/word-data';

const key = 'parolecompetitive:session:v1';

async function win(page: Page, withEarlierGuess = false): Promise<void> {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => {
    const games = JSON.parse(localStorage.getItem(k)!).games;
    return games[Object.keys(games)[0]].solution as string;
  }, key);
  if (withEarlierGuess) {
    const guess = allowedWords.find(word => word !== solution)!;
    await page.keyboard.type(guess);
    await page.keyboard.press('Enter');
    await expect(page.locator('[aria-live="polite"].visually-hidden')).toHaveText('Tentativo inviato');
  }
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Statistiche' }).getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
}

for (const scheme of ['light', 'dark'] as const) test(`native share receives the private PNG in system ${scheme} appearance`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: (data: ShareData) => {
      (window as Window & { sharedFile?: File }).sharedFile = data.files![0];
      (window as Window & { shareActivation?: boolean }).shareActivation = navigator.userActivation.isActive;
      return Promise.resolve();
    } });
  });
  await win(page, true);
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(page.locator('main [data-action="share"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect(dialog.locator('.toast')).toBeVisible();
  const exported = await page.evaluate(async dark => {
    const file = (window as Window & { sharedFile?: File }).sharedFile;
    if (!file) throw new Error('Native share did not receive a file');
    const image = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    const colors = Array.from({ length: 6 }, (_, y) => Array.from({ length: 5 }, (_, x) => {
      const pixels = ctx.getImageData(64 + x * 76, 155 + y * 76, 68, 68).data;
      const expected = y === 1 ? [22, 163, 74, 255] : dark ? [70, 83, 75, 255] : [229, 231, 235, 255];
      return Array.from(pixels).every((value, index) => value === expected[index % 4]);
    }));
    const background = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    return { type: file.type, width: image.width, height: image.height, colors, background, active: (window as Window & { shareActivation?: boolean }).shareActivation };
  }, scheme === 'dark');
  expect(exported).toEqual({ type: 'image/png', width: 500, height: 750, colors: Array.from({ length: 6 }, () => Array(5).fill(true)), background: scheme === 'dark' ? [34, 39, 36, 255] : [255, 254, 250, 255], active: true });
});

test('denied clipboard leaves selectable private text above the fixed footer', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await win(page);
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await dialog.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect(dialog).toContainText('Copia il testo qui sotto');
  const text = dialog.getByLabel('Testo da copiare');
  const value = await text.inputValue();
  expect(value.split('\n')[4]).toBe('⬜⬜⬜⬜⬜');
  const solution = await page.evaluate(k => {
    const games = JSON.parse(localStorage.getItem(k)!).games;
    return games[Object.keys(games)[0]].solution as string;
  }, key);
  expect(value).not.toContain(solution);
  await text.focus();
  await expect(text).toBeFocused();
  await text.evaluate(el => el.scrollIntoView());
  const bounds = await dialog.evaluate(el => {
    const content = el.querySelector('.modal-content')!.getBoundingClientRect();
    const footer = el.querySelector('footer')!.getBoundingClientRect();
    const text = el.querySelector('textarea')!.getBoundingClientRect();
    return { contentBottom: content.bottom, footerTop: footer.top, textBottom: text.bottom };
  });
  expect(bounds.contentBottom).toBeLessThanOrEqual(bounds.footerTop);
  expect(bounds.textBottom).toBeLessThanOrEqual(bounds.footerTop);
  await page.keyboard.press('ControlOrMeta+A');
  expect(await text.evaluate(el => (el as HTMLTextAreaElement).selectionEnd - (el as HTMLTextAreaElement).selectionStart)).toBe(value.length);
});
