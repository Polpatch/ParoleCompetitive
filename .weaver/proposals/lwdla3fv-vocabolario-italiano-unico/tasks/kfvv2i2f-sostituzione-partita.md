---
technical: false
refs:
  - daily-game
  - requirements/data#daily-game
  - requirements/rules#daily-game
  - requirements/quality#daily-game
  - requirements/ui#daily-game
---
# Sostituzione della partita

Per la data di attivazione, definita come la data esplicita in Europe/Rome del rilascio che introduce il nuovo calendario, il nuovo insieme canonico di parole italiane è identico per soluzioni e tentativi validi: comprende lessico ampio e forme flesse, incluse parole volgari o offensive. Ogni soluzione selezionabile è quindi accettata come tentativo; AUDIO e OZONO sono accettate senza distinzione tra maiuscole e minuscole. Restano invariati i vincoli esistenti di cinque lettere ASCII, lettere certamente assenti e modalità difficile. La selezione giornaliera segue una permutazione deterministica congelata.

Prima di ripristinare, accettare tentativi o applicare la scadenza, riconciliare in modo serializzato e idempotente il cambio di calendario. Se la vecchia partita della data di attivazione è presente, ritirarla e sostituirla con una partita vuota del nuovo calendario, anche se era non iniziata, in corso, vinta, persa o già scaduta. Non sopravvivono bozza, tentativi, feedback, tempi, esito o punteggio della vecchia partita; il ritiro non è una sconfitta né una scadenza ordinaria. Conservare preferenze e ogni altra data, inclusi i risultati precedenti.

La riconciliazione identifica separatamente i calendari anche quando la soluzione coincide. Il marcatore persistente del cambio e l'aggiornamento della partita interessata sono coerenti con la scrittura serializzata: riaperture, ricostruzioni, schede concorrenti e riconciliazioni ripetute non cancellano progressi o risultati della nuova partita e non ripristinano quella vecchia. Se il cambio viene scoperto dopo la data di attivazione, ritirare soltanto il record e l'esito obsoleti di quella data prima della normale scadenza; non creare una partita sostitutiva passata, non registrare una sconfitta e non alterare date intermedie. Mantenere la compatibilità necessaria ai calendari precedenti per leggere le partite salvate.

Dopo il ritiro mostrare in italiano che la partita e il risultato di quella data sono stati sostituiti, mentre risultati precedenti e impostazioni sono conservati. Per la data ancora attiva presentare una griglia vuota di sei righe da cinque, tastiera senza conoscenze precedenti e input disponibile; nessun vecchio feedback, punteggio o messaggio di esito deve ricomparire. Per un cambio scoperto in ritardo spiegare il ritiro senza presentare una nuova partita per quella data passata.

Verificare l'ammissione tramite il percorso di produzione con il dizionario reale: AUDIO e OZONO devono essere accettate in partite fresche, con feedback ordinario, normalizzazione delle maiuscole e corretti effetti su tentativi e orologio; una parola assente deve essere respinta senza tentativo né avvio del tempo. Verificare inoltre che vincoli di lettere note e modalità difficile continuino a respingere tentativi non validi. Verificare il ritiro per partite non iniziate, in corso, vinte, perse e già scadute, anche alla prima scoperta successiva alla data di attivazione; date diverse e preferenze restano intatte. Riapertura, ricaricamento, schede concorrenti e record obsoleti non devono cancellare o resuscitare la partita sostitutiva né conteggiare il ritiro come sconfitta. Con dati e calendario controllati, la verifica browser copre input reale, avviso di reset, griglia vuota, statistiche precedenti ripristinate, blocco corretto della condivisione e conservazione dei nuovi progressi dopo il ricaricamento. Restano valide le verifiche esistenti su rivelazione, movimento ridotto e blocco dei risultati terminali.

## Code notes

Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/game.ts`: `submitGuess` validates five ASCII letters, uppercases, rejects known-gray letters, then dictionary membership and hard constraints; rejection returns the unchanged game. `setDraft` refuses gray-only letters. Preserve this order and existing feedback/time behavior.
- `src/session.ts`: `readSession` validates saved game shapes and every solution/guess against `allowedGuesses`; `playGuess` receives the actual Set. `src/persisted-game.ts` validates saved structure/outcomes. Removing allowed words invalidates the whole session.
- `src/main.ts`: action processing, storage/reconciliation and reveal flow persist before reveal; rejected guesses do not reveal. Read/reconcile before restore/expiry is the cutover hook; distinguish schedule identity, not solution text.
- `test/game.test.ts` and `test/session.test.ts` use synthetic word Sets; `e2e/interface.spec.ts` selects words already in the dictionary, leaving real admission gaps. No cutover migration exists in the inspected session path. Preserve earlier records/preferences, exactly-once serialized writes, and run delayed migration before expiry.