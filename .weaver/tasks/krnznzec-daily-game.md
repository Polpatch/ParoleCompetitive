---
column: done
technical: false
refs:
- daily-game
- requirements/data#daily-game
- requirements/quality#daily-game
- requirements/ui#daily-game
proposal: st31jv5v
job: qw6u7wvq
created: 2026-11-08T22:24:48.187Z
finished: 2026-11-08T23:35:24.552Z
---
# Selezione acquisita e storico

Dal 2026-11-08 il gioco giornaliero acquisisce una selezione segreta validata, distinta dalla selezione pubblica, e la conserva insieme alla partita datata. Ogni riapertura valida lo storico usando l’assegnazione acquisita e la sua identità di sfida, senza ricalcolare HMAC nel browser né ricostruire partite successive all’attivazione da calendari pubblici. Una selezione non disponibile non crea la partita odierna, non avvia il tempo, non blocca le preferenze e non registra esiti; il gioco resta in attesa con la board e la tastiera disabilitate, stati italiani di caricamento/errore/aggiornamento e Riprova manuale. Impostazioni, guida, statistiche, modalità del pannello, focus e tema restano utilizzabili. Una partita odierna già acquisita e valida continua a funzionare offline. Non sono promessi avvio a freddo offline o selezioni future ignote; il client pubblico già in cache non è revocabile e la garanzia comune vale solo per client aggiornati compatibili.

La riconciliazione ritira una sola volta, per il solo 2026-11-08, la sfida pubblica precedente, sostituendo esclusivamente il suo record e il suo risultato anche se già concluso, scaduto o scoperto più tardi. Un ritardo ritira il record prima della normale scadenza, senza creare una partita passata né inventare una sconfitta. Nessun record del 2026-11-09 è ritirato per il taglio di versione abbandonato. Date precedenti, preferenze e partite compatibili successive restano intatte; scritture pubbliche obsolete dal giorno di attivazione sono respinte. La sostituzione conserva le preferenze future ma non eredita lettere manuali o fisse, tentativi, feedback, avvio/fine, esito o punteggio della vecchia sfida. Non è una vittoria, sconfitta o scadenza ordinaria. Un’identità stabile di ritiro e il cambiamento della partita sono coerenti e serializzati: riaperture, ricaricamenti, schede concorrenti e riconciliazioni ripetute non possono cancellare il progresso o l’esito acquisito né resuscitare il record pubblico ritirato.

Le partite non concluse dei giorni precedenti scadono alla reale mezzanotte Europe/Rome anche quando la selezione di oggi manca; una scadenza rilevata tardi non prolunga il gioco. Le partite mai iniziate terminano senza perdita; quelle iniziate fissano la fine al confine giornaliero, punteggio zero e una perdita. Mancanza o corruzione dello storage produce un avviso italiano onesto e una sessione utilizzabile solo in memoria, senza dichiarare il salvataggio riuscito o cancellare altri dati; senza selezione valida nemmeno questa modalità inventa una partita. Statistiche durevoli e applicazione dei confini giornalieri richiedono storage disponibile.

La riconciliazione tra schede precede ogni accettazione e impedisce doppi esiti: una scheda obsoleta ricarica il record autorevole invece di aggiungere progressi concorrenti. Una transazione accettata e il suo risultato terminale vengono salvati atomicamente prima dell’animazione; il ripristino non aggiunge tentativi, non cambia orari o punteggi e non riproduce la rivelazione. Si conservano esattamente bozza posizionale, feedback, lettere manuali, timestamp, esito, punteggio e scelta di autocomplete bloccata; la scelta del gioco è indipendente dalla preferenza futura e i record storici senza scelta restano compatibili con autocomplete disattivato. La partita terminale non offre una nuova bozza. Le regole di tentativi, dizionario, feedback, punteggio, modalità difficile, autocomplete, animazione e presentazione del gioco restano invariate.

L’interfaccia spiega in italiano che la sfida e l’eventuale risultato del giorno di attivazione sono stati sostituiti, mentre risultati precedenti e impostazioni restano conservati; mostra la nuova board vuota sei per cinque, tastiera nuova e input disponibile quando la selezione è valida. Se la scoperta è tardiva, spiega il ritiro senza mostrare una nuova partita per il passato. La condivisione non espone lettere della soluzione e resta bloccata finché la rivelazione di un esito nuovo non è completa.

La copertura di regressione verifica selezioni acquisite e validazione storica, assenza di avvio senza selezione, scadenza precedente anche senza dati odierni, ritiro di record non iniziati, in corso, vinti, persi e già scaduti, inclusa scoperta tardiva. Con calendario e storage controllati verifica conservazione delle date/preferenze estranee, assenza di perdita inventata, esattamente una riconciliazione e resistenza a ricaricamento, schede concorrenti e scritture pubbliche obsolete. Verifica inoltre il ripristino senza alterare bozze, feedback, orari, risultati, punteggi o scelta bloccata, il ritiro durante rivelazione e bozza parziale senza aggiornamenti tardivi, la persistenza del progresso sostitutivo e gli stati/interazioni accessibili di caricamento, errore, riprova e incompatibilità. I controlli browser usano tempo e dati controllati, senza attendere mezzanotte; restano valide tutte le verifiche esistenti di dizionario reale, rivelazione, movimento ridotto e blocco terminale.

## Code notes

Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6
- `src/session.ts`: reconciliation ordering (cutover before expiry), serialized session updates, game creation; separate acquisition authorization from expiry and never await network under storage locks.
- `src/persisted-game.ts`: validates saved date and schedule identity; retain identity and validate acquired assignment rather than recomputing HMAC/public schedule.
- `src/main.ts`: serialized actions, initialization/storage listener and persistence warning; date/schedule guards cancel stale reveals and sharing while preserving modal state.
- Reuse regression conventions in `test/session.test.ts`, `test/persisted-game.test.ts`, `test/replacement.test.ts`, `tests/statistics.test.ts`; browser cutover and controlled-time patterns in `e2e/replacement.spec.ts`, `e2e/interface.spec.ts`, `e2e/statistics.spec.ts`, `e2e/windows.spec.ts`. Network acquisition coverage was absent in the explored account.
