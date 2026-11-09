---
technical: false
refs:
  - result-share
  - requirements/ui#result-share
---
# Condivisione nella finestra

L’unica azione «Condividi risultato» è nel footer della finestra statistiche/risultato ed è disponibile soltanto per la partita odierna vinta o persa dopo la rivelazione finale. Non compare durante una partita incompleta né dopo la scadenza o il cambio di giornata. Rimuovere l’azione duplicata dalla pagina di gioco.

Il footer resta visibile fuori dall’area informativa scorrevole e dispone di spazio riservato pari alla propria altezza: anche l’ultimo elemento e il testo copiabile manualmente possono scorrere completamente sopra il footer, senza essere coperti. Preparazione, esito e feedback di copia manuale restano nella finestra; il testo manuale è selezionabile e raggiungibile da tastiera e touch. Il controllo offre feedback accessibile in italiano per successo, errore e copia manuale; l’annullamento della condivisione nativa è silenzioso.

La condivisione usa uno snapshot privato del risultato rivelato: titolo, data della sfida, esito, tentativi accettati su sei, punteggio e griglia di sei righe per cinque celle; celle inutilizzate neutre. Non include lettere, soluzione, tastiera, contenuto DOM nascosto, testo alternativo con tentativi o metadati della soluzione. Con la modalità spoiler-free disattivata resta la prima riga a colori ma senza lettere; con la modalità spoiler-free attivata l’intera prima riga è neutra. La stessa privacy vale per il testo alternativo, che usa segnaposto neutri nella prima riga quando la modalità spoiler-free è attiva. Le modifiche di aspetto dell’applicazione cambiano solo il controllo visibile, mai immagine o testo esportati.

Mantenere disponibilità e ripristino del risultato odierno, rilevamento delle capacità, preparazione, attivazione nativa tramite gesto dell’utente, tentativi ripetibili e alternative di testo esistenti. L’annullamento non copia né scarica; un errore consente un nuovo tentativo; se la copia automatica non è disponibile, esporre il medesimo testo privato per la copia manuale. Non scaricare automaticamente PNG e non modificare partita, tempi, punteggio o totali.

Conservare le verifiche di qualità: coprire immagine nativa, fallback testuale, diniego degli appunti/copia manuale, annullamento ed errore generico; ispezionare contenuto o pixel effettivamente esportati per escludere lettere e verificare la prima riga neutra con modalità spoiler-free attiva. Non considerare sufficiente la sola chiamata a un’API. Verificare il gesto utente nativo e, dove disponibile, il comportamento reale su browser/dispositivo; dichiarare i limiti specifici senza affermare consegne. Descrivere accuratamente i test automatici disponibili, senza attribuire loro copertura pixel o retry della preparazione se assente.

Conservare il ritiro dei risultati sostituiti anche nella nuova finestra: disponibilità, immagine preparata, testo manuale e messaggi appartengono alla sfida corrente, non soltanto alla sua data. Una sostituzione disabilita e rimuove la presentazione della vecchia sfida; preparazioni o completamenti tardivi non la riattivano e non avviano fallback. La nuova sfida rende disponibile la condivisione solo dopo la propria vittoria o sconfitta rivelata. La finestra resta aperta e utilizzabile durante l'aggiornamento; gli esiti degli altri giorni e la preferenza spoiler-free restano validi. Non dichiarare revocabili copie o condivisioni già consegnate all'esterno.

## Code notes

Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

`src/main.ts`: `refreshShare()` prepara lo snapshot dopo la rivelazione con guardia di versione; il rendering colloca attualmente azione e textarea nella pagina di gioco, e la delega ai clic avvia la condivisione o riprova la preparazione aggiornando messaggio/testo. Il rerender ricostruisce `app.innerHTML`; preservare apertura e focus della finestra e l’attivazione nativa richiede attenzione. Le statistiche durante la rivelazione derivano da `beforeReveal`. `src/style.css` contiene gli stili dei dettagli attuali. `e2e/statistics.spec.ts` usa helper di apertura basati sui dettagli; `e2e/interface.spec.ts` copre layout a 320/1280 px e tastiera basata sul riepilogo. README e `package.json` descrivono comandi e script esistenti.
