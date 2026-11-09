import { expect, test } from '@playwright/test';
import { allowedWords } from '../src/word-data';

const key = 'parolecompetitive:session:v1';

test('winning reveal staggers rotations and withholds outcome until completion', async ({ page }) => {
  const now = new Date('2026-03-10T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'], key);
  expect(saved.status).toBe('won');
  expect(saved.startedAt).toBe(now.getTime());
  expect(saved.endedAt).toBe(now.getTime());
  expect(saved.score).toBe(1500);
  const timing = await page.locator('.tile.revealing').evaluateAll(tiles => tiles.map(tile => {
    const animation = tile.getAnimations()[0];
    const timing = animation.effect!.getTiming();
    return { delay: timing.delay, duration: timing.duration };
  }));
  expect(timing).toEqual([0, 300, 600, 900, 1200].map(delay => ({ delay, duration: 1000 })));
  const assertPresentation = async (revealed: number) => {
    for (let i = 0; i < 5; i++) {
      const tile = page.locator('.tile').nth(i);
      await expect(tile).toHaveAttribute('aria-label', i < revealed ? `${solution[i]}: posizione corretta` : solution[i]);
      await expect(tile).toHaveClass(i < revealed ? /green/ : /^(?!.*green).*$/);
    }
    await expect(page.locator('button[data-action="submit"]')).toBeDisabled();
    await expect(page.locator('#statistics')).toContainText('Vittorie: 0');
    await expect(page.getByText(/Vittoria! Punteggio:/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
    await expect(page.locator(`button[data-letter="${solution[0]}"]`)).not.toHaveClass(/green/);
  };
  await assertPresentation(0);
  await page.keyboard.type('A');
  await page.clock.runFor(499);
  await assertPresentation(0);
  for (let i = 0; i < 5; i++) {
    await page.clock.runFor(i === 0 ? 1 : 300);
    await assertPresentation(i + 1);
  }
  await page.clock.runFor(499);
  await assertPresentation(5);
  await page.clock.runFor(1);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('#statistics')).toContainText('Vittorie: 1');
  await expect(page.getByText(/Vittoria! Punteggio:/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
  await expect(page.locator('button[data-action="submit"]')).toBeDisabled();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'], key)).toEqual(saved);
});

test('an ongoing reveal survives a render and unlocks only after the last flip', async ({ page }) => {
  const now = new Date('2026-03-10T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  const wrong = allowedWords.find(word => word !== solution)!;
  await page.keyboard.type(wrong);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
  await page.clock.runFor(800);
  await page.getByLabel('Condivisione spoiler-free').uncheck();
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).preferences.spoilerFree, key)).toBe(false);
  await expect(page.locator('.tile').nth(0)).toHaveAttribute('aria-label', /posizione|presente|assente/);
  await expect(page.locator('.tile').nth(1)).toHaveAttribute('aria-label', /posizione|presente|assente/);
  await expect(page.locator('.tile').nth(2)).toHaveAttribute('aria-label', wrong[2]);
  await page.clock.runFor(1399);
  await expect(page.locator('button[data-action="submit"]')).toBeDisabled();
  await page.clock.runFor(1);
  await expect(page.locator('button[data-action="submit"]')).toBeEnabled();
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
});

test('day change cancels callbacks from the previous reveal', async ({ page }) => {
  const now = new Date('2026-03-10T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(allowedWords.find(word => word !== solution)!);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await page.clock.setFixedTime(new Date('2026-03-11T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('status')).toContainText('Nuova sfida');
  await page.clock.runFor(2200);
  await expect(page.getByRole('status')).toContainText('Nuova sfida');
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Invio' })).toBeEnabled();
});

test('reloading during a reveal restores committed feedback without replay', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'], key);
  await page.reload();
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('.tile.green')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Invio' })).toBeDisabled();
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.getByText(/Vittoria! Punteggio:/).first()).toBeVisible();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'], key)).toEqual(saved);
});

test('reduced motion immediately presents a committed terminal result', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.green')).toHaveCount(5);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('button[data-action="submit"]')).toBeDisabled();
  await expect(page.getByText(/Vittoria! Punteggio: 1500/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
});

for (const viewport of [{ width: 320, height: 812 }, { width: 1280, height: 800 }]) {
  test(`real interface persists play and sharing at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
    await page.goto('/ParoleCompetitive/');
    await expect(page.getByRole('heading', { name: 'ParoleCompetitive' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const rows = page.locator('.keyboard-row');
    await expect(rows).toHaveCount(3);
    const labels = await rows.evaluateAll(elements => elements.map(row => Array.from(row.querySelectorAll('button'), button => button.textContent)));
    expect(labels).toEqual([
      Array.from('QWERTYUIOP'),
      Array.from('ASDFGHJKL'),
      ['Invio', ...Array.from('ZXCVBNM'), 'Cancella'],
    ]);
    for (const row of await rows.all()) {
      const positions = await row.locator('button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().top));
      expect(new Set(positions).size).toBe(1);
    }
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    await page.getByLabel('Difficile', { exact: true }).check();
    await expect(page.getByLabel('Difficile', { exact: true })).toBeChecked();
    await page.getByLabel('Standard', { exact: true }).check();
    await page.getByRole('button', { name: 'Chiudi' }).click();
    await page.getByRole('button', { name: 'A', exact: true }).click();
    await expect(page.locator('.tile').nth(0)).toHaveText('A');
    await page.keyboard.type('B');
    await expect(page.locator('.tile').nth(1)).toHaveText('B');
    await page.keyboard.press('Backspace');
    await expect(page.locator('.tile').nth(1)).toHaveText('');
    await page.getByRole('button', { name: 'Cancella' }).click();
    await expect(page.locator('.tile').nth(0)).toHaveText('');
    const solution = await expect.poll(async () => page.evaluate(k => {
      const state = JSON.parse(localStorage.getItem(k) || '{}');
      return state.games?.['2026-03-10']?.solution;
    }, key)).toBeTruthy().then(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key));
    const wrong = allowedWords.find(word => word !== solution)!;
    for (const letter of wrong) await page.getByRole('button', { name: letter, exact: true }).click();
    await page.getByRole('button', { name: 'Invio' }).click();
    await expect(page.locator('.tile.revealing')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Invio' })).toBeDisabled();
    await expect(page.locator('.tile.revealing')).toHaveCount(0);
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    await expect(page.getByLabel('Difficile', { exact: true })).toBeDisabled();
    await page.reload();
    await expect(page.locator('.tile').nth(0)).toHaveText(wrong[0]);
    await expect(page.locator('.tile').first()).toHaveAttribute('aria-label', /posizione|presente|assente/);
    await page.keyboard.type(solution);
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Vittoria! Punteggio:/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
    await page.getByRole('button', { name: 'Condividi risultato' }).click();
    await expect(page.getByRole('dialog').getByRole('status')).toContainText(/copiat|Copia/i);
    await expect(page.getByText(/Vittorie: 1/)).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
    await expect(page.locator('.tile').nth(5)).toHaveText(solution[0]);
    await page.getByRole('button', { name: 'Chiudi' }).click();
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    await page.getByLabel('Condivisione spoiler-free').uncheck();
    await expect.poll(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).preferences.spoilerFree, key)).toBe(false);
    await page.getByLabel('Difficile', { exact: true }).check();
    await expect.poll(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).preferences.difficulty, key)).toBe('hard');
    await page.reload();
    await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
    await expect(page.getByLabel('Difficile', { exact: true })).toBeChecked();
  });
}

test('day return expires a started game and reduced motion reveals immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(async () => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  const wrong = allowedWords.find(word => word !== solution)!;
  await page.keyboard.type(wrong);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile').first()).toHaveAttribute('aria-label', /posizione|presente|assente/);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Invio' })).toBeEnabled();
  await expect(page.getByRole('status')).toContainText('Tentativo accettato');
  await page.clock.setFixedTime(new Date('2026-03-11T12:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('status')).toContainText('Nuova sfida');
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.getByText(/Sconfitte: 1/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  const old = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'], key);
  expect(old.status).toBe('expired');
  expect(old.score).toBe(0);
  expect(old.endedAt).toBe(Date.parse('2026-03-10T23:00:00Z'));
});

test('keyboard navigation activates controls without submitting a guess', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await page.getByRole('button', { name: 'Q', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile').first()).toHaveText('Q');
  const settings = page.getByRole('button', { name: 'Impostazioni', exact: true });
  await settings.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Condivisione spoiler-free')).toBeVisible();
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
});

test('a storage failure still reveals an accepted in-memory guess with a warning', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(async () => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  await page.keyboard.type(allowedWords.find(word => word !== solution)!);
  await expect(page.locator('.tile').nth(4)).not.toHaveText('');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('storage unavailable'); }; });
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await expect(page.getByRole('alert')).toContainText('Salvataggio non disponibile');
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Tentativo accettato');
});

test('stale tabs reconcile before submission and count a terminal result once', async ({ context, page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(async () => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].solution as string, key);
  const wrong = allowedWords.find(word => word !== solution)!;
  await page.keyboard.type(wrong);
  await expect.poll(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].draft, key)).toBe(wrong);
  const stale = await context.newPage();
  await stale.addInitScript(() => window.addEventListener('storage', event => event.stopImmediatePropagation()));
  await stale.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await stale.goto('/ParoleCompetitive/');
  await expect(stale.locator('.tile').first()).toHaveText(wrong[0]);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await stale.keyboard.press('Enter');
  await expect(stale.getByRole('status')).toContainText('aggiornata in un’altra scheda');
  expect(await stale.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].guesses.length, key)).toBe(1);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Vittoria! Punteggio:/).first()).toBeVisible();
  await stale.keyboard.press('Enter');
  await expect.poll(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].guesses.length, key)).toBe(2);
  await stale.reload();
  await stale.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(stale.getByText(/Vittorie: 1 · Sconfitte: 0/)).toBeVisible();
});

test('a stale draft is reloaded instead of submitting another tab’s word', async ({ context, page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.type(allowedWords[0]);
  await expect.poll(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].draft, key)).toBe(allowedWords[0]);
  const stale = await context.newPage();
  await stale.addInitScript(() => window.addEventListener('storage', event => event.stopImmediatePropagation()));
  await stale.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await stale.goto('/ParoleCompetitive/');
  await expect(stale.locator('.tile').first()).toHaveText(allowedWords[0][0]);
  for (let i = 0; i < 5; i++) await page.keyboard.press('Backspace');
  await page.keyboard.type(allowedWords[1]);
  await expect.poll(async () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].draft, key)).toBe(allowedWords[1]);
  await stale.keyboard.press('Enter');
  await expect(stale.getByRole('status')).toContainText('aggiornata in un’altra scheda');
  await expect(stale.locator('.tile').nth(4)).toHaveText(allowedWords[1][4]);
  expect(await stale.evaluate(k => JSON.parse(localStorage.getItem(k)!).games['2026-03-10'].guesses.length, key)).toBe(0);
});

test('a saved solution outside the dictionary warns and leaves memory play available', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.goto('/ParoleCompetitive/');
  await expect.poll(async () => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  await page.evaluate(k => {
    const state = JSON.parse(localStorage.getItem(k)!);
    state.games['2026-03-10'].solution = 'ZZZZZ';
    localStorage.setItem(k, JSON.stringify(state));
    localStorage.setItem('unrelated', 'keep');
  }, key);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Salvataggio non disponibile');
  await page.keyboard.type('A');
  await expect(page.locator('.tile').first()).toHaveText('A');
  expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe('keep');
});

test('failed result image preparation can be retried', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T12:00:00Z'));
  await page.addInitScript(() => {
    let first = true;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      if (first) { first = false; queueMicrotask(() => callback(null)); return; }
      const bytes = Uint8Array.from(atob(this.toDataURL('image/png').split(',')[1]), char => char.charCodeAt(0));
      queueMicrotask(() => callback(new Blob([bytes], { type: 'image/png' })));
    };
  });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(async () => page.evaluate(k => !!localStorage.getItem(k), key)).toBe(true);
  const solution = await page.evaluate(k => {
    const games = JSON.parse(localStorage.getItem(k)!).games;
    return games[Object.keys(games)[0]].solution as string;
  }, key);
  await page.keyboard.type(solution);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Impossibile preparare la condivisione');
  await page.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
  await page.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText(/copiat|Copia/i);
});
