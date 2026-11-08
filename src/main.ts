import './style.css';
import { observeDailyWord } from './daily-word';
import { keyboardKnowledge, type Game } from './game';
import { canSelectDifficulty, type Difficulty } from './preferences';
import { changeDifficulty, changeDraft, changeSpoilerFree, playGuess, readSession, reconcile, SESSION_KEY, writeSession, type Session } from './session';
import { deriveStatistics } from './statistics';
import { prepareResult, sharePrepared, snapshotResult, type PreparedResult } from './share';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application root');
const app: HTMLElement = root;
let session: Session;
let game: Game;
let message = '';
let storageAvailable = true;
let settingsOpen = false;
let statsOpen = false;
let prepared: PreparedResult | null = null;
let prepareFailed = false;
let prepareVersion = 0;
let manualText = '';
let queue = Promise.resolve();
let revealing = false;
let revealRow = -1;
let beforeReveal: Game | null = null;
let guideOpen = false;

function outcomeMessage(current: Game): string {
  return current.status === 'won' ? `Vittoria! Punteggio: ${current.score}.` : current.status === 'lost' ? `Partita terminata. La parola era ${current.solution}. Punteggio: 0.` : '';
}

function render(): void {
  const active = document.activeElement as HTMLElement | null;
  const focusSelector = active?.id ? `#${active.id}` : active?.matches('input[name="difficulty"]') ? `input[name="difficulty"][value="${(active as HTMLInputElement).value}"]` : active?.matches('button[data-letter]') ? `button[data-letter="${active.dataset.letter}"]` : active?.matches('button[data-action]') ? `button[data-action="${active.dataset.action}"]` : '';
  const keys = keyboardKnowledge(revealing ? game.guesses.slice(0, -1) : game.guesses);
  const terminal = game.status === 'won' || game.status === 'lost' || game.status === 'expired';
  const finished = revealing || terminal;
  const blocked = !canSelectDifficulty(game, 'hard');
  const stats = deriveStatistics(beforeReveal && revealing ? { ...session.games, [beforeReveal.date]: beforeReveal } : session.games);
  const tiles = Array.from({ length: 6 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
    const guess = game.guesses[row];
    const letter = guess?.word[col] ?? (row === game.guesses.length ? game.draft[col] : '') ?? '';
    const feedback = revealing && row === revealRow ? undefined : guess?.feedback[col];
    const description = feedback ? `${letter}: ${feedback === 'green' ? 'posizione corretta' : feedback === 'yellow' ? 'presente, posizione diversa' : 'assente'}` : letter || 'vuota';
    return `<div class="tile ${feedback ?? ''} ${revealing && row === revealRow ? 'revealing' : ''}" aria-label="${description}" role="img">${letter}</div>`;
  }).join('')).join('');
  const keyboard = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(letter => `<button type="button" data-letter="${letter}" class="${keys[letter] ?? ''}" ${finished || keys[letter] === 'gray' ? 'disabled' : ''}>${letter}</button>`).join('');
  app.innerHTML = `<main><header><h1>ParoleCompetitive</h1><span>${game.date}</span></header>
    <p>Indovina la parola italiana di cinque lettere in sei tentativi.</p>
    <div class="board" role="group" aria-label="Griglia dei tentativi">${tiles}</div>
    <p class="notice" role="status" aria-live="polite">${message}</p>
    ${!storageAvailable ? '<p role="alert">Salvataggio non disponibile: i progressi potrebbero andare persi e la partita giornaliera non è garantita.</p>' : !navigator.locks ? '<p role="alert">Questo browser non può coordinare schede simultanee: usa una sola scheda per evitare conflitti.</p>' : ''}
    <div class="keyboard" aria-label="Tastiera">${keyboard}<button type="button" data-action="delete" ${finished ? 'disabled' : ''}>Cancella</button><button type="button" data-action="submit" ${finished ? 'disabled' : ''}>Invio</button></div>
    ${!revealing && (game.status === 'won' || game.status === 'lost') ? `<p>${outcomeMessage(game)}</p>` : ''}
    ${!revealing && (game.status === 'won' || game.status === 'lost') ? `<button type="button" data-action="share" ${prepared || prepareFailed ? '' : 'disabled'}>Condividi risultato</button>${manualText ? '<label>Testo da copiare<textarea readonly></textarea></label>' : ''}` : ''}
    <details id="settings" ${settingsOpen ? 'open' : ''}><summary>Impostazioni</summary>
      <fieldset ${revealing ? 'disabled' : ''}><legend>Difficoltà ${terminal ? 'della prossima partita' : ''}</legend>
        <label><input type="radio" name="difficulty" value="standard" ${session.preferences.difficulty === 'standard' ? 'checked' : ''}> Standard</label>
        <label><input type="radio" name="difficulty" value="hard" ${session.preferences.difficulty === 'hard' ? 'checked' : ''} ${blocked ? 'disabled aria-describedby="hard-explanation"' : ''}> Difficile</label>
        <p id="hard-explanation">In modalità difficile le lettere verdi restano fisse, le gialle cambiano posizione e ogni lettera rivelata deve comparire almeno tante volte quante osservate in un singolo tentativo. Una partita iniziata difficile e mai declassata riceve un bonus del 10%. Passare a standard dopo il primo tentativo revoca definitivamente il bonus. ${blocked ? 'Non puoi attivare la modalità difficile dopo il primo tentativo accettato; potrai sceglierla per la prossima partita.' : ''}</p>
      </fieldset><label><input type="checkbox" id="spoiler" ${session.preferences.spoilerFree ? 'checked' : ''}> Condivisione spoiler-free</label><p>Nasconde il feedback del primo tentativo nelle condivisioni successive; non modifica punteggi o risultati.</p></details>
    <details id="guide" ${guideOpen ? 'open' : ''}><summary>Come si gioca</summary><p>Hai sei tentativi di cinque lettere. Il verde indica la posizione corretta, il giallo una lettera presente in un'altra posizione e il grigio una lettera assente. Con lettere doppie le posizioni corrette sono valutate prima, poi le occorrenze rimanenti da sinistra a destra.</p><p>La parola cambia a mezzanotte in Italia (Europe/Rome). Il tempo parte dal primo tentativo valido e continua anche a pagina chiusa. Anche in standard le lettere sicuramente assenti sono bloccate; difficile aggiunge vincoli di posizione e quantità e il bonus del 10%, perso con il downgrade. Prima del primo tentativo e dopo la partita puoi scegliere liberamente; durante la partita non puoi passare da standard a difficile.</p></details>
    <details id="statistics" ${statsOpen ? 'open' : ''}><summary>Statistiche locali</summary><p>Vittorie: ${stats.wins} · Sconfitte: ${stats.losses} · Ultimo punteggio: ${stats.latestScore ?? '—'}</p><p>Vittorie per tentativi: ${stats.distribution.map((n, i) => `${i + 1}: ${n}`).join(' · ')}</p></details>
    <p>I dati restano su questo dispositivo. Cancellare i dati del sito può eliminare i progressi.</p></main>`;
  const textarea = app.querySelector<HTMLTextAreaElement>('textarea');
  if (textarea) textarea.value = manualText;
  app.querySelector<HTMLDetailsElement>('#settings')?.addEventListener('toggle', e => { settingsOpen = (e.currentTarget as HTMLDetailsElement).open; });
  app.querySelector<HTMLDetailsElement>('#statistics')?.addEventListener('toggle', e => { statsOpen = (e.currentTarget as HTMLDetailsElement).open; });
  app.querySelector<HTMLDetailsElement>('#guide')?.addEventListener('toggle', e => { guideOpen = (e.currentTarget as HTMLDetailsElement).open; });
  if (focusSelector) app.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true });
}

function refreshShare(): void {
  const version = ++prepareVersion;
  prepared = null;
  prepareFailed = false;
  const snapshot = snapshotResult(game, game.date, !revealing);
  if (snapshot) void prepareResult(snapshot, session.preferences.spoilerFree).then(result => {
    if (version === prepareVersion) { prepared = result; render(); }
  }).catch(() => { if (version === prepareVersion) { prepareFailed = true; message = 'Impossibile preparare la condivisione. Riprova.'; render(); } });
}

async function perform(action: (current: Session, currentGame: Game) => void): Promise<void> {
  const run = () => {
    try {
      const next = storageAvailable ? readSession(localStorage) : session;
      const current = reconcile(next, Date.now());
      const previousCount = current.guesses.length;
      const previousDate = game.date;
      action(next, current);
      session = next;
      game = next.games[current.date];
      if (storageAvailable) {
        try { writeSession(localStorage, next); }
        catch { storageAvailable = false; }
      }
      if (game.date !== previousDate) { message = `Nuova sfida disponibile per il ${game.date}.`; manualText = ''; }
      if (game.guesses.length > previousCount) {
        revealing = true;
        beforeReveal = current;
        revealRow = game.guesses.length - 1;
        const revealedDate = game.date;
        window.setTimeout(() => {
          revealing = false;
          beforeReveal = null;
          revealRow = -1;
          if (game.date === revealedDate) message = outcomeMessage(game) || 'Tentativo accettato. Feedback disponibile nella griglia.';
          render();
          refreshShare();
        }, 1000);
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
function enqueue(action: (current: Session, currentGame: Game) => void): void {
  queue = queue.then(() => perform(action));
}

try { session = readSession(localStorage); game = reconcile(session, Date.now()); }
catch { storageAvailable = false; session = { preferences: { difficulty: 'standard', spoilerFree: true }, games: {} }; game = reconcile(session, Date.now()); message = 'Salvataggio non disponibile: i progressi potrebbero andare persi e la partita giornaliera non è garantita.'; }
if (!message) message = `Sfida disponibile per il ${game.date}.`;
render();
refreshShare();

function input(key: string): void {
  if (revealing) return;
  queue = queue.then(() => {
    const observed = game;
    return perform((next, current) => {
      if (revealing) return;
      if (key === 'Enter' && (current.date !== observed.date || current.guesses.length !== observed.guesses.length || current.status !== observed.status || current.draft !== observed.draft)) {
        message = 'La partita è stata aggiornata in un’altra scheda. Controlla la situazione prima di inviare.';
        return;
      }
      message = '';
      if (key === 'Enter') message = playGuess(next, current, Date.now()) ?? '';
      else if (key === 'Backspace') changeDraft(next, current, current.draft.slice(0, -1));
      else if (/^[a-z]$/i.test(key)) changeDraft(next, current, current.draft + key.toUpperCase());
    });
  });
}
app.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || button.disabled) return;
  if (button.dataset.letter) input(button.dataset.letter);
  else if (button.dataset.action === 'delete') input('Backspace');
  else if (button.dataset.action === 'submit') input('Enter');
  else if (button.dataset.action === 'share' && prepared) {
    void sharePrepared(prepared).then(result => {
      message = result.message; manualText = result.kind === 'manual' ? result.text : ''; render();
    });
  } else if (button.dataset.action === 'share' && prepareFailed) { refreshShare(); render(); }
});
app.addEventListener('change', event => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'difficulty') enqueue((next, current) => { if (!changeDifficulty(next, current, target.value as Difficulty)) message = 'Non puoi attivare la modalità difficile dopo il primo tentativo.'; });
  if (target.id === 'spoiler') {
    const enabled = target.checked;
    prepared = null;
    prepareVersion++;
    manualText = '';
    const shareButton = app.querySelector<HTMLButtonElement>('button[data-action="share"]');
    if (shareButton) shareButton.disabled = true;
    enqueue(next => changeSpoilerFree(next, enabled));
  }
});
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof HTMLElement) {
    const keyboardButton = event.target.closest('.keyboard button');
    if (keyboardButton && event.key === 'Enter') return;
    if (!keyboardButton && (event.target.isContentEditable || event.target.closest('input, textarea, select, button, summary, a, [contenteditable="true"]'))) return;
  }
  if (/^[a-z]$/i.test(event.key) || event.key === 'Enter' || event.key === 'Backspace') { event.preventDefault(); input(event.key); }
});
window.addEventListener('storage', event => { if (event.key === SESSION_KEY) enqueue(() => {}); });
observeDailyWord({ onDay: () => enqueue(() => {}) });
