import { expect, test } from '@playwright/test';
import { ACTIVATION_DATE } from '../src/daily-word';
import { createGame, submitGuess } from '../src/game';
import { defaultPreferences } from '../src/preferences';
import { allowedWords, vocabularyId } from '../src/word-data';

const key = 'parolecompetitive:session:v1';
const now = Date.parse(`${ACTIVATION_DATE}T12:00:00Z`);

test.beforeEach(async ({ context }, testInfo) => {
  const date = testInfo.title.startsWith('late withdrawal') ? '2026-11-09' : ACTIVATION_DATE;
  const selection = {
    schema: 1, date, vocabularyId,
    challengeId: `hmac-v1:${date}:${vocabularyId}`, index: allowedWords.indexOf('AMORE'),
  };
  await context.route('**/daily/current.json*', route => route.fulfill({ json: selection }));
});

test('withdrawal restores earlier statistics and persists a fresh replacement', async ({ page }) => {
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' });
  const won = submitGuess(old, 'AMORE', new Set(['AMORE']), now - 1000).game;
  const earlier = { ...won, date: '2026-01-01' };
  const saved = { preferences: defaultPreferences(), games: { [earlier.date]: earlier, [ACTIVATION_DATE]: won } };
  await page.clock.setFixedTime(now);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(({ key, saved }) => {
    if (!sessionStorage.getItem('replacement-fixture')) {
      localStorage.setItem(key, JSON.stringify(saved));
      sessionStorage.setItem('replacement-fixture', 'installed');
    }
  }, { key, saved });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('status').filter({ hasText: 'sono stati sostituiti' })).toBeVisible();
  await expect(page.locator('.tile')).toHaveCount(30);
  await expect(page.locator('.tile.green, .tile.yellow, .tile.gray')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Invio' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('#statistics')).toContainText('Vittorie: 1');
  await expect(page.locator('#statistics')).toContainText('Sconfitte: 0');
  await page.getByRole('button', { name: 'Chiudi' }).click();
  await page.locator('.board').click();
  await page.keyboard.type('audio');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile').first()).toHaveAttribute('aria-label', /posizione|presente|assente/);
  const committed = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games[Object.keys(JSON.parse(localStorage.getItem(k)!).games).sort().at(-1)!], key);
  await page.reload();
  await expect(page.locator('.tile').first()).toHaveAttribute('aria-label', /posizione|presente|assente/);
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).games[Object.keys(JSON.parse(localStorage.getItem(k)!).games).sort().at(-1)!], key)).toEqual(committed);
});

test('concurrent opens serialize withdrawal and retain the replacement result', async ({ context, page }) => {
  await page.clock.setFixedTime(now);
  await page.goto('/ParoleCompetitive/');
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' });
  const won = submitGuess(old, 'AMORE', new Set(['AMORE']), now - 1000).game;
  await page.evaluate(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), {
    key, saved: { preferences: defaultPreferences(), games: { [ACTIVATION_DATE]: won } },
  });
  const other = await context.newPage();
  await other.clock.setFixedTime(now);
  await Promise.all([page.reload(), other.goto('/ParoleCompetitive/')]);
  await expect.poll(() => page.evaluate(({ key, date }) => !!JSON.parse(localStorage.getItem(key) ?? '{}').games?.[date]?.selection, { key, date: ACTIVATION_DATE })).toBe(true);
  const replacement = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  expect(replacement.scheduleId).not.toBe('v1');
  expect(replacement.guesses).toHaveLength(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.type(replacement.solution);
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Vittoria! Punteggio:/).first()).toBeVisible();
  await other.reload();
  await other.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(other.getByText(/Vittoria! Punteggio:/).first()).toBeVisible();
  const saved = await other.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  expect(saved.status).toBe('won');
  expect(saved.guesses).toHaveLength(1);
});

test('a stale public result cannot replace an open secret recap', async ({ page }) => {
  await page.clock.setFixedTime(now);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(({ key, date }) => !!JSON.parse(localStorage.getItem(key) ?? '{}').games?.[date]?.selection, { key, date: ACTIVATION_DATE })).toBe(true);
  const replacement = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  await page.keyboard.type(replacement.solution);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(dialog).toContainText('Durata:');
  const old = submitGuess(createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', new Set(['AMORE']), now).game;
  await page.evaluate(({ key, date, old }) => {
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.games[date] = old;
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect(dialog).toContainText('Durata:');
  await expect(dialog).toContainText('Vittorie: 1');
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toBeVisible();
  await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
});

test('a late clipboard failure still belongs to the retained secret result', async ({ page }) => {
  await page.clock.setFixedTime(now);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: () => new Promise<void>((_resolve, reject) => {
        (window as Window & { rejectCopy?: () => void }).rejectCopy = () => reject(new Error('denied'));
      }),
    } });
  });
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(({ key, date }) => !!JSON.parse(localStorage.getItem(key) ?? '{}').games?.[date]?.selection, { key, date: ACTIVATION_DATE })).toBe(true);
  const replacement = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  await page.keyboard.type(replacement.solution);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Statistiche' });
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Condividi risultato' }).click();
  await expect.poll(() => page.evaluate(() => !!(window as Window & { rejectCopy?: () => void }).rejectCopy)).toBe(true);
  const old = submitGuess(createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', new Set(['AMORE']), now).game;
  await page.evaluate(({ key, date, old }) => {
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.games[date] = old;
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect(dialog.getByRole('button', { name: 'Condividi risultato' })).toBeVisible();
  await page.evaluate(() => (window as Window & { rejectCopy?: () => void }).rejectCopy!());
  await expect(dialog.locator('textarea')).toBeVisible();
  await expect(dialog).toContainText('Copia automatica non riuscita');
});

test('a stale public result cannot cancel a secret terminal reveal', async ({ page }) => {
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(({ key, date }) => !!JSON.parse(localStorage.getItem(key) ?? '{}').games?.[date]?.selection, { key, date: ACTIVATION_DATE })).toBe(true);
  const replacement = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  await page.keyboard.type(replacement.solution);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  const old = submitGuess(createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', new Set(['AMORE']), now).game;
  await page.evaluate(({ key, date, old }) => {
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.games[date] = old;
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].scheduleId, { key, date: ACTIVATION_DATE })).toBe(replacement.scheduleId);
  await page.clock.runFor(3000);
  await expect(page.getByRole('dialog', { name: 'Statistiche' })).toBeVisible();
  await expect(page.locator('.tile.green')).toHaveCount(5);
});

test('late withdrawal discovered by an open tab reports the retired day without replacing today', async ({ page }) => {
  await page.clock.setFixedTime(now + 86400000);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!JSON.parse(localStorage.getItem(k) ?? '{}').games?.['2026-11-09'], key)).toBe(true);
  const current = await page.evaluate(k => {
    const saved = JSON.parse(localStorage.getItem(k)!);
    return saved.games[Object.keys(saved.games).sort().at(-1)!];
  }, key);
  const old = submitGuess(createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', new Set(['AMORE']), now).game;
  await page.evaluate(({ key, date, old }) => {
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.games[date] = old;
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect(page.getByRole('status')).toContainText('sono stati sostituiti');
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(saved.games[ACTIVATION_DATE]).toBeUndefined();
  expect(saved.games[current.date]).toEqual(current);
  await expect(page.locator('.tile.green, .tile.yellow, .tile.gray')).toHaveCount(0);
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('#statistics')).toContainText('Vittorie: 0');
  await expect(page.locator('#statistics')).toContainText('Sconfitte: 0');
});

test('late withdrawal preserves the current day terminal reveal', async ({ page }) => {
  const later = now + 86400000;
  await page.clock.install({ time: later });
  await page.clock.pauseAt(later);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(k => !!JSON.parse(localStorage.getItem(k) ?? '{}').games?.['2026-11-09'], key)).toBe(true);
  const current = await page.evaluate(k => {
    const saved = JSON.parse(localStorage.getItem(k)!);
    return saved.games[Object.keys(saved.games).sort().at(-1)!];
  }, key);
  await page.keyboard.type(current.solution);
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  const old = submitGuess(createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', new Set(['AMORE']), now).game;
  await page.evaluate(({ key, date, old }) => {
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.games[date] = old;
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect(page.getByRole('status').first()).toContainText('sono stati sostituiti');
  expect(await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE })).toBeUndefined();
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await expect(page.locator('#statistics')).toContainText('Vittorie: 0');
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  await page.clock.runFor(2199);
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('#statistics')).toContainText('Vittorie: 1');
  await expect(page.getByRole('button', { name: 'Condividi risultato' })).toBeEnabled();
});

test('stale public progress cannot discard an acquired autocomplete reveal', async ({ page }) => {
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/ParoleCompetitive/');
  await expect.poll(() => page.evaluate(({ key, date }) => !!JSON.parse(localStorage.getItem(key) ?? '{}').games?.[date]?.selection, { key, date: ACTIVATION_DATE })).toBe(true);
  await page.getByRole('button', { name: 'Impostazioni', exact: true }).click();
  await page.getByLabel('Autocomplete', { exact: true }).check();
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).preferences.autocomplete, key)).toBe(true);
  await page.getByRole('button', { name: 'Chiudi' }).click();
  await expect(page.getByRole('dialog', { name: 'Impostazioni' })).toHaveCount(0);
  await page.locator('.board').click();
  await page.keyboard.type('audio');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1', autocomplete: true });
  await page.evaluate(({ key, date, old }) => {
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.games[date] = { ...old, draft: 'AM' };
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].scheduleId, { key, date: ACTIVATION_DATE })).not.toBe('v1');
  await page.clock.runFor(3000);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('.tile').nth(5)).toHaveAttribute('aria-label', /A.*fissa/);
  const replacement = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  expect(replacement.autocomplete).toBe(true);
  expect(replacement.guesses).toHaveLength(1);
});
