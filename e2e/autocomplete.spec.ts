import { expect, test } from '@playwright/test';
import { createGame, editDraft, submitGuess } from '../src/game';
import { defaultPreferences } from '../src/preferences';
import { ACTIVATION_DATE } from '../src/daily-word';
import { allowedWords, vocabularyId } from '../src/word-data';

const key = 'parolecompetitive:session:v1';
const date = '2026-03-10';
const now = Date.parse(`${date}T12:00:00Z`);

const selection = {
  schema: 1, date: ACTIVATION_DATE, vocabularyId,
  challengeId: `hmac-v1:${ACTIVATION_DATE}:${vocabularyId}`, index: allowedWords.indexOf('AMORE'),
};
test.beforeEach(async ({ context }) => {
  await context.route('**/daily/current.json*', route => route.fulfill({ json: selection }));
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`autocomplete reveal and positional restoration with ${reducedMotion}`, async ({ page }) => {
    const game = createGame({ date, solution: 'AMORE', scheduleId: 'v1', autocomplete: true });
    const saved = { preferences: { ...defaultPreferences(), autocomplete: true }, games: { [date]: game } };
    await page.clock.install({ time: now });
    await page.clock.pauseAt(now);
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(({ key, saved }) => {
      if (!sessionStorage.getItem('autocomplete-fixture')) {
        localStorage.setItem(key, JSON.stringify(saved));
        sessionStorage.setItem('autocomplete-fixture', '1');
      }
    }, { key, saved });
    await page.goto('/ParoleCompetitive/');
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
    await page.keyboard.type('AUDIO');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].guesses.length, { key, date })).toBe(1);
    const fixed = page.locator('.tile').nth(5);
    if (reducedMotion === 'no-preference') {
      await expect(fixed).toHaveText('');
      await expect(page.getByRole('button', { name: 'Invio' })).toBeDisabled();
      await page.clock.runFor(2199);
      await expect(fixed).toHaveText('');
      await page.clock.runFor(1);
    }
    await expect(fixed).toHaveText('A');
    await expect(fixed).toHaveAttribute('aria-label', /A.*posizione 1.*corretta.*fissa/);
    await page.keyboard.type('M');
    await expect(page.locator('.tile').nth(6)).toHaveText('M');
    await page.getByRole('button', { name: 'Cancella' }).click();
    await expect(page.locator('.tile').nth(6)).toHaveText('');
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await expect(page.locator('.tile').nth(6)).toHaveText('M');
    await page.reload();
    await expect(fixed).toHaveText('A');
    await expect(page.locator('.tile').nth(6)).toHaveText('M');
    await expect(page.locator('.tile.revealing')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toContainText('cinque lettere');
    await expect(page.locator('.tile').nth(6)).toHaveText('M');
  });
}

test('stale public progress cannot replace an acquired autocomplete reveal', async ({ page }) => {
  const instant = Date.parse(`${ACTIVATION_DATE}T12:00:00Z`);
  const current = { ...createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: selection.challengeId, autocomplete: true }), selection };
  const saved = { preferences: { ...defaultPreferences(), autocomplete: true }, games: { [ACTIVATION_DATE]: current } };
  await page.clock.install({ time: instant });
  await page.clock.pauseAt(instant);
  await page.addInitScript(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key, saved });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.type('AUDIO');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  const old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1', autocomplete: false });
  await page.evaluate(({ key, date, old }) => {
    const session = JSON.parse(localStorage.getItem(key)!);
    session.games[date] = old;
    localStorage.setItem(key, JSON.stringify(session));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, { key, date: ACTIVATION_DATE, old });
  await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].scheduleId, { key, date: ACTIVATION_DATE })).toBe(selection.challengeId);
  await page.clock.runFor(2200);
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('.tile').nth(5)).toHaveAttribute('aria-label', /A.*fissa/);
  await expect.poll(() => page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date].autocomplete, { key, date: ACTIVATION_DATE })).toBe(true);
});

test('reload during reveal restores the committed next draft without replay', async ({ page }) => {
  const game = createGame({ date, solution: 'AMORE', scheduleId: 'v1', autocomplete: true });
  const saved = { preferences: { ...defaultPreferences(), autocomplete: true }, games: { [date]: game } };
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.addInitScript(({ key, saved }) => {
    if (!sessionStorage.getItem('reload-fixture')) {
      localStorage.setItem(key, JSON.stringify(saved));
      sessionStorage.setItem('reload-fixture', '1');
    }
  }, { key, saved });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('button', { name: 'A', exact: true })).toBeEnabled();
  await page.keyboard.type('AUDIO');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile.revealing')).toHaveCount(5);
  const committed = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date });
  await page.reload();
  await expect(page.locator('.tile.revealing')).toHaveCount(0);
  await expect(page.locator('.tile').nth(5)).toHaveAttribute('aria-label', /A.*fissa/);
  expect(await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date })).toEqual(committed);
});

test('replacement discards a partly entered old positional draft', async ({ page }) => {
  const instant = Date.parse(`${ACTIVATION_DATE}T12:00:00Z`);
  let old = createGame({ date: ACTIVATION_DATE, solution: 'AMORE', scheduleId: 'v1', autocomplete: true });
  old = submitGuess(old, 'AUDIO', new Set(['AUDIO']), instant - 1000).game;
  old = editDraft(old, 'M');
  const earlier = submitGuess(createGame({ date: '2026-01-01', solution: 'AMORE', scheduleId: 'v1' }), 'AMORE', new Set(['AMORE']), instant - 2000).game;
  const saved = { preferences: { ...defaultPreferences(), autocomplete: false }, games: { [ACTIVATION_DATE]: old, [earlier.date]: earlier } };
  await page.clock.setFixedTime(instant);
  await page.addInitScript(({ key, saved }) => {
    if (!sessionStorage.getItem('partial-fixture')) {
      localStorage.setItem(key, JSON.stringify(saved));
      sessionStorage.setItem('partial-fixture', '1');
    }
  }, { key, saved });
  await page.goto('/ParoleCompetitive/');
  await expect(page.getByRole('status').filter({ hasText: 'sono stati sostituiti' })).toBeVisible();
  await expect(page.locator('.tile.green, .tile.yellow, .tile.gray')).toHaveCount(0);
  const replacement = await page.evaluate(({ key, date }) => JSON.parse(localStorage.getItem(key)!).games[date], { key, date: ACTIVATION_DATE });
  expect(replacement.draft).toBe('');
  expect(replacement.guesses).toHaveLength(0);
  expect(replacement.autocomplete).toBe(false);
  await page.keyboard.type('A');
  await expect(page.locator('.tile').first()).toHaveText('A');
  await page.reload();
  await expect(page.locator('.tile').first()).toHaveText('A');
  await page.getByRole('button', { name: 'Statistiche', exact: true }).click();
  await expect(page.locator('#statistics')).toContainText('Vittorie: 1');
});
