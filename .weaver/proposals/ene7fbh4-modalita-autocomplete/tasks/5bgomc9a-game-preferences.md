---
technical: false
refs:
  - game-preferences
  - requirements/data#game-preferences
  - requirements/rules#game-preferences
  - requirements/quality#game-preferences
---
# Preferenze autocomplete

L'autocomplete è disattivato per impostazione predefinita e la preferenza resta salvata tra giorni. La scelta futura dell'autocomplete è indipendente dalla difficoltà e dai risultati già conclusi.

Prima del primo tentativo accettato, cambiare autocomplete aggiorna insieme la scelta della partita corrente e quella per le partite future, senza modificare le lettere digitate nella bozza. I tentativi rifiutati non avviano la partita e non bloccano il cambiamento. Dopo il primo tentativo accettato, finché la partita è in corso, un cambiamento è rifiutato e lascia invariate sia la scelta corrente sia quella futura. Dopo la conclusione, un cambiamento modifica soltanto la preferenza futura; non altera la partita conclusa, il suo punteggio o le statistiche.

Ogni nuova partita adotta la preferenza futura corrente, inclusa una sfida sostitutiva nello stesso giorno. Riaprire una partita esistente conserva la sua scelta, distinta da quella futura. La sostituzione non trasferisce la scelta bloccata della sfida ritirata né azzera la preferenza conservata. Le preferenze sono conservate insieme alla sessione di gioco e riconciliate mediante lo stesso percorso serializzato tra schede, non tramite un archivio separato. La qualità è verificata per cambiamenti prima del gioco, dopo invii rifiutati, durante una partita iniziata ma non conclusa e dopo la conclusione; si verifica inoltre che rifiuti, riapertura, giorno successivo, sostituzione e riconciliazione tra schede mantengano le scelte rispettive.

## Code notes
Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/preferences.ts`: `Preferences` e valori predefiniti/validazione; estendere il contratto delle preferenze.
- `src/session.ts`: sessione che include preferenze e partite datate; mantenere i risultati conclusi immutabili.
- `src/main.ts`: impostazioni instradate tramite enqueue/perform/writeSession serializzati; riutilizzare questo percorso, senza API di salvataggio separata. `selectDifficulty` è il modello per le transizioni di preferenza.
- Test esistenti in `test/preferences.test.ts`, `test/session.test.ts` e `e2e/interface.spec.ts` coprono transizioni, ricaricamento e impostazioni.
