---
column: done
technical: false
refs:
- statistics
- requirements/data#statistics
- requirements/rules#statistics
- requirements/ui#statistics
- requirements/quality#statistics
proposal: 0ym0zxm1
job: 2g6ov7r4
created: 2026-11-09T12:21:19.499Z
finished: 2026-11-09T12:42:33.980Z
---
# Statistiche locali

Le statistiche riflettono una sola volta ogni esito concluso sopravvissuto, anche dopo ricariche, riaperture e consegne concorrenti. Le vittorie incrementano il totale e il bucket corrispondente al numero di tentativi accettati, da uno a sei; le sconfitte per tentativi esauriti e le scadenze di partite iniziate incrementano le sconfitte. Le scadenze non iniziate non modificano i conteggi. Il punteggio totale è la somma dei punteggi immutabili degli esiti sopravvissuti, con zero per sconfitte e scadenze iniziate; senza esiti vale zero. Il riepilogo mostra il punteggio cumulativo, mantenendo il punteggio del giorno nel relativo risultato.

La scheda Statistiche presenta in alto due riquadri affiancati e bordati: Vittorie con coppa e Sconfitte con cuore spezzato, icone centrate sul bordo superiore che interrompono il bordo, e conteggi centrati. Nomi e valori sono accessibili anche senza affidarsi alle icone o al colore. Sotto compare il punteggio totale e un istogramma verticale autentico a sei barre, etichettate da uno a sei tentativi, con conteggio visibile per ogni bucket e scala lineare comune da zero al massimo. Conteggi uguali hanno altezza uguale; bucket a zero non producono barre di altezza positiva. Se tutte le vittorie sono zero, restano visibili etichette e conteggi zero insieme a uno stato italiano senza vittorie, senza divisione per zero o barre inventate. La presentazione resta leggibile a 320 px e su desktop, in temi chiari e scuri e con testo ingrandito, senza overflow orizzontale.

Le schede si chiamano Statistiche e Storico; la prima è selezionata inizialmente. Condivisione e relativo stato restano soltanto in Statistiche, senza esportare lettere. Lo storico comprende tutti gli esiti conclusi conservati localmente, ordinati per conclusione decrescente, poi data decrescente e identità crescente per parità stabili. Sfide pubbliche e acquisite nella stessa data sono distinte e contribuiscono ciascuna una volta. Non vi sono paginazione né recupero remoto. Le vittorie e sconfitte odierne appaiono solo dopo la rivelazione completa; partite incompiute, scadenze non iniziate e sfide ritirate sono escluse. Il numero di tentativi conta solo quelli accettati, anche nelle scadenze anticipate. La durata è il massimo fra zero e la differenza tra conclusione e prima proposta accettata; le scadenze terminano al confine originale del giorno. La consultazione è di sola lettura e non ripete né modifica partite.

I dati locali conservano gli esiti validi e i punteggi già fissati senza ricalcolarli in base a preferenze successive; la storia non eccede i dati già conservati nell'origine browser. Non si introducono account, sincronizzazione, classifica online, risultati mancanti inventati, streak aggiuntive o condivisione dello storico. Il ritiro di una sfida sostituita rimuove soltanto il suo esito, il contributo al bucket, il punteggio e la voce storica; totali e storia sono derivati dagli esiti sopravvissuti, con totale zero se non ne resta alcuno. Ritiro ripetuto e consegne tardive della sfida sostituita non alterano il risultato della sostituta né ripristinano la voce rimossa. Conteggi, distribuzione, punteggio e storico si aggiornano durante la consultazione conservandone lo stato; la riapertura seleziona Statistiche con storico chiuso. Il nuovo risultato terminale seleziona Statistiche solo dopo la rivelazione finale, anche con movimento ridotto. Nessuna soluzione, voce storica o punteggio è esposto prima della rivelazione.

Verificare conteggio singolo dopo ricarica, consegna ripetuta e schede concorrenti; bucket per vittorie al primo e al sesto tentativo; scadenze iniziate e non iniziate; somma dei punteggi immutabili, sfide pubbliche e acquisite nella stessa data, ritiro e consegna tardiva; conservazione dei record precedenti; idoneità, ordinamento e spareggi dello storico; accessibilità, focus, ingrandimento, temi e larghezze effettive. Verificare schede da puntatore e tastiera, espansioni indipendenti, griglie e metadati completi, storico vuoto, feedback coerente con le proposte conservate e aggiornamenti durante l'interazione. La consultazione non modifica bozze, proposte, timestamp, punteggi o esiti, non riproduce rivelazioni e non condivide. Verificare che il cambio tema o aggiornamenti del giorno e dello spazio di archiviazione preservino scheda ed espansioni; che il ritiro durante il focus rimuova la voce senza ripristini; e che ripetuti cambi scheda conservino il comportamento previsto. Riepilogo e testo per copia manuale devono poter scorrere interamente sopra il piè di pagina fisso; risultati correnti ripristinati restano condivisibili, lo storico scaduto no, e aggiornamenti di giorno o ritiro rimuovono presentazioni obsolete senza riattivarle per completamenti tardivi.

Aggiornare i flussi di verifica interessati e documentare in inglese l'istogramma, il totale cumulativo, le due schede e lo storico locale di sola lettura nella documentazione principale e nel registro delle modifiche, indicando soltanto le verifiche effettivamente eseguite.

## Code notes
Commit: 991659b661a43604f410e309f4d098dd260c44c1
- `src/statistics.ts`: `StatisticsGame`, `Statistics`, `deriveStatistics` aggregano esiti; `distribution` ha sei slot. Il punteggio esistente è latestScore, non una somma.
- `src/session.ts`: `Session.games`, `publicGames`, lettura, riconciliazione serializzata e ritiro usano la sessione versionata esistente. `src/persisted-game.ts` valida i record; `src/main.ts` fonde i record aggiungendo `:public` agli identificativi pubblici.
- `src/game.ts`: `Game` e `Guess`, `submitGuess`, `expireGame`, `scoreGame` conservano soluzione, proposte accettate e feedback, inizio/fine, stato e punteggio fissato; la scadenza vale zero solo se iniziata.
- `src/main.ts` e `src/style.css` implementano il rendering e i temi esistenti. `tests/statistics.test.ts` copre vuoto, bucket, perdita, scadenza, deduplicazione e ritiro; `e2e/statistics.spec.ts` verifica attualmente conteggi e bucket testuali: aggiornare i flussi interessati, non asserzioni incidentali sulle parole.
