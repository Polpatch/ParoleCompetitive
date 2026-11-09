---
column: done
technical: false
refs:
- result-share
- requirements/ui#result-share
proposal: l6kqifix
job: m0dojpcg
created: 2026-11-09T12:15:13.103Z
finished: 2026-11-09T12:39:21.225Z
---
# Feedback sulla condivisione

La condivisione è disponibile soltanto per una partita vinta o persa dopo la rivelazione del risultato. L’unica azione «Condividi risultato» compare nel piè di pagina fisso della finestra modale delle statistiche/risultato per il risultato rivelato della giornata corrente; non compare nella pagina di gioco né per partite in corso o scadute. Il piè di pagina resta visibile fuori dall’area informativa scorrevole, che riserva spazio sufficiente perché ogni elemento, incluso l’ultimo, possa scorrere interamente sopra il piè di pagina.

L’esportazione è una scheda pulita, non la pagina di gioco: contiene titolo, data, esito e numero di tentativi, punteggio e griglia di sei righe per cinque celle; le celle inutilizzate sono neutre. Non contiene lettere, soluzione o tastiera. Con la modalità senza spoiler attiva, la prima riga è interamente neutra, comprese le indicazioni verde, gialla e grigia; altrimenti conserva i colori del feedback della prima riga senza lettere. La stessa regola di occultamento vale per il testo alternativo: nella prima riga usa segnaposto neutri. Le preferenze di aspetto dell’applicazione non modificano l’immagine o il testo esportati.

La preparazione, l’esito e le istruzioni di copia manuale restano nella finestra modale. La preparazione mostra «Preparo il risultato…» e rimane persistente; se fallisce mostra «Preparazione non riuscita. Riprova» e consente di riprovare. Un controllo di funzionalità non riuscito mostra «Condivisione non disponibile. Riprova»; un errore di condivisione mostra «Condivisione non riuscita. Riprova». Completamento ed errore sono feedback brevi presentati come unico toast corrente nella finestra modale, secondo il comportamento toast dell’interfaccia di gioco; preparazione e istruzioni di copia restano persistenti e applicabili indipendentemente dalla scadenza del toast. Il completamento nativo mostra «Condivisione completata» senza promettere la consegna. Il successo degli appunti mostra «Risultato copiato»; la copia manuale mostra «Copia il testo qui sotto» e lascia il testo selezionabile visibile finché è applicabile. Il testo selezionabile è raggiungibile da tastiera e tocco nell’area scorrevole, senza essere coperto dal piè di pagina.

La cancellazione nativa non produce messaggi e non avvia né la copia negli appunti né il download PNG. Non si usa il download PNG automatico come ripiego. Restano invariate la rilevazione delle capacità, la preparazione e i tentativi, nonché l’attivazione utente nativa. Se viene ritirata la sfida cui appartiene il risultato mostrato, la condivisione è disabilitata e vengono rimossi il testo manuale obsoleto e il relativo feedback; resta disabilitata finché la partita sostitutiva non raggiunge un risultato rivelato vinto o perso.

## Code notes

Commit: 991659b661a43604f410e309f4d098dd260c44c1

- `src/share.ts`: `shareResult()` produces the outcome/text for native sharing, clipboard and manual-copy fallback.
- `src/main.ts`: `refreshShare()`, share action handling and statistics rendering retain the prepared artifact and share feedback. `prepareVersion`/`shareEpoch` and challenge checks invalidate stale asynchronous work. `render()` rebuilds the app and restores modal focus/scroll; the manual textarea value is assigned after rendering.
- Preserve native activation, preparation/retry and silent cancellation. Reuse modal footer, selectable textarea and challenge guards; exported artifacts are outside this change. Integrate with the agreed in-modal single-toast behavior rather than adding a separate notification path.
