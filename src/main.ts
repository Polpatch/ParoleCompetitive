import './style.css';
import { ACTIVATION_DATE, observeDailyWord, romeDate, type DailySelection } from './daily-word';
import { editDraft, fixedLetters, keyboardKnowledge, type Game } from './game';
import { canSelectDifficulty, defaultPreferences, type Appearance, type Difficulty } from './preferences';
import { changeAutocomplete, changeDifficulty, changeSpoilerFree, playGuess, readSession, reconcile, reconcileCutover, SESSION_KEY, writeSession, type Session } from './session';
import { deriveStatistics } from './statistics';
import { prepareResult, sharePrepared, snapshotResult, type PreparedResult } from './share';
import { createSelectionSource } from './selection-source';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application root');
const app: HTMLElement = root;
const icon = (paths: string, className = ''): string => `<svg class="od-icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const icons = {
  menu: icon('<path class="menu-line menu-line-one" d="M5 12h14"/><path class="menu-line menu-line-two" d="M5 12h14"/>', 'menu-icon'),
  settings: icon('<path d="m9 3-.5 2-2 1-2-.5-2 3 1.5 1.5v3L2.5 15l2 3 2-.5 2 1L9 21h6l.5-2.5 2-1 2 .5 2-3-1.5-2v-3L21.5 9l-2-3-2 .5-2-1L15 3Z"/><circle cx="12" cy="12" r="3"/>'),
  guide: icon('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.6 1.4c-.9 1.1-2.1 1.3-2.1 3.1M12 17h.01"/>'),
  statistics: icon('<path d="M4 20V11h4v9M10 20V4h4v16M16 20v-6h4v6M2 20h20"/>'),
  close: icon('<path d="m6 6 12 12M18 6 6 18"/>'),
  delete: icon('<path d="m9 5-7 7 7 7h12V5Z"/><path d="m12 9 6 6m0-6-6 6"/>'),
  enter: icon('<path d="M20 5v9H4m5-5-5 5 5 5"/>'),
  trophy: icon('<path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v7m-4 1h8"/>'),
  loss: icon('<path d="m12 20-8-8a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7Z"/><path d="m12 6-2 4 4 3-2 4"/>'),
};
let session: Session;
let game: Game | null = null;
let message = '';
let storageAvailable = true;
let panel: 'settings' | 'guide' | 'statistics' | null = null;
let menuOpen = false;
let statisticsTab: 'summary' | 'history' = 'summary';
const expandedHistory = new Set<string>();
let prepared: PreparedResult | null = null;
let prepareFailed = false;
let prepareVersion = 0;
let shareEpoch = 0;
let manualText = '';
let queue = Promise.resolve();
let revealing = false;
let revealRow = -1;
let beforeReveal: Game | null = null;
let revealStarted = 0;
let revealTimers: number[] = [];
let rejectionStarted: number | null = null;
let selectionState: 'loading' | 'unavailable' | 'incompatible' | 'available' = 'loading';
const selectionSource = createSelectionSource();
let acquisition: { date: string; promise: Promise<void> } | undefined;
let held: { key: string; pointerId: number; rect: DOMRect; timer?: number } | null = null;
let inputEpoch = 0;

function stopHold(): void {
  if (!held) return;
  const pointerId = held.pointerId;
  if (held.timer !== undefined) window.clearTimeout(held.timer);
  held = null;
  if (app.hasPointerCapture(pointerId)) app.releasePointerCapture(pointerId);
  app.querySelector('.keyboard button.held')?.classList.remove('held');
}

function invalidateInput(): void {
  inputEpoch++;
  stopHold();
}

function setMenu(open: boolean, focus = false): void {
  if (menuOpen !== open) invalidateInput();
  menuOpen = open;
  const trigger = app.querySelector<HTMLButtonElement>('#menu-trigger');
  trigger?.setAttribute('aria-expanded', String(open));
  trigger?.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  app.querySelector('.menu-wrapper')?.classList.toggle('open', open);
  const actions = app.querySelector<HTMLElement>('#menu-actions');
  if (actions) actions.hidden = !open;
  if (focus) trigger?.focus({ preventScroll: true });
}

function closePanel(): void {
  panel = null;
  render();
  app.querySelector<HTMLElement>('#menu-trigger')?.focus({ preventScroll: true });
}

let viewportHeight = 0;
function updateViewportLayout(): void {
  const main = app.querySelector('main');
  const keyboard = app.querySelector<HTMLElement>('.keyboard');
  if (!main || !keyboard) return;
  const height = window.visualViewport?.height ?? window.innerHeight;
  if (height !== viewportHeight) {
    viewportHeight = height;
    document.documentElement.style.setProperty('--viewport-height', `${height}px`);
  }
  const style = getComputedStyle(main);
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const controlHeight = app.querySelector<HTMLElement>('#menu-trigger')?.offsetHeight ?? 0;
  document.body.classList.toggle('document-scroll', keyboard.offsetHeight + padding + controlHeight > height);
}
const layoutObserver = new ResizeObserver(updateViewportLayout);
window.addEventListener('resize', updateViewportLayout);
window.visualViewport?.addEventListener('resize', updateViewportLayout);

function keySelector(key: string): string {
  return key === 'Enter' ? '[data-action="submit"]' : key === 'Backspace' ? '[data-action="delete"]' : `[data-letter="${key}"]`;
}
const live = document.createElement('div');
live.className = 'visually-hidden';
live.setAttribute('aria-live', 'polite');
document.body.append(live);
let toast = '';
let toastRemaining = 4000;
let toastStarted = 0;
let toastTimer: number | undefined;
let toastHovered = false;
let toastFocused = false;
let toastExitTimer: number | undefined;
let toastElement: HTMLElement | null = null;

function placeToast(): void {
  if (!toastElement) return;
  const target = app.querySelector('.modal-header') ?? document.body;
  if (toastElement.parentElement !== target) target.append(toastElement);
}

function pauseToast(): void {
  if (toastTimer !== undefined) {
    window.clearTimeout(toastTimer);
    toastTimer = undefined;
    toastRemaining = Math.max(0, toastRemaining - (performance.now() - toastStarted));
  }
}

function resumeToast(): void {
  if (!toast || toastHovered || toastFocused || document.hidden || toastTimer !== undefined || toastExitTimer !== undefined || toastElement?.classList.contains('is-closing')) return;
  toastStarted = performance.now();
  toastTimer = window.setTimeout(() => {
    toastTimer = undefined;
    dismissToast();
  }, toastRemaining);
}

function clearToast(): void {
  pauseToast();
  if (toastExitTimer !== undefined) window.clearTimeout(toastExitTimer);
  toastExitTimer = undefined;
  const previous = toastElement;
  toastElement = null;
  toast = '';
  toastHovered = false;
  toastFocused = false;
  previous?.remove();
  live.textContent = '';
}

function dismissToast(): void {
  if (!toastElement || toastExitTimer !== undefined) return;
  pauseToast();
  const closing = toastElement;
  closing.classList.add('is-closing');
  if (closing.contains(document.activeElement)) {
    (app.querySelector<HTMLElement>(panel ? '[data-action="close"]' : '#menu-trigger'))?.focus({ preventScroll: true });
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { clearToast(); return; }
  toastExitTimer = window.setTimeout(() => {
    if (toastElement === closing) clearToast();
  }, 200);
}

function showToast(text: string): void {
  if (!text || text === toast && toastExitTimer === undefined) return;
  clearToast();
  toast = text;
  toastRemaining = 4000;
  const element = document.createElement('div');
  element.className = 'toast';
  const label = document.createElement('span');
  label.textContent = text;
  const close = document.createElement('button');
  close.type = 'button';
  close.id = 'toast-dismiss';
  close.setAttribute('aria-label', 'Chiudi notifica');
  close.innerHTML = icons.close;
  close.addEventListener('click', dismissToast);
  element.append(label, close);
  element.addEventListener('mouseenter', () => { toastHovered = true; pauseToast(); });
  element.addEventListener('mouseleave', () => { toastHovered = false; resumeToast(); });
  element.addEventListener('focusin', () => { toastFocused = true; pauseToast(); });
  element.addEventListener('focusout', event => {
    if (!element.contains(event.relatedTarget as Node | null)) { toastFocused = false; resumeToast(); }
  });
  toastElement = element;
  placeToast();
  live.textContent = text;
  resumeToast();
}

function formatDuration(current: Game): string {
  const seconds = Math.floor(Math.max(0, (current.endedAt ?? 0) - (current.startedAt ?? 0)) / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}:${String(seconds % 60).padStart(2, '0')}` : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function resetStatisticsView(): void {
  statisticsTab = 'summary';
  expandedHistory.clear();
}

function historyRecords(): [string, Game][] {
  const records: [string, Game][] = [
    ...Object.entries(session.games).map(([key, value]): [string, Game] => [`game:${key}:${value.scheduleId}`, value]),
    ...Object.entries(session.publicGames ?? {}).map(([key, value]): [string, Game] => [`public:${key}:${value.scheduleId}`, value]),
  ];
  const eligible = records.filter(([, value]) =>
    (value.status === 'won' || value.status === 'lost' || (value.status === 'expired' && value.startedAt !== null))
    && !(revealing && value.date === game?.date && value.scheduleId === game.scheduleId));
  eligible.sort((a, b) => (b[1].endedAt ?? 0) - (a[1].endedAt ?? 0)
    || b[1].date.localeCompare(a[1].date)
    || (a[1].scheduleId < b[1].scheduleId ? -1 : a[1].scheduleId > b[1].scheduleId ? 1 : 0)
    || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const keys = new Set(eligible.map(([key]) => key));
  for (const key of expandedHistory) if (!keys.has(key)) expandedHistory.delete(key);
  return eligible;
}

function historyMarkup(): string {
  const records = historyRecords();
  if (!records.length) return '<p>Nessuna partita conclusa conservata. Sono disponibili solo le partite ancora salvate in questo browser, senza sincronizzazione né recupero dei dati cancellati.</p>';
  return `<p>Storico locale: sono disponibili solo le partite ancora salvate in questo browser, senza sincronizzazione né recupero dei dati cancellati.</p>${records.map(([key, saved]) => {
    const expanded = expandedHistory.has(key);
    const id = Array.from(key, character => character.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    const tiles = saved.guesses.flatMap(guess => Array.from({ length: 5 }, (_, col) => {
      const letter = guess.word[col];
      const feedback = guess.feedback[col];
      const description = `${letter}: ${feedback === 'green' ? 'posizione corretta' : feedback === 'yellow' ? 'presente, posizione diversa' : 'assente'}`;
      return `<div class="tile ${feedback}" role="img" aria-label="${description}">${letter}</div>`;
    })).join('');
    return `<article class="history-entry"><button type="button" id="history-${id}" data-history="${encodeURIComponent(key)}" aria-expanded="${expanded}" aria-controls="history-detail-${id}"><span aria-label="Soluzione ${saved.solution}">${saved.solution}</span> <span aria-label="Tentativi ${saved.guesses.length}">${saved.guesses.length} tentativi</span> <span aria-label="Punti ${saved.score ?? 0}">${saved.score ?? 0} punti</span></button><div id="history-detail-${id}" ${expanded ? '' : 'hidden'}>${expanded ? `<p>Data: ${saved.date} · ${saved.status === 'won' ? 'Vittoria' : saved.status === 'lost' ? 'Sconfitta' : 'Scaduta'} · Tentativi: ${saved.guesses.length} · Punti: ${saved.score ?? 0} · Durata: ${formatDuration(saved)}</p><div class="board history-board" role="group" aria-label="Griglia della partita">${tiles}</div>` : ''}</div></article>`;
  }).join('')}`;
}
const replacementMessage = `La sfida e il risultato del ${ACTIVATION_DATE} sono stati sostituiti. I risultati precedenti e le impostazioni sono conservati.`;

function outcomeMessage(current: Game): string {
  return current.status === 'won' ? `Hai indovinato! Punteggio: ${current.score}` : current.status === 'lost' ? `Tentativi finiti. La parola era ${current.solution}. Punteggio: 0` : '';
}

function clearReveal(): void {
  for (const timer of revealTimers) window.clearTimeout(timer);
  revealTimers = [];
  revealing = false;
  beforeReveal = null;
  revealRow = -1;
}

function revealTile(col: number): void {
  const guess = game?.guesses[revealRow];
  const tile = app.querySelectorAll<HTMLElement>('.tile')[revealRow * 5 + col];
  if (!guess || !tile) return;
  const feedback = guess.feedback[col];
  tile.classList.add(feedback);
  tile.setAttribute('aria-label', `${guess.word[col]}: ${feedback === 'green' ? 'posizione corretta' : feedback === 'yellow' ? 'presente, posizione diversa' : 'assente'}`);
}

function finishReveal(): void {
  if (!game || !revealing || !beforeReveal || game.date !== beforeReveal.date || game.scheduleId !== beforeReveal.scheduleId) return;
  const revealedGame = game;
  const completed = revealedGame.status === 'won' || revealedGame.status === 'lost';
  const currentDay = revealedGame.date === romeDate(Date.now());
  if (storageAvailable) {
    try {
      const saved = readSession(localStorage);
      reconcileCutover(saved, Date.now());
      const current = saved.games[revealedGame.date];
      if (!current || current.scheduleId !== revealedGame.scheduleId) { clearReveal(); enqueue(() => {}); return; }
    } catch { /* Normal reconciliation reports unavailable storage. */ }
  }
  clearReveal();
  if (!currentDay) { enqueue(() => {}); return; }
  if (completed) message = outcomeMessage(revealedGame);
  else live.textContent = 'Tentativo inviato';
  if (completed) { resetStatisticsView(); panel = 'statistics'; }
  render();
  refreshShare();
}

function render(): void {
  if (panel) menuOpen = false;
  if (message) { showToast(message); message = ''; }
  document.documentElement.dataset.appearance = session.preferences.appearance;
  const active = document.activeElement as HTMLElement | null;
  const focusSelector = active?.id ? `#${active.id}` : active?.matches('input[name]') ? `input[name="${(active as HTMLInputElement).name}"][value="${(active as HTMLInputElement).value}"]` : active?.matches('button[data-letter]') ? `button[data-letter="${active.dataset.letter}"]` : active?.matches('button[data-action]') ? `button[data-action="${active.dataset.action}"]` : '';
  const hadPanelFocus = !!active?.closest('[role="dialog"]');
  const scrollTop = app.querySelector<HTMLElement>('.modal-content')?.scrollTop ?? 0;
  const gameScrollTop = app.querySelector<HTMLElement>('.game-content')?.scrollTop ?? 0;
  const keys = keyboardKnowledge(game ? (revealing ? game.guesses.slice(0, -1) : game.guesses) : []);
  const terminal = !!game && (game.status === 'won' || game.status === 'lost' || game.status === 'expired');
  const finished = !game || revealing || terminal;
  const blocked = !!game && !canSelectDifficulty(game, 'hard');
  const historicalPublic = Object.fromEntries(Object.entries(session.publicGames ?? {}).map(([date, saved]) => [`${date}:public`, saved]));
  const stats = deriveStatistics({ ...historicalPublic, ...(beforeReveal && revealing ? { ...session.games, [beforeReveal.date]: beforeReveal } : session.games) });
  const fixed = game ? fixedLetters(game) : [];
  const rejectionElapsed = rejectionStarted === null ? 600 : performance.now() - rejectionStarted;
  const tiles = Array.from({ length: 6 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
    const guess = game?.guesses[row];
    const activeDraft = !!game && !revealing && !terminal && row === game.guesses.length;
    const letter = guess?.word[col] ?? (activeDraft ? game?.draft[col]?.trim() : '') ?? '';
    const isFixed = activeDraft && !!fixed[col];
    const isRevealing = revealing && row === revealRow;
    const isRejected = activeDraft && rejectionElapsed < 600;
    const elapsed = isRevealing ? performance.now() - revealStarted : 0;
    const feedback = isRevealing && elapsed < 500 + col * 300 ? undefined : guess?.feedback[col];
    const description = isFixed ? `${letter}: posizione ${col + 1}, corretta e fissa` : feedback ? `${letter}: ${feedback === 'green' ? 'posizione corretta' : feedback === 'yellow' ? 'presente, posizione diversa' : 'assente'}` : letter || 'vuota';
    const animation = isRevealing ? `style="animation-delay: ${col * 300 - elapsed}ms"` : isRejected ? `style="animation-delay: ${-rejectionElapsed}ms"` : '';
    return `<div class="tile ${isFixed ? 'green' : feedback ?? ''} ${isRevealing ? 'revealing' : ''} ${isRejected ? 'rejected' : ''}" ${animation} aria-label="${description}" role="img">${letter}</div>`;
  }).join('')).join('');
  const keyboard = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, index) => `<div class="keyboard-row">${index === 2 ? `<button type="button" data-action="submit" aria-label="Invio" ${finished ? 'disabled' : ''}>${icons.enter}</button>` : ''}${row.split('').map(letter => `<button type="button" data-letter="${letter}" class="${keys[letter] ?? ''}" ${finished || keys[letter] === 'gray' ? 'disabled' : ''}>${letter}</button>`).join('')}${index === 2 ? `<button type="button" data-action="delete" aria-label="Cancella" ${finished ? 'disabled' : ''}>${icons.delete}</button>` : ''}</div>`).join('');
  const resultVisible = !!game && !revealing && game.date === romeDate() && (game.status === 'won' || game.status === 'lost');
  const maximum = Math.max(...stats.distribution);
  const bars = stats.distribution.map((count, index) => `<div class="chart-column"><span>${count}</span><div class="chart-track"><div class="chart-bar" style="height:${maximum ? count / maximum * 100 : 0}%"></div></div><span>${index + 1}</span></div>`).join('');
  if (toastElement && app.contains(toastElement)) document.body.append(toastElement);
  app.innerHTML = `<main ${panel ? 'inert' : ''}><div class="game-content"><header class="topbar"><h1>ParoleCompetitive</h1><div class="menu-wrapper ${menuOpen ? 'open' : ''}"><button type="button" id="menu-trigger" data-action="menu" aria-label="${menuOpen ? 'Chiudi menu' : 'Apri menu'}" aria-expanded="${menuOpen}" aria-controls="menu-actions">${icons.menu}</button><nav id="menu-actions" class="menu-actions" aria-label="Menu principale" ${menuOpen ? '' : 'hidden'}><button type="button" data-action="settings" aria-label="Impostazioni">${icons.settings}</button><button type="button" data-action="guide" aria-label="Come si gioca">${icons.guide}</button><button type="button" data-action="statistics" aria-label="Statistiche">${icons.statistics}</button></nav></div></header>
    <div class="game-status" ${game && storageAvailable && navigator.locks ? 'hidden' : ''}>
    ${!game ? `<p class="notice" role="status">${selectionState === 'loading' ? 'Carico la sfida…' : selectionState === 'incompatible' ? 'Aggiorna il gioco per questa sfida' : 'Sfida di oggi non disponibile. Riprova più tardi'}</p>` : ''}
    ${!game && selectionState !== 'available' ? `<button type="button" data-action="retry" ${selectionState === 'loading' ? 'disabled' : ''}>Riprova</button>${selectionState === 'incompatible' ? '<button type="button" data-action="reload">Ricarica pagina</button>' : ''}` : ''}
    ${!storageAvailable ? '<p role="alert">Salvataggio non disponibile: i progressi possono andare persi e la sfida giornaliera non è garantita</p>' : !navigator.locks ? '<p role="alert">Usa una sola scheda per evitare conflitti</p>' : ''}
    </div><div class="board-space"><div class="board-group"><div class="board live-board" role="group" aria-label="Griglia dei tentativi">${tiles}</div><div class="game-date">${game?.date ?? romeDate()}</div></div></div></div>
    <div class="keyboard" aria-label="Tastiera">${keyboard}</div>
    </main>
    ${panel ? `<div class="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><p class="modal-eyebrow">PAROLE COMPETITIVE</p><h2 id="modal-title">${panel === 'settings' ? 'Impostazioni' : panel === 'guide' ? 'Come si gioca' : 'Statistiche'}</h2></div><button type="button" data-action="close" aria-label="Chiudi finestra">${icons.close}</button></header><div class="modal-content">
    ${panel === 'guide' ? '<p>Indovina la parola italiana di cinque lettere in sei tentativi.</p><p>I dati restano in questo browser e dispositivo e non si sincronizzano. Cancellare i dati del sito può eliminare i progressi; la navigazione privata può scartarli.</p>' : ''}
    ${panel === 'settings' ? `
      <fieldset ${revealing ? 'disabled' : ''}><legend>Difficoltà ${terminal ? 'della prossima partita' : ''}</legend>
        <label><input type="radio" name="difficulty" value="standard" ${session.preferences.difficulty === 'standard' ? 'checked' : ''}> Standard</label>
        <label><input type="radio" name="difficulty" value="hard" ${session.preferences.difficulty === 'hard' ? 'checked' : ''} ${blocked ? 'disabled aria-describedby="hard-explanation"' : ''}> Difficile</label>
        <p id="hard-explanation">In modalità difficile le lettere verdi restano fisse, le gialle cambiano posizione e ogni lettera rivelata deve comparire almeno tante volte quante osservate in un singolo tentativo. Una partita iniziata difficile e mai declassata riceve un bonus del 10%. Passare a standard dopo il primo tentativo revoca definitivamente il bonus. ${blocked ? 'Non puoi attivare la modalità difficile dopo il primo tentativo accettato; potrai sceglierla per la prossima partita.' : ''}</p>
      </fieldset><fieldset><legend>Aspetto</legend>
        <label><input type="radio" name="appearance" value="system" ${session.preferences.appearance === 'system' ? 'checked' : ''}> Sistema</label>
        <label><input type="radio" name="appearance" value="light" ${session.preferences.appearance === 'light' ? 'checked' : ''}> Chiaro</label>
        <label><input type="radio" name="appearance" value="dark" ${session.preferences.appearance === 'dark' ? 'checked' : ''}> Scuro</label>
      </fieldset><label><input type="checkbox" id="autocomplete" aria-describedby="autocomplete-explanation autocomplete-state" ${session.preferences.autocomplete ? 'checked' : ''} ${game?.status === 'playing' || revealing ? 'disabled' : ''}> Autocomplete</label><p id="autocomplete-explanation">Dopo la rivelazione completa, tutte le lettere verdi già scoperte sono inserite nel tentativo successivo. Sono fisse: non si possono cancellare né sovrascrivere; digitazione e cancella le saltano e compilano i vuoti in ordine. Il fattore ×0,98 si applica dal primo tentativo accettato, anche senza lettere precompilate, e si moltiplica per l'eventuale bonus difficile ×1,10 prima di un unico arrotondamento finale.</p><p id="autocomplete-state">${revealing ? 'Attendi la fine della rivelazione per modificare la scelta.' : game?.status === 'playing' ? 'La scelta è bloccata durante la partita iniziata: non puoi cambiare la modalità né la preferenza futura.' : terminal ? 'Ora la scelta riguarda solo le partite future: non cambia la modalità, il risultato o il punteggio della partita conclusa.' : 'Puoi cambiare la scelta fino al primo tentativo accettato.'}</p><label><input type="checkbox" id="spoiler" ${session.preferences.spoilerFree ? 'checked' : ''}> Condivisione spoiler-free</label><p>Nasconde il feedback del primo tentativo nelle condivisioni successive; non modifica punteggi o risultati.</p><p>I dati restano su questo dispositivo. Cancellare i dati del sito può eliminare i progressi.</p>` : ''}
    ${panel === 'guide' ? `<p>Hai sei tentativi di cinque lettere. Il verde indica la posizione corretta, il giallo una lettera presente in un'altra posizione e il grigio una lettera assente. Con lettere doppie le posizioni corrette sono valutate prima, poi le occorrenze rimanenti da sinistra a destra.</p><p>La parola cambia a mezzanotte in Italia (Europe/Rome). Il tempo parte dal primo tentativo valido e continua anche a pagina chiusa. Anche in standard le lettere sicuramente assenti sono bloccate; difficile aggiunge vincoli di posizione e quantità e il bonus del 10%, perso con il downgrade. Prima del primo tentativo e dopo la partita puoi scegliere liberamente; durante la partita non puoi passare da standard a difficile.</p><p>Una sfida già acquisita resta giocabile offline fino a mezzanotte italiana; l'avvio offline senza una selezione salvata e le sfide future non pubblicate non sono garantiti. Versioni precedenti conservate nella cache possono usare il vecchio calendario e non garantiscono la stessa sfida.</p>` : ''}
    ${panel === 'statistics' ? `<div role="tablist" aria-label="Viste statistiche"><button type="button" role="tab" id="tab-summary" data-action="tab-summary" aria-selected="${statisticsTab === 'summary'}" aria-controls="statistics" tabindex="${statisticsTab === 'summary' ? 0 : -1}">Statistiche</button><button type="button" role="tab" id="tab-history" data-action="tab-history" aria-selected="${statisticsTab === 'history'}" aria-controls="history" tabindex="${statisticsTab === 'history' ? 0 : -1}">Storico</button></div>${statisticsTab === 'summary' ? `<div id="statistics" role="tabpanel" aria-labelledby="tab-summary"><div class="stat-cards"><div class="stat-card"><span class="stat-icon" aria-hidden="true">${icons.trophy}</span><span>Vittorie</span><strong>${stats.wins}</strong></div><div class="stat-card"><span class="stat-icon" aria-hidden="true">${icons.loss}</span><span>Sconfitte</span><strong>${stats.losses}</strong></div></div><p>Punteggio totale: ${stats.totalScore}</p><h3>Vittorie per tentativi</h3><div class="chart" role="img" aria-label="Vittorie per tentativi, scala da zero a ${maximum}. ${stats.distribution.map((n, i) => `${i + 1}: ${n}`).join(', ')}">${bars}</div>${maximum === 0 ? '<p>Nessuna vittoria ancora.</p>' : ''}${resultVisible && game ? `<p>${outcomeMessage(game)}</p><p>Durata: ${formatDuration(game)}</p>` : ''}<p>I dati restano su questo dispositivo. Cancellare i dati del sito può eliminare i progressi.</p>${resultVisible && !prepared && !prepareFailed ? '<p role="status">Preparo il risultato…</p>' : ''}${manualText ? '<p>Copia il testo qui sotto</p><label>Testo da copiare<textarea id="share-text" readonly></textarea></label>' : ''}</div>` : `<div id="history" role="tabpanel" aria-labelledby="tab-history">${historyMarkup()}</div>`}` : ''}
    ${panel === 'statistics' ? statisticsTab === 'summary' ? '<div id="history" role="tabpanel" aria-labelledby="tab-history" hidden></div>' : '<div id="statistics" role="tabpanel" aria-labelledby="tab-summary" hidden></div>' : ''}
    </div>${panel === 'statistics' && statisticsTab === 'summary' && resultVisible ? `<footer><button type="button" data-action="share" ${prepared || prepareFailed ? '' : 'disabled'}>Condividi risultato</button></footer>` : ''}</section></div>` : ''}`;
  if (held) {
    const button = app.querySelector<HTMLButtonElement>(`.keyboard ${keySelector(held.key)}`);
    if (!button || button.disabled || panel || menuOpen) stopHold();
    else button.classList.add('held');
  }
  placeToast();
  const textarea = app.querySelector<HTMLTextAreaElement>('textarea');
  if (textarea) textarea.value = manualText;
  document.body.classList.toggle('modal-open', !!panel);
  const content = app.querySelector<HTMLElement>('.modal-content');
  if (content) content.scrollTop = scrollTop;
  const gameContent = app.querySelector<HTMLElement>('.game-content');
  if (gameContent) gameContent.scrollTop = gameScrollTop;
  const restored = focusSelector ? document.querySelector<HTMLElement>(focusSelector) : null;
  if (panel) {
    if (hadPanelFocus && restored && !restored.hasAttribute('disabled')) restored.focus({ preventScroll: true });
    else (hadPanelFocus && statisticsTab === 'history' && panel === 'statistics' ? app.querySelector<HTMLElement>('#tab-history') : app.querySelector<HTMLElement>('[data-action="close"]'))?.focus({ preventScroll: true });
  } else if (restored) restored.focus({ preventScroll: true });
  toastHovered = !!toastElement?.matches(':hover');
  toastFocused = !!toastElement?.contains(document.activeElement);
  if (toastHovered || toastFocused) pauseToast(); else resumeToast();
  layoutObserver.disconnect();
  const keyboardElement = app.querySelector<HTMLElement>('.keyboard');
  if (keyboardElement) layoutObserver.observe(keyboardElement);
  updateViewportLayout();
}

function refreshShare(): void {
  const version = ++prepareVersion;
  prepared = null;
  prepareFailed = false;
  const snapshot = game ? snapshotResult(game, romeDate(), !revealing) : null;
  if (snapshot) void prepareResult(snapshot, session.preferences.spoilerFree).then(result => {
    if (version === prepareVersion) { prepared = result; render(); }
  }).catch(() => { if (version === prepareVersion) { prepareFailed = true; if (panel === 'statistics' && statisticsTab === 'summary') message = 'Preparazione non riuscita. Riprova'; render(); } });
}

async function perform(action: (current: Session, currentGame: Game | null) => void, selection?: DailySelection): Promise<void> {
  const run = () => {
    try {
      const next = storageAvailable ? readSession(localStorage) : session;
      const now = Date.now();
      const withdrawn = reconcileCutover(next, now);
      const current = reconcile(next, now, selection?.date === romeDate(now) ? selection : undefined);
      const previousCount = current?.guesses.length ?? 0;
      const previous = game;
      const replaced = !!current && !!previous && current.date === previous.date && current.scheduleId !== previous.scheduleId;
      if (!replaced) action(next, current);
      session = next;
      game = current ? next.games[current.date] : null;
      if (storageAvailable) {
        try { writeSession(localStorage, next); }
        catch { storageAvailable = false; }
      }
      if (game?.date !== previous?.date || game?.scheduleId !== previous?.scheduleId) {
        rejectionStarted = null;
        invalidateInput();
        if (previous) clearToast();
        shareEpoch++;
        clearReveal();
        message = previous && previous.date !== romeDate(now) ? 'Nuovo giorno, nuova sfida' : '';
        manualText = '';
      }
      if (replaced) {
        clearToast();
        clearReveal();
        shareEpoch++;
        manualText = '';
        message = replacementMessage + (!game && romeDate(now) === ACTIVATION_DATE ? ' La nuova partita attende la selezione pubblicata.' : '');
      } else if (withdrawn) {
        clearToast();
        message = replacementMessage + (!game && romeDate(now) === ACTIVATION_DATE ? ' La nuova partita attende la selezione pubblicata.' : '');
      }
      if (game && current && game.guesses.length > previousCount) {
        rejectionStarted = null;
        invalidateInput();
        beforeReveal = current;
        revealRow = game.guesses.length - 1;
        revealStarted = performance.now();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          clearReveal();
          if (game.status === 'won' || game.status === 'lost') message = outcomeMessage(game);
          else live.textContent = 'Tentativo inviato';
          if (game.status === 'won' || game.status === 'lost') { resetStatisticsView(); panel = 'statistics'; }
        } else {
          revealing = true;
          for (let col = 0; col < 5; col++) {
            revealTimers.push(window.setTimeout(() => revealTile(col), 500 + col * 300));
          }
          revealTimers.push(window.setTimeout(finishReveal, 2200));
        }
      }
    } catch {
      storageAvailable = false;
      message = '';
    }
    render();
    refreshShare();
  };
  if (navigator.locks) {
    try { await navigator.locks.request('parolecompetitive:session', run); }
    catch { storageAvailable = false; run(); }
  } else run();
}
function enqueue(action: (current: Session, currentGame: Game | null) => void): void {
  queue = queue.then(() => perform(action));
}

function acquireToday(): void {
  const date = romeDate();
  if (game?.date === date || acquisition?.date === date) return;
  selectionState = 'loading';
  render();
  const promise = selectionSource.acquire(date).then(result => {
    queue = queue.then(async () => {
      if (result.kind === 'obsolete' || romeDate() !== date) return;
      await perform(() => {}, result.kind === 'available' ? result.selection : undefined);
      if (romeDate() !== date) return;
      selectionState = game?.date === date ? 'available' : result.kind === 'incompatible' ? 'incompatible' : 'unavailable';
      render();
    });
    return queue;
  }).finally(() => { if (acquisition?.promise === promise) acquisition = undefined; });
  acquisition = { date, promise };
}

async function initialize(): Promise<void> {
  session = { preferences: defaultPreferences(), games: {} };
  await perform(() => {});
  window.addEventListener('storage', event => { if (event.key === SESSION_KEY) enqueue(() => {}); });
  observeDailyWord({ onDay: () => {
    queue = queue.then(async () => {
      await perform(() => {});
      if (!game) acquireToday();
    });
  } });
}

function input(key: string): void {
  if (!game || revealing || panel || menuOpen) return;
  const identity = { date: game.date, scheduleId: game.scheduleId, epoch: inputEpoch };
  queue = queue.then(() => {
    const observed = game;
    if (!observed || identity.epoch !== inputEpoch || panel || menuOpen || observed.date !== identity.date || observed.scheduleId !== identity.scheduleId) return;
    return perform((next, current) => {
      if (identity.epoch !== inputEpoch || panel || menuOpen || revealing || !current || current.date !== observed.date || current.scheduleId !== observed.scheduleId) return;
      if (key === 'Enter' && (current.date !== observed.date || current.guesses.length !== observed.guesses.length || current.status !== observed.status || current.draft !== observed.draft)) {
        message = 'Partita aggiornata in un’altra scheda. Controlla la griglia';
        return;
      }
      message = '';
      if (key === 'Enter') {
        message = playGuess(next, current, Date.now()) ?? '';
        if (message) rejectionStarted = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : performance.now();
      }
      else if (key === 'Backspace') next.games[current.date] = editDraft(current, key);
      else if (/^[a-z]$/i.test(key)) {
        if (keyboardKnowledge(current.guesses)[key.toUpperCase()] === 'gray') message = 'Lettera già esclusa';
        else next.games[current.date] = editDraft(current, key.toUpperCase());
      }
    });
  });
}
app.addEventListener('pointerdown', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.keyboard button');
  if (!button || button.disabled || event.button !== 0 || panel || menuOpen || revealing) return;
  event.preventDefault();
  button.focus({ preventScroll: true });
  stopHold();
  const key = button.dataset.letter ?? (button.dataset.action === 'submit' ? 'Enter' : 'Backspace');
  const press = { key, pointerId: event.pointerId, rect: button.getBoundingClientRect(), timer: undefined as number | undefined };
  held = press;
  button.classList.add('held');
  app.setPointerCapture(event.pointerId);
  input(key);
  const repeat = () => {
    if (held !== press) return;
    input(key);
    press.timer = window.setTimeout(repeat, 150);
  };
  press.timer = window.setTimeout(repeat, 1000);
});
app.addEventListener('pointermove', event => {
  if (!held || event.pointerId !== held.pointerId) return;
  const { left, right, top, bottom } = held.rect;
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) stopHold();
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
  app.addEventListener(type, event => { if (held?.pointerId === event.pointerId) stopHold(); });
}
window.addEventListener('blur', invalidateInput);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { invalidateInput(); pauseToast(); }
  else resumeToast();
});
document.addEventListener('pointerdown', event => {
  if (menuOpen && event.target instanceof Element && !event.target.closest('.menu-wrapper')) setMenu(false);
});
document.addEventListener('focusin', event => {
  if (menuOpen && event.target instanceof Element && !event.target.closest('.menu-wrapper')) setMenu(false);
});
app.addEventListener('click', event => {
  if (panel && event.target instanceof HTMLElement && event.target.classList.contains('backdrop')) {
    closePanel();
    return;
  }
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || button.disabled) return;
  if (button.dataset.action === 'menu') { setMenu(!menuOpen); return; }
  if (button.dataset.action === 'tab-summary' || button.dataset.action === 'tab-history') {
    statisticsTab = button.dataset.action === 'tab-summary' ? 'summary' : 'history';
    if (statisticsTab === 'history') clearToast();
    render();
    app.querySelector<HTMLElement>(`#tab-${statisticsTab}`)?.focus({ preventScroll: true });
    return;
  }
  if (button.dataset.history) {
    const key = decodeURIComponent(button.dataset.history);
    if (expandedHistory.has(key)) expandedHistory.delete(key); else expandedHistory.add(key);
    render();
    return;
  }
  if (button.dataset.action === 'settings' || button.dataset.action === 'guide' || button.dataset.action === 'statistics') {
    invalidateInput();
    menuOpen = false;
    if (button.dataset.action === 'statistics') resetStatisticsView();
    panel = button.dataset.action;
    render();
    return;
  }
  if (button.dataset.action === 'close' && panel) {
    closePanel();
    return;
  }
  if (button.dataset.action === 'retry') { acquireToday(); return; }
  if (button.dataset.action === 'reload') { location.reload(); return; }
  if (button.closest('.keyboard') && event.detail > 0) return;
  if (button.dataset.letter) input(button.dataset.letter);
  else if (button.dataset.action === 'delete') input('Backspace');
  else if (button.dataset.action === 'submit') input('Enter');
  else if (button.dataset.action === 'share' && prepared) {
    const epoch = shareEpoch;
    const resultToShare = prepared;
    if (!game || resultToShare.date !== romeDate() || resultToShare.date !== game.date || resultToShare.scheduleId !== game.scheduleId) {
      enqueue(() => {});
      return;
    }
    if (storageAvailable) {
      try {
        const saved = readSession(localStorage);
        reconcileCutover(saved, Date.now());
        if (saved.games[resultToShare.date]?.scheduleId !== resultToShare.scheduleId) {
          enqueue(() => {});
          return;
        }
      } catch {
        enqueue(() => {});
        return;
      }
    }
    void sharePrepared(resultToShare).then(result => {
      if (epoch !== shareEpoch || !game || game.date !== resultToShare.date || game.scheduleId !== resultToShare.scheduleId || game.date !== romeDate()) return;
      if (result.kind === 'cancelled') return;
      manualText = result.kind === 'manual' ? result.text : '';
      if (result.kind !== 'manual' && panel === 'statistics' && statisticsTab === 'summary') message = result.message;
      render();
    });
  } else if (button.dataset.action === 'share' && prepareFailed) { refreshShare(); render(); }
});
app.addEventListener('change', event => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'difficulty') enqueue((next, current) => { if (!current) next.preferences.difficulty = target.value as Difficulty; else if (!changeDifficulty(next, current, target.value as Difficulty)) message = 'Non puoi attivare la modalità difficile dopo il primo tentativo.'; });
  if (target.name === 'appearance') enqueue(next => { next.preferences.appearance = target.value as Appearance; });
  if (target.id === 'autocomplete') {
    const enabled = target.checked;
    enqueue((next, current) => { if (!current) next.preferences.autocomplete = enabled; else if (!changeAutocomplete(next, current, enabled)) message = 'Autocomplete è bloccato durante la partita iniziata.'; });
  }
  if (target.id === 'spoiler') {
    const enabled = target.checked;
    prepared = null;
    prepareVersion++;
    shareEpoch++;
    manualText = '';
    const shareButton = app.querySelector<HTMLButtonElement>('button[data-action="share"]');
    if (shareButton) shareButton.disabled = true;
    enqueue(next => changeSpoilerFree(next, enabled));
  }
});
document.addEventListener('keydown', event => {
  if (menuOpen) {
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
    return;
  }
  if (panel) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
    } else if (panel === 'statistics' && (event.target as HTMLElement).getAttribute('role') === 'tab' && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      statisticsTab = event.key === 'Home' ? 'summary' : event.key === 'End' ? 'history' : statisticsTab === 'summary' ? 'history' : 'summary';
      if (statisticsTab === 'history') clearToast();
      render();
      app.querySelector<HTMLElement>(`#tab-${statisticsTab}`)?.focus({ preventScroll: true });
    } else if (event.key === 'Tab') {
      const focusable = Array.from(app.querySelectorAll<HTMLElement>('[role="dialog"] button:not(:disabled):not([tabindex="-1"]), [role="dialog"] input:not(:disabled), [role="dialog"] textarea:not(:disabled), [role="dialog"] a[href]'));
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (focusable.length && (index < 0 || (event.shiftKey && index === 0) || (!event.shiftKey && index === focusable.length - 1))) {
        event.preventDefault();
        focusable[event.shiftKey ? focusable.length - 1 : 0].focus();
      }
    }
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (event.target instanceof HTMLElement) {
    const keyboardButton = event.target.closest('.keyboard button');
    if (keyboardButton && event.key === 'Enter') return;
    if (!keyboardButton && (event.target.isContentEditable || event.target.closest('input, textarea, select, button, summary, a, [contenteditable="true"]'))) return;
  }
  if (/^[a-z]$/i.test(event.key) || event.key === 'Enter' || event.key === 'Backspace') { event.preventDefault(); input(event.key); }
});
void initialize();
