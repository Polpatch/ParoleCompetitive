---
technical: false
refs:
  - player.AUTOCOMPLETE_SELECTED
  - requirements/ui#game-preferences
---
# Controllo autocomplete

Nella finestra modale delle impostazioni deve comparire un controllo accessibile denominato Autocomplete, inizialmente spento, che consente al giocatore di scegliere l'inserimento automatico delle lettere già trovate nella posizione corretta. Mostrare la preferenza conservata sul dispositivo, indipendentemente dalla difficoltà e dalla privacy di condivisione.

Prima del primo tentativo accettato, il controllo permette di accendere o spegnere la modalità per la partita corrente e per quelle future, senza cancellare lettere manuali già digitate. Un invio rifiutato non blocca questa scelta. Dopo il primo tentativo accettato e fino alla conclusione, disabilitare il controllo con una spiegazione accessibile: non è consentito cambiare né la modalità corrente né la preferenza futura. A partita conclusa riabilitarlo, spiegando che modifica soltanto la preferenza delle partite future, mai il risultato, il punteggio o la modalità della partita appena conclusa.

La spiegazione in italiano deve indicare che tutte le verdi già scoperte vengono riprese nel tentativo successivo dopo la rivelazione completa; sono fisse, non cancellabili né sovrascrivibili, e digitazione e cancella le saltano compilando soltanto i vuoti in ordine. Deve indicare il fattore ×0,98, applicabile già dal primo tentativo accettato con la modalità attiva anche senza lettere precompilate, e il cumulo con l'eventuale bonus hard ×1,10 prima di un unico arrotondamento finale.

Conservare gli altri controlli e le loro spiegazioni: hard con minimo delle ripetizioni osservate, bonus del 10% e sua perdita al declassamento; passaggio standard→hard bloccato soltanto durante una partita iniziata e incompleta; privacy di condivisione sempre modificabile. Verificare il controllo Autocomplete sulla superficie reale con tastiera e descrizione del blocco, prima dell'inizio, dopo un rifiuto e dopo la conclusione.

Conservare il controllo Aspetto con Sistema, Chiaro e Scuro e i tre pulsanti di apertura delle finestre modali. Cambiare Autocomplete mantiene aperte le impostazioni e conserva focus e scorrimento utilizzabili; gli eventi della finestra non devono compilare la bozza dietro di essa. Verificare il controllo e la spiegazione in entrambe le apparenze e a 320 px senza alterare le tre righe della tastiera, il riepilogo finale o la condivisione esclusivamente nella finestra delle statistiche.

## Code notes
Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/main.ts`: settings in `render()`; settings `change` handler; `enqueue`/`perform` serialize actions, reconcile sessions and persist through `writeSession`. Reuse this path for the new player choice rather than a parallel settings store.
- `src/preferences.ts`: `Preferences`, defaults and validation; `src/session.ts`: embedded session preferences and difficulty-selection pattern. Coordinate the control with the preference lifecycle Task.
- `test/preferences.test.ts`, `test/session.test.ts` and `e2e/interface.spec.ts` already exercise preference transitions and real settings restoration. The standalone `savePreferences`/`loadPreferences` API is not the UI's persistence path.
