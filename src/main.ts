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
let session: Session;
let game: Game | null = null;
let message = '';
let storageAvailable = true;
let panel: 'settings' | 'guide' | 'statistics' | null = null;
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
let shareMessage = '';
let selectionState: 'loading' | 'unavailable' | 'incompatible' | 'available' = 'loading';
const selectionSource = createSelectionSource();
let acquisition: { date: string; promise: Promise<void> } | undefined;

function formatDuration(current: Game): string {
  const seconds = Math.floor(Math.max(0, (current.endedAt ?? 0) - (current.startedAt ?? 0)) / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}:${String(seconds % 60).padStart(2, '0')}` : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const replacementMessage = `La sfida e il risultato del ${ACTIVATION_DATE} sono stati sostituiti. I risultati precedenti e le impostazioni sono conservati.`;

function outcomeMessage(current: Game): string {
  return current.status === 'won' ? `Vittoria! Punteggio: ${current.score}.` : current.status === 'lost' ? `Partita terminata. La parola era ${current.solution}. Punteggio: 0.` : '';
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
  if (!game) return;
  const completed = game.status === 'won' || game.status === 'lost';
  const currentDay = game.date === romeDate(Date.now());
  if (storageAvailable) {
    try {
      const saved = readSession(localStorage);
      reconcileCutover(saved, Date.now());
      const current = saved.games[game.date];
      if (!current || current.scheduleId !== game.scheduleId) { clearReveal(); enqueue(() => {}); return; }
    } catch { /* Normal reconciliation reports unavailable storage. */ }
  }
  clearReveal();
  if (!currentDay) { enqueue(() => {}); return; }
  message = outcomeMessage(game) || 'Tentativo accettato. Feedback disponibile nella griglia.';
  if (completed) panel = 'statistics';
  render();
  refreshShare();
}

function render(): void {
  document.documentElement.dataset.appearance = session.preferences.appearance;
  const active = document.activeElement as HTMLElement | null;
  const focusSelector = active?.id ? `#${active.id}` : active?.matches('input[name]') ? `input[name="${(active as HTMLInputElement).name}"][value="${(active as HTMLInputElement).value}"]` : active?.matches('button[data-letter]') ? `button[data-letter="${active.dataset.letter}"]` : active?.matches('button[data-action]') ? `button[data-action="${active.dataset.action}"]` : '';
  const hadPanelFocus = !!active?.closest('[role="dialog"]');
  const scrollTop = app.querySelector<HTMLElement>('.modal-content')?.scrollTop ?? 0;
  const keys = keyboardKnowledge(game ? (revealing ? game.guesses.slice(0, -1) : game.guesses) : []);
  const terminal = !!game && (game.status === 'won' || game.status === 'lost' || game.status === 'expired');
  const finished = !game || revealing || terminal;
  const blocked = !!game && !canSelectDifficulty(game, 'hard');
  const historicalPublic = Object.fromEntries(Object.entries(session.publicGames ?? {}).map(([date, saved]) => [`${date}:public`, saved]));
  const stats = deriveStatistics({ ...historicalPublic, ...(beforeReveal && revealing ? { ...session.games, [beforeReveal.date]: beforeReveal } : session.games) });
  const fixed = game ? fixedLetters(game) : [];
  const tiles = Array.from({ length: 6 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
    const guess = game?.guesses[row];
    const activeDraft = !!game && !revealing && !terminal && row === game.guesses.length;
    const letter = guess?.word[col] ?? (activeDraft ? game?.draft[col]?.trim() : '') ?? '';
    const isFixed = activeDraft && !!fixed[col];
    const isRevealing = revealing && row === revealRow;
    const elapsed = isRevealing ? performance.now() - revealStarted : 0;
    const feedback = isRevealing && elapsed < 500 + col * 300 ? undefined : guess?.feedback[col];
    const description = isFixed ? `${letter}: posizione ${col + 1}, corretta e fissa` : feedback ? `${letter}: ${feedback === 'green' ? 'posizione corretta' : feedback === 'yellow' ? 'presente, posizione diversa' : 'assente'}` : letter || 'vuota';
    const animation = isRevealing ? `style="animation-delay: ${col * 300 - elapsed}ms"` : '';
    return `<div class="tile ${isFixed ? 'green' : feedback ?? ''} ${isRevealing ? 'revealing' : ''}" ${animation} aria-label="${description}" role="img">${letter}</div>`;
  }).join('')).join('');
  const keyboard = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, index) => `<div class="keyboard-row">${index === 2 ? `<button type="button" data-action="submit" ${finished ? 'disabled' : ''}>Invio</button>` : ''}${row.split('').map(letter => `<button type="button" data-letter="${letter}" class="${keys[letter] ?? ''}" ${finished || keys[letter] === 'gray' ? 'disabled' : ''}>${letter}</button>`).join('')}${index === 2 ? `<button type="button" data-action="delete" ${finished ? 'disabled' : ''}>Cancella</button>` : ''}</div>`).join('');
  const resultVisible = !!game && !revealing && game.date === romeDate() && (game.status === 'won' || game.status === 'lost');
  app.innerHTML = `<main ${panel ? 'inert' : ''}><header><h1>ParoleCompetitive</h1><nav aria-label="Finestre"><button type="button" data-action="settings" aria-label="Impostazioni">⚙</button><button type="button" data-action="guide" aria-label="Come si gioca">?</button><button type="button" data-action="statistics" aria-label="Statistiche">▥</button></nav><span>${game?.date ?? romeDate()}</span></header>
    <p>Indovina la parola italiana di cinque lettere in sei tentativi.</p>
    <div class="board" role="group" aria-label="Griglia dei tentativi">${tiles}</div>
    <p class="notice" role="status" aria-live="polite">${game ? message : selectionState === 'loading' ? 'Caricamento della sfida di oggi…' : selectionState === 'incompatible' ? 'Il gioco deve essere aggiornato per questa sfida.' : 'La sfida di oggi non è ancora disponibile. Riprova più tardi.'}</p>
    ${!game && selectionState !== 'available' ? `<button type="button" data-action="retry" ${selectionState === 'loading' ? 'disabled' : ''}>Riprova</button>${selectionState === 'incompatible' ? '<button type="button" data-action="reload">Ricarica pagina</button>' : ''}` : ''}
    ${!game && message ? `<p role="status">${message}</p>` : ''}
    ${!storageAvailable ? '<p role="alert">Salvataggio non disponibile: i progressi potrebbero andare persi e la partita giornaliera non è garantita.</p>' : !navigator.locks ? '<p role="alert">Questo browser non può coordinare schede simultanee: usa una sola scheda per evitare conflitti.</p>' : ''}
    <div class="keyboard" aria-label="Tastiera">${keyboard}</div>
    <p>I dati restano su questo dispositivo. Cancellare i dati del sito può eliminare i progressi.</p></main>
    ${panel ? `<div class="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">${panel === 'settings' ? 'Impostazioni' : panel === 'guide' ? 'Come si gioca' : 'Statistiche'}</h2><button type="button" data-action="close">Chiudi</button></header><div class="modal-content">
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
    ${panel === 'statistics' ? `<div id="statistics">${resultVisible && game ? `<p>${outcomeMessage(game)}</p><p>Durata: ${formatDuration(game)}</p>` : ''}<p>Vittorie: ${stats.wins} · Sconfitte: ${stats.losses} · Ultimo punteggio: ${stats.latestScore ?? '—'}</p><p>Vittorie per tentativi: ${stats.distribution.map((n, i) => `${i + 1}: ${n}`).join(' · ')}</p><p>I dati restano su questo dispositivo. Cancellare i dati del sito può eliminare i progressi.</p>${resultVisible && !prepared && !prepareFailed ? '<p role="status">Preparazione della condivisione in corso.</p>' : shareMessage ? `<p role="status">${shareMessage}</p>` : ''}${manualText ? '<label>Testo da copiare<textarea id="share-text" readonly></textarea></label>' : ''}</div>` : ''}
    </div>${panel === 'statistics' && resultVisible ? `<footer><button type="button" data-action="share" ${prepared || prepareFailed ? '' : 'disabled'}>Condividi risultato</button></footer>` : ''}</section></div>` : ''}`;
  const textarea = app.querySelector<HTMLTextAreaElement>('textarea');
  if (textarea) textarea.value = manualText;
  document.body.classList.toggle('modal-open', !!panel);
  const content = app.querySelector<HTMLElement>('.modal-content');
  if (content) content.scrollTop = scrollTop;
  const restored = focusSelector ? app.querySelector<HTMLElement>(focusSelector) : null;
  if (panel) {
    if (hadPanelFocus && restored && !restored.hasAttribute('disabled')) restored.focus({ preventScroll: true });
    else app.querySelector<HTMLElement>('[data-action="close"]')?.focus({ preventScroll: true });
  } else if (restored) restored.focus({ preventScroll: true });
}

function refreshShare(): void {
  const version = ++prepareVersion;
  prepared = null;
  prepareFailed = false;
  const snapshot = game ? snapshotResult(game, romeDate(), !revealing) : null;
  if (snapshot) void prepareResult(snapshot, session.preferences.spoilerFree).then(result => {
    if (version === prepareVersion) { prepared = result; render(); }
  }).catch(() => { if (version === prepareVersion) { prepareFailed = true; shareMessage = 'Impossibile preparare la condivisione. Riprova.'; render(); } });
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
        shareEpoch++;
        clearReveal();
        message = !previous && game?.date === ACTIVATION_DATE && message.startsWith(replacementMessage) ? replacementMessage : game ? `Nuova sfida disponibile per il ${game.date}.` : '';
        manualText = ''; shareMessage = '';
      }
      if (replaced) {
        clearReveal();
        shareEpoch++;
        manualText = ''; shareMessage = '';
        message = replacementMessage + (!game && romeDate(now) === ACTIVATION_DATE ? ' La nuova partita attende la selezione pubblicata.' : '');
      } else if (withdrawn) {
        message = replacementMessage + (!game && romeDate(now) === ACTIVATION_DATE ? ' La nuova partita attende la selezione pubblicata.' : '');
      }
      if (game && current && game.guesses.length > previousCount) {
        revealing = true;
        beforeReveal = current;
        revealRow = game.guesses.length - 1;
        revealStarted = performance.now();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          clearReveal();
          message = outcomeMessage(game) || 'Tentativo accettato. Feedback disponibile nella griglia.';
          if (game.status === 'won' || game.status === 'lost') panel = 'statistics';
        } else {
          for (let col = 0; col < 5; col++) {
            revealTimers.push(window.setTimeout(() => revealTile(col), 500 + col * 300));
          }
          revealTimers.push(window.setTimeout(finishReveal, 2200));
        }
      }
    } catch {
      storageAvailable = false;
      message = 'Salvataggio non disponibile: i progressi potrebbero andare persi e la partita giornaliera non è garantita.';
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
  if (!game || revealing) return;
  const identity = { date: game.date, scheduleId: game.scheduleId };
  queue = queue.then(() => {
    const observed = game;
    if (!observed || observed.date !== identity.date || observed.scheduleId !== identity.scheduleId) return;
    return perform((next, current) => {
      if (revealing || !current || current.date !== observed.date || current.scheduleId !== observed.scheduleId) return;
      if (key === 'Enter' && (current.date !== observed.date || current.guesses.length !== observed.guesses.length || current.status !== observed.status || current.draft !== observed.draft)) {
        message = 'La partita è stata aggiornata in un’altra scheda. Controlla la situazione prima di inviare.';
        return;
      }
      message = '';
      if (key === 'Enter') message = playGuess(next, current, Date.now()) ?? '';
      else if (key === 'Backspace') next.games[current.date] = editDraft(current, key);
      else if (/^[a-z]$/i.test(key)) {
        if (keyboardKnowledge(current.guesses)[key.toUpperCase()] === 'gray') message = 'La lettera è già stata esclusa.';
        else next.games[current.date] = editDraft(current, key.toUpperCase());
      }
    });
  });
}
app.addEventListener('click', event => {
  if (panel && event.target instanceof HTMLElement && event.target.classList.contains('backdrop')) {
    const opener = panel;
    panel = null;
    render();
    app.querySelector<HTMLButtonElement>(`[data-action="${opener}"]`)?.focus();
    return;
  }
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || button.disabled) return;
  if (button.dataset.action === 'settings' || button.dataset.action === 'guide' || button.dataset.action === 'statistics') {
    panel = button.dataset.action;
    render();
    return;
  }
  if (button.dataset.action === 'close' && panel) {
    const opener = panel;
    panel = null;
    render();
    app.querySelector<HTMLButtonElement>(`[data-action="${opener}"]`)?.focus();
    return;
  }
  if (button.dataset.action === 'retry') { acquireToday(); return; }
  if (button.dataset.action === 'reload') { location.reload(); return; }
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
      shareMessage = result.message; manualText = result.kind === 'manual' ? result.text : ''; render();
    });
  } else if (button.dataset.action === 'share' && prepareFailed) { shareMessage = ''; refreshShare(); render(); }
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
  if (panel) {
    if (event.key === 'Escape') {
      event.preventDefault();
      const opener = panel;
      panel = null;
      render();
      app.querySelector<HTMLButtonElement>(`[data-action="${opener}"]`)?.focus();
    } else if (event.key === 'Tab') {
      const focusable = Array.from(app.querySelectorAll<HTMLElement>('[role="dialog"] button:not(:disabled), [role="dialog"] input:not(:disabled), [role="dialog"] textarea:not(:disabled), [role="dialog"] a[href]'));
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (focusable.length && (index < 0 || (event.shiftKey && index === 0) || (!event.shiftKey && index === focusable.length - 1))) {
        event.preventDefault();
        focusable[event.shiftKey ? focusable.length - 1 : 0].focus();
      }
    }
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof HTMLElement) {
    const keyboardButton = event.target.closest('.keyboard button');
    if (keyboardButton && event.key === 'Enter') return;
    if (!keyboardButton && (event.target.isContentEditable || event.target.closest('input, textarea, select, button, summary, a, [contenteditable="true"]'))) return;
  }
  if (/^[a-z]$/i.test(event.key) || event.key === 'Enter' || event.key === 'Backspace') { event.preventDefault(); input(event.key); }
});
void initialize();
