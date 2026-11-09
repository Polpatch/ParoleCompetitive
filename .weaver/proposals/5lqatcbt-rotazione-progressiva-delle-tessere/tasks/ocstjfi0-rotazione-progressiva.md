---
technical: false
refs:
  - daily-game
  - requirements/ui#daily-game
  - requirements/quality#daily-game
---
# Rivelazione progressiva delle tessere

Ogni tentativo accettato rivela le proprie cinque tessere da sinistra a destra, lasciando inalterate le righe precedenti. Ogni rotazione dura 1 s; gli avvii avvengono a 0, 0,3, 0,6, 0,9 e 1,2 s dall’inizio della rivelazione. È stato scelto esplicitamente lo sfalsamento degli avvii: le rotazioni si sovrappongono, senza aggiungere una pausa dopo la fine di ogni tessera. L’intera sequenza termina con la quinta rotazione, nominalmente a 2,2 s.

Ogni tessera resta neutra e la sua descrizione accessibile non anticipa il feedback fino a metà della propria rotazione. In quel momento compaiono insieme il colore corretto — grigio assente, giallo presente altrove, verde in posizione — e la corrispondente descrizione accessibile. Il feedback già rivelato resta visibile mentre proseguono le altre tessere. I cinque feedback non devono apparire tutti insieme alla fine.

Fino al completamento della quinta rotazione, non sono accettati nuovi tentativi, Invio ripetuti o modifiche del tentativo, né dalla tastiera fisica né da quella a schermo. La conoscenza cumulativa della tastiera, le statistiche visibili, il messaggio dell’esito e la disponibilità della condivisione non anticipano l’esito appena accettato: si aggiornano solo dopo la rivelazione completa. Una partita ancora in corso torna utilizzabile a quel punto; una vittoria o sconfitta resta definitivamente bloccata.

Con la preferenza di sistema per il movimento ridotto, tutti i colori e le descrizioni accessibili compaiono immediatamente dopo che il tentativo è stato registrato, senza rotazioni né attese artificiali. Nello stesso completamento immediato si aggiornano le presentazioni dipendenti dalla rivelazione e si rimuove il blocco temporaneo, mantenendo quello definitivo delle partite concluse.

Preservare il comportamento già esistente: il tentativo accettato e l’eventuale risultato finale sono registrati una sola volta prima della rivelazione; inizio, fine del tempo e punteggio dipendono dall’invio e non dalla durata dell’animazione. Riaprire la pagina ripristina il feedback già registrato senza ripetere la rivelazione o contare un altro risultato. Restano invariati il rifiuto senza consumo di tentativi, la riconciliazione tra schede e il passaggio alla nuova sfida giornaliera.

La verifica nel browser deve osservare gli avvii distanziati di 0,3 s, il cambio coordinato di colore e descrizione a metà di ciascuna rotazione, il blocco fino al termine dell’ultima tessera e l’assenza di anticipazioni nelle presentazioni dipendenti. Verificare anche il percorso immediato con movimento ridotto, il ripristino durante una rivelazione e un tentativo conclusivo senza alterare tempi, punteggio o blocco definitivo. Adeguare le verifiche esistenti che presuppongono un’attesa con movimento ridotto.

## Code notes
Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/main.ts`: `render()` costruisce le tessere; `revealing`, `revealRow` e `beforeReveal` mascherano feedback, tastiera e statistiche. `perform()` salva prima della rivelazione e usa ora un unico `setTimeout` di 1000 ms. `refreshShare()` attende la fine della rivelazione; preservare la coda delle azioni e Web Locks.
- `src/style.css`: `.tile.revealing`, `flip 1s ease-in-out`, rotazione a 90° al 50%; la media query per movimento ridotto elimina solo l’animazione. Oggi tutte le tessere ricevono la classe insieme e i colori arrivano dopo il timer.
- `src/game.ts` (`submitGuess`), `src/session.ts` e `src/persisted-game.ts`: mantenere commit, tempi, punteggio, ripristino e riconciliazione indipendenti dall’animazione. `src/share.ts` (`snapshotResult`) richiede un risultato rivelato.
- `e2e/interface.spec.ts`: copre blocco, ripristino, movimento ridotto, cambio giorno e salvataggio non disponibile; oggi attende la scomparsa di cinque tessere `.revealing`. `e2e/statistics.spec.ts` copre esiti tra schede e ripristino. Attenzione ai callback della rivelazione dopo un cambio giorno e ai render che ricostruiscono la griglia.
