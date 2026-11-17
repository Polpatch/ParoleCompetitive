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
      const pixels = ctx.getImageData(64 + x * 44, 88 + y * 44, 40, 40).data;
      const expected = y === 1 ? [35, 117, 77, 255] : dark ? [34, 39, 36, 255] : [255, 254, 250, 255];
      const border = dark ? [70, 83, 75, 255] : [203, 215, 207, 255];
      for (let index = 0; index < pixels.length; index += 4) {
        let fillMatches = true, borderMatches = true;
        for (let channel = 0; channel < 4; channel++) {
          fillMatches &&= pixels[index + channel] === expected[channel];
          borderMatches &&= pixels[index + channel] === border[channel];
        }
        if (!fillMatches && (y === 1 || !borderMatches)) return false;
      }
      return true;
    }));
    const background = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    return { type: file.type, width: image.width, height: image.height, colors, background, active: (window as Window & { shareActivation?: boolean }).shareActivation };
  }, scheme === 'dark');
  expect(exported).toEqual({ type: 'image/png', width: 344, height: 424, colors: Array.from({ length: 6 }, () => Array(5).fill(true)), background: scheme === 'dark' ? [24, 27, 25, 255] : [245, 247, 242, 255], active: true });
});

test('spoiler-free first-guess win keeps only the permitted green feedback in its PNG', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: (data: ShareData) => {
      (window as Window & { sharedFile?: File }).sharedFile = data.files![0];
      return Promise.resolve();
    } });
  });
  await win(page);
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await dialog.getByRole('button', { name: 'Chiudi finestra' }).click();
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
  const settings = page.getByRole('dialog', { name: 'Impostazioni' });
  await settings.getByRole('checkbox', { name: 'Condivisione spoiler-free' }).uncheck();
  await settings.getByRole('checkbox', { name: 'Condivisione spoiler-free' }).check();
  await settings.getByRole('button', { name: 'Chiudi finestra' }).click();
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Condividi risultato' }).click();
  const firstRow = await page.evaluate(async () => {
    const file = (window as Window & { sharedFile?: File }).sharedFile!;
    const image = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    return Array.from({ length: 5 }, (_, x) => Array.from(context.getImageData(64 + 44 * x, 88, 40, 40).data)
      .every((value, index) => value === [35, 117, 77, 255][index % 4]));
  });
  expect(firstRow).toEqual(Array(5).fill(true));
});

test('denied clipboard leaves selectable private text above the fixed footer', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await win(page);
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await dialog.getByRole('radio', { name: 'Testo puro' }).check();
  await dialog.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect(dialog).toContainText('Copia il testo qui sotto');
  const text = dialog.getByLabel('Testo da copiare');
  const value = await text.inputValue();
  expect(value.split('\n')[4]).toBe('🟩🟩🟩🟩🟩');
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

