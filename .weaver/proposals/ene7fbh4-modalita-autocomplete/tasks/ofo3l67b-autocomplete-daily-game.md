---
technical: false
refs:
  - daily-game
  - requirements/data#daily-game
  - requirements/rules#daily-game
  - requirements/ui#daily-game
  - requirements/quality#daily-game
---
# Bozze con lettere fisse

Ogni nuova sfida acquisisce la preferenza Autocomplete corrente, inizialmente spenta in assenza di una scelta conservata. Prima del primo tentativo accettato la modalità della partita può cambiare senza modificare la bozza manuale; il primo tentativo accettato la blocca. Invii rifiutati non la bloccano. Durante una partita iniziata e incompleta la scelta non cambia; dopo la conclusione una modifica alla preferenza futura non cambia modalità o punteggio della partita conclusa.

Con Autocomplete attivo la prima bozza non contiene lettere automatiche. Dopo un tentativo accettato errato con possibilità residue, soltanto alla fine dell'intera rivelazione la nuova bozza contiene tutte le lettere verdi già scoperte in qualunque tentativo accettato, nelle rispettive posizioni. Le occorrenze duplicate sono distinte per posizione. Nessuna lettera gialla, occorrenza non dimostrata o informazione della soluzione nascosta viene precompilata. Le verdi sono fisse: non si cancellano e non si sovrascrivono.

Digitazione e cancellazione da tastiera fisica e sullo schermo saltano le fisse. Le lettere manuali occupano i vuoti da sinistra; cancella elimina la lettera manuale più a destra e riporta il cursore a quella casella. Senza lettere manuali cancella non cambia nulla; una bozza completa non accetta altre lettere. Non introdurre selezione manuale delle caselle. Un vuoto rende incompleto l'invio; la parola completa è composta dalle cinque posizioni in ordine, comprese le fisse. Il rifiuto conserva bozza e posizioni fisse senza consumare tentativi o avviare il tempo. Restano applicabili dizionario, lettere assenti, duplicati, regole hard, sei tentativi e vittoria al sesto. Con Autocomplete spento resta invariato il comportamento precedente.

La modalità attiva al primo tentativo accettato applica ×0,98 anche a una vittoria al primo tentativo o senza precedenti verdi utilizzabili. Toggle e rifiuti precedenti non fanno maturare il fattore. Moltiplicare il punteggio grezzo esistente per l'eventuale bonus hard ×1,10 e per il fattore Autocomplete prima di un unico arrotondamento finale: hard idoneo con Autocomplete vale ×1,078; dopo un declassamento hard resta solo ×0,98. Sconfitte e scadenze valgono zero. Risultati conclusi, statistiche e condivisione usano il punteggio già fissato, senza nuovi ricalcoli dovuti alle preferenze.

Conservare la registrazione coerente di tentativo ed eventuale risultato prima dell'animazione, i tempi fissati all'invio e il blocco dell'input per tutta la rivelazione. Non esporre nuove fisse nella riga successiva prima del termine completo; la riga diventa modificabile insieme agli aggiornamenti già previsti di tastiera, statistiche, risultato e condivisione. Nella bozza le fisse appaiono verdi e la descrizione accessibile ne indica lettera, posizione, correttezza e stato fisso; le altre caselle restano neutre. La riga inviata mantiene la rivelazione esistente, anche per lettere prima fisse. Movimento ridotto mantiene l'ordine senza attese. Nessuna nuova bozza giocabile dopo vittoria, sconfitta o scadenza; nessuna compilazione automatica invia tentativi o modifica i tempi.

Conservare localmente la scelta della singola partita separata dalla preferenza futura e una bozza di cinque posizioni che mantenga esattamente vuoti, fisse e lettere manuali. Ricavare le fisse dai feedback accettati. Il ripristino ricostruisce la prossima posizione modificabile e la bozza già iniziata senza ripetere rivelazioni, aggiungere tentativi o cambiare tempi e punteggi; se la chiusura avviene durante la rivelazione, ripristina il tentativo registrato e la successiva bozza quando ancora giocabile. Mantenere serializzazione, riconciliazione fra schede ed esiti conteggiati una volta sola.

I salvataggi validi precedenti senza informazioni Autocomplete restano leggibili come modalità spenta: conservare progressi, bozze manuali, tempi, risultati, punteggi e statistiche; non applicare loro una nuova preferenza futura. Resta obbligatorio il ritiro della sola sfida superata nel giorno di attivazione del nuovo vocabolario: la compatibilità con i vecchi salvataggi non la preserva. Mantenere gli avvisi e la sessione in memoria previsti quando la persistenza non è utilizzabile, senza cancellare dati estranei o dichiarare salvataggi riusciti.

Conservare il vocabolario canonico e il calendario congelato correnti, inclusa l'ammissione ordinaria di AUDIO e OZONO e i controlli sulle lettere note. Al ritiro di una sfida eliminare anche le sue verdi fisse e le lettere manuali; nessuna rivelazione tardiva deve compilare la bozza della sostitutiva. La nuova sfida nello stesso giorno acquisisce la preferenza futura conservata, con sei tentativi e nessuna conoscenza ereditata. Riaperture e riconciliazioni ripetute non azzerano la scelta o la bozza della sostitutiva. Verificare sostituzione durante una rivelazione Autocomplete e con bozza parzialmente compilata, preservando le altre date e i risultati sopravvissuti.

Conservare il riepilogo automatico soltanto dopo la rivelazione finale locale della sfida corrente, mai per un risultato ripristinato, osservato da un'altra scheda, scaduto o ritirato. Nessuna nuova bozza dopo il ritiro; la sostitutiva ha una bozza propria. Non inviare input di gioco con una finestra modale aperta. Le fisse restano leggibili e accessibili in entrambe le apparenze. Documentare la modalità Autocomplete, il blocco della scelta e il fattore di punteggio nel README e nel changelog in inglese.

Verificare verdi non contigue, duplicate e accumulate; impossibilità di modificarle o cancellarle; completezza con vuoti; rifiuti senza alterazioni; input fisico e sullo schermo; modalità spenta e compatibilità hard. Coprire ×0,98 al primo tentativo e senza aiuto effettivo, ×1,078 con hard idoneo, declassamento e zeri terminali, con casi che distinguano arrotondamento unico da intermedi. Sulla superficie reale verificare comparsa e accessibilità delle fisse soltanto al termine della rivelazione, salto delle posizioni, movimento ridotto, blocco terminale e ricarica della bozza parziale; verificare inoltre ripristino dei vecchi salvataggi, cambio del giorno e riconciliazione fra schede senza esiti duplicati. Conservare la verifica delle regole preesistenti senza introdurre telemetria o meccanismi anti-manomissione.

## Code notes
Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/game.ts`: `Game`, `setDraft`, `submitGuess`, `scoreGame`; pure rules, current append/delete-last draft string, reset on acceptance, hard multiplier before one rounding. Positional gaps must not change submitted word order.
- `src/session.ts`: `changeDraft`, `playGuess`, `reconcile`; `src/main.ts`: `input`, `perform`, `render`, serialized reconciliation/write before reveal. Reuse this commit path; do not derive durable state from animation. Rendering masks feedback until midpoint and locks input/outcomes until completion.
- `src/persisted-game.ts`: `validatePersistedGame` recalculates won scores with `scoreGame`; absent old mode must mean disabled. Keep session validators backward-compatible.
- Existing coverage: `test/game.test.ts`, `test/persisted-game.test.ts`, `test/session.test.ts`, `e2e/interface.spec.ts`, `e2e/statistics.spec.ts`. `src/share.ts` and `src/statistics.ts` already consume committed scores; no extra share format or statistics fields.
