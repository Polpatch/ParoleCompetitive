---
technical: false
refs: ["statistics","requirements/data#statistics","requirements/rules#statistics","requirements/quality#statistics"]
---
# Statistiche dopo la sostituzione

Le statistiche locali riflettono una sola volta ogni esito giornaliero concluso, anche dopo ricariche, riaperture o consegne concorrenti. Una vittoria incrementa le vittorie e il bucket corrispondente al numero di tentativi, da uno a sei; una sconfitta per tentativi esauriti o scadenza dopo l'inizio incrementa le sconfitte. Una partita scaduta prima di iniziare non modifica i conteggi. Sono mostrati vittorie, sconfitte, distribuzione delle vittorie nei sei tentativi e punteggio dell'ultima partita conclusa; una scadenza iniziata ha punteggio zero, mentre in assenza di esiti conclusi è mostrato lo stato senza risultato.

Quando entra in vigore il nuovo calendario, è ritirato soltanto il contributo della partita del giorno di attivazione che apparteneva al calendario precedente, anche se già conclusa. Il ritiro elimina la relativa vittoria o sconfitta e, per una vittoria, il relativo bucket; non crea un risultato negativo. Le statistiche sono ricalcolate dagli esiti giornalieri superstiti: restano invariati tutti gli altri giorni e le preferenze, e il punteggio più recente torna a quello del più recente esito superstite oppure allo stato senza risultato. Ritiro ripetuto e risultati tardivi o riprodotti della vecchia partita non devono reintrodurre il contributo né alterare il risultato della nuova partita; il suo futuro esito è conteggiato una sola volta. Non sono richiesti classifiche, cronologia ordinata o serie aggiuntive. I risultati locali e l'orologio del dispositivo sono considerati attendibili, senza garanzie di sincronizzazione tra dispositivi o di resistenza a manomissioni.

La verifica copre conteggio singolo dopo ricarica, consegne ripetute e schede concorrenti; bucket per vittorie in uno e sei tentativi; scadenza iniziata e non iniziata; rimozione di una vittoria col suo bucket e di una sconfitta; ripristino dell'ultimo punteggio precedente o dello stato senza risultato; conservazione degli altri giorni; un solo esito della nuova partita; e inalterabilità dopo ritiro ripetuto o consegna tardiva della vecchia partita.

## Code notes
Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/statistics.ts` deriveStatistics(recordsByDate) deriva vittorie, sconfitte, distribuzione a sei bucket e ultimo punteggio dai record datati; seleziona l'ultimo per endedAt, poi data, e restituisce null senza esiti conclusi.
- `src/session.ts` conserva partite datate; `src/main.ts` mostra statistiche derivate dopo la rivelazione e serializza/riconcilia azioni. Rimuovere il solo record del giorno di attivazione consente alla derivazione esistente di ripristinare conteggi e ultimo punteggio.
- Esiti vinti usano guesses.length-1 per il bucket; perse e scadute dopo l'inizio sono sconfitte, mentre pronte/in corso/scadute senza inizio non contano. La sostituzione non deve fabbricare una scadenza né azzerare le date superstiti. Il cambio invalida una volta l'identità della vecchia partita; esiti vecchi riprodotti o tardivi non devono sovrascrivere quello nuovo.
