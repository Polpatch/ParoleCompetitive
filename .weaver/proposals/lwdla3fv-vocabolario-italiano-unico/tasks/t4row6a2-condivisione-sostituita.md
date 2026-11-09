---
technical: false
refs:
  - result-share
  - requirements/data#result-share
  - requirements/quality#result-share
  - requirements/ui#result-share
---
# Condivisione del risultato sostituito

La condivisione è disponibile soltanto dopo la rivelazione finale di una partita vinta o persa. Il risultato condiviso è una presentazione privata e ripetibile, costruita da uno snapshot del risultato e comprendente data della sfida, esito, numero di tentativi accettati su sei e punteggio. La scheda immagine contiene titolo, data, esito/conteggio tentativi, punteggio e griglia sei per cinque; le celle non usate sono neutre. Non contiene lettere delle ipotesi, soluzione o tastiera. Con la modalità senza spoiler, l'intera prima riga è neutra, inclusi i colori di feedback; senza tale modalità, conserva i colori della prima riga ma non le lettere. Il testo alternativo applica la stessa protezione, con segnaposto neutri nella prima riga.

Il nuovo calendario del vocabolario unico sostituisce la sfida già offerta nella data esplicita di attivazione in Europe/Rome, anche se il giocatore l'aveva conclusa. Viene ritirato soltanto il risultato della vecchia sfida di quella data, conservando giorni precedenti e preferenze; la nuova sfida dello stesso giorno è distinta. Un ritiro ripetuto o scoperto più tardi non deve invalidare il risultato della nuova sfida.

La preparazione, il testo e i contenuti per la copia manuale appartengono all'identità della sfida, non soltanto alla data. Quando viene ritirata una sfida sostituita, la sua disponibilità di condivisione, la preparazione e il testo manuale visibile sono invalidati; vengono rimossi anche i relativi feedback di condivisione. Una preparazione o un completamento asincrono tardivo non ripristina la disponibilità e non avvia una condivisione, copia o fallback per il risultato ritirato. Un'operazione esterna già consegnata al sistema di condivisione o copia non può essere revocata. La nuova sfida resta senza condivisione fino alla rivelazione del proprio risultato vinto o perso. Riaprendo una partita completata della giornata corrente, la disponibilità viene ripristinata; una partita incompleta scaduta non offre condivisione. La condivisione non modifica progressi, timestamp, punteggio o totali.

Se la condivisione immagine nativa non è disponibile, viene offerto il testo equivalente senza lettere; se la copia automatica non è disponibile o viene negata, il testo resta disponibile per la copia manuale con feedback appropriato. La cancellazione della condivisione nativa è silenziosa e non avvia copia negli appunti né download PNG. Non si avvia alcun download PNG automatico. Successo, errore e disponibilità della copia manuale ricevono feedback significativo in italiano; fallimenti generici consentono di riprovare senza modificare partita o risultato.

Verificare capacità nativa, fallback testuale, diniego degli appunti/copia manuale, annullamento ed errore generico. Ispezionare pixel o contenuto disegnato dell'esportazione per escludere lettere di ipotesi/soluzione e confermare la prima riga interamente neutra con protezione spoiler attiva; una verifica della sola invocazione dell'API non basta. Preservare l'attivazione utente della condivisione nativa: quando necessario, preparare l'immagine prima del gesto di condivisione senza perdere l'attivazione durante la rasterizzazione asincrona. Ove disponibile, osservare il comportamento su browser/dispositivo supportato e indicare i limiti di verifica specifici, senza dichiarare che il contenuto è stato consegnato. Descrivere accuratamente i test automatici esistenti, senza attribuire loro verifiche pixel o copertura di retry della preparazione non presenti nella suite.

Verificare specificamente che la sostituzione rimuova azione di condivisione, immagine preparata e testo manuale del risultato ritirato. Simulare preparazione o completamento tardivi: non ripristinano il vecchio risultato né avviano un fallback. Verificare che un nuovo risultato diventi condivisibile soltanto dopo la propria rivelazione finale e rimanga disponibile dopo una riconciliazione ripetuta del medesimo ritiro.

## Code notes
Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6
- `src/share.ts`: `snapshotResult(game,today,revealed)` verifica data, rivelazione ed esito vinto/perso; `ResultSnapshot` non include attualmente l'identità della sfida. Copia le righe di feedback. `prepareResult` codifica asincronamente Canvas in PNG e testo privato.
- `sharePrepared` invoca condivisione nativa o appunti; il completamento Promise può arrivare dopo l'invalidazione. Le operazioni browser già consegnate non sono revocabili: impedire che lavoro tardivo ripristini la vecchia UI o avvii un nuovo fallback.
- `src/main.ts` controlla disponibilità visualizzata in base a rivelazione/esito e gestisce gli esiti restituiti; preservare il gesto diretto utente/l'attivazione nativa e le convenzioni di esportazione senza lettere e privacy.
- L'output corrente contiene data/esito/tentativi/punteggio/feedback; la privacy della prima riga è applicata dalla griglia. Cancellare presentazioni obsolete per l'identità ritirata corrispondente, non a ogni riconciliazione ripetuta. Non sono stati letti corpi di test di condivisione.
