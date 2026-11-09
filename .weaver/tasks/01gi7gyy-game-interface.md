---
column: done
technical: false
refs:
- game-interface
- player.STATISTICS_SUMMARY_SELECTED
- player.HISTORY_SELECTED
- player.HISTORY_MATCH_TOGGLED
- requirements/ui#game-interface/Statistics open
proposal: 0ym0zxm1
job: 2g6ov7r4
created: 2026-11-09T12:21:19.499Z
finished: 2026-11-09T12:29:58.531Z
---
# Statistiche e storico

La vista di gioco resta quella iniziale e non ripristina pannelli aperti. Le impostazioni, la guida e il pannello delle statistiche sono mutuamente esclusivi; aprire o chiudere un pannello non altera bozza, tentativi accettati, punteggio, esiti o tempo di gioco. Nessun pannello permette input alla partita sottostante. I feedback brevi non cambiano pannello né interrompono la modifica e non possono riapparire dopo il ritiro della sfida.

La richiesta di statistiche apre il pannello sulla scheda Statistiche. Ogni nuova apertura manuale o automatica seleziona questa scheda e inizia con tutte le partite dello storico chiuse. Una nuova vittoria o sconfitta locale apre il riepilogo una sola volta dopo il feedback finale, sostituendo un altro pannello aperto; una partita ripristinata, un risultato di un'altra scheda, un riepilogo già chiuso, la scadenza o il ritiro della sfida non provocano un'apertura automatica. Un'apertura manuale di una partita conclusa ripristinata mostra il risultato corrente e i relativi dati fissi. La chiusura restituisce il focus all'azione che ha aperto il pannello e lo stesso risultato non lo riapre automaticamente.

Il pannello offre le schede accessibili Statistiche e Storico, con selezione esposta, navigazione da tastiera, nomi per lettori di schermo e focus visibile. Le schede non inviano input al gioco. In Statistiche compaiono prima due riquadri affiancati per vittorie e sconfitte, con icona pertinente sopra il bordo e conteggio al centro, poi il punteggio totale come somma di tutti i punteggi e un istogramma di sei barre verticali. Seguono il risultato odierno, il punteggio e la durata fissa quando la vittoria o sconfitta è stata rivelata. Prima della rivelazione non compare il riepilogo odierno né la condivisione, senza alterare le statistiche precedenti. Condivisione, stato di preparazione e copia manuale sono disponibili solo in questa scheda e solo per il risultato odierno applicabile; non si condividono risultati storici. Il piè di pagina di condivisione resta fuori dall'area scorrevole e la sua altezza è riservata; lo scorrimento consente di portare interamente sopra il piè di pagina anche l'ultimo elemento e il testo di copia manuale. Storico non mostra piè di pagina né feedback di condivisione.

Lo Storico comprende tutti gli esiti conclusi conservati localmente: vittorie, sconfitte e scadenze di partite iniziate; il risultato odierno è incluso solo dopo la rivelazione completa. Le partite sono ordinate dalla conclusione più recente, con ordine stabile a parità, senza paginazione; partite diverse della stessa data restano voci distinte. Ogni voce chiusa mostra soltanto parola soluzione, tentativi accettati e punti assegnati, con etichette accessibili. Ogni voce è espandibile indipendentemente; più partite possono restare aperte e aprirne una non ne chiude altre. La voce mancante o ritirata non è apribile. L'espansione mostra una griglia statica di sei righe per cinque colonne con le lettere di ogni tentativo accettato e i relativi riscontri verdi, gialli o grigi; le celle inutilizzate sono neutre. Mostra inoltre data, esito (Vittoria, Sconfitta o Scaduta), tentativi accettati, punti assegnati e durata fissa. Le tessere hanno descrizioni non basate sul solo colore. Non sono presenti bozza modificabile, tastiera, invio di tentativi, replay o nuova animazione di rivelazione.

Lo storico è consultabile in chiaro su questo dispositivo: la condivisione senza spoiler non nasconde le lettere nello storico e non modifica la privacy dell'esportazione. La durata deriva dai primi e terminali invii registrati o dal confine originale di scadenza, mai dalla fine dell'animazione; è mostrata come m:ss sotto un'ora e h:mm:ss altrimenti, troncando solo i secondi frazionari. La vittoria al primo tentativo mostra 0:00; non si mostrano orari di inizio/fine e non si altera la precisione del punteggio. Uno storico vuoto è spiegato in italiano, con la spiegazione dei dati locali: sono disponibili solo le partite ancora conservate in questo browser, senza sincronizzazione né recupero dei dati cancellati. Non si inventano voci e partite incompiute, mai iniziate o ritirate non espongono la soluzione.

Nella stessa apertura del pannello, il passaggio tra schede conserva le espansioni valide. Cambi di tema e aggiornamenti ordinari di giorno o archivio mantengono scheda selezionata ed espansioni valide, con focus e scorrimento utilizzabili. Un cambio di giorno mantiene aperto il pannello sulla scheda selezionata, aggiorna totali e storico e rimuove riepilogo e condivisione del risultato del giorno precedente. La sostituzione della parola mantiene il pannello utilizzabile, rimuove risultato ritirato e relativa presentazione di punteggio, durata, condivisione, copia manuale e stato, aggiorna i totali dagli esiti superstiti e non consente a feedback tardivi di ripristinare contenuto obsoleto; nella cronologia elimina solo la voce ritirata e la sua espansione, preservando le altre espansioni valide. Se necessario sposta il focus su un controllo storico vicino utilizzabile senza chiudere il pannello. Solo la vittoria o sconfitta rivelata della parola sostitutiva fornisce un nuovo riepilogo corrente.

## Code notes

Commit: 991659b661a43604f410e309f4d098dd260c44c1

- `src/main.ts`: il rendering compone un solo modal; `finishReveal` apre Statistiche dopo una rivelazione terminale. Handler di click e tastiera aprono/chiudono i pannelli; il modal impedisce input alla griglia. Il riepilogo attuale gestisce conteggi, statistiche, punteggio recente e condivisione. Riutilizzare i percorsi esistenti per focus, scroll, risultati ripristinati e condivisione; la griglia storica deve essere statica, senza input o effetti di rivelazione.
- `src/style.css`: stili modal, tema e griglia.
- `e2e/interface.spec.ts`, `e2e/windows.spec.ts`, `e2e/statistics.spec.ts`: coprono navigazione, soglia di rivelazione, condivisione limitata al modal e scorrimento del piè di pagina. Preservare le protezioni per cambio di giorno/ritiro e il comportamento dei risultati ripristinati.
