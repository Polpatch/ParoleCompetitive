---
technical: false
refs:
  - daily-game.RESULT_REVEALED
  - requirements/ui#daily-game
---
# Tastiera e rivelazione

La tastiera integrata presenta esattamente tre righe QWERTY fisse e non avvolgibili, anche a 320 px e su desktop: `QWERTYUIOP`, `ASDFGHJKL`, quindi `Invio`, `ZXCVBNM` e `Cancella`. Le righe più corte sono centrate con rientri e i tasti azione sono più larghi quando lo spazio lo consente; il layout non causa scorrimento orizzontale della pagina e non introduce altri tasti. I tasti fisici A–Z, Invio e Backspace mantengono il comportamento equivalente, senza intercettare input in altri controlli modificabili, scorciatoie con modificatori o input di gioco mentre un pannello modale è aperto.

Conservare la rivelazione già prescritta: ruotano soltanto le cinque tessere della riga accettata, da sinistra a destra, per un secondo ciascuna, con partenze distanziate di 0,3 secondi e conclusione complessiva nominale a 2,2 secondi. Ogni tessera resta neutra e senza feedback nella descrizione accessibile fino al punto medio della propria rotazione, quando colore e descrizione diventano visibili insieme. Fino al termine della quinta rotazione restano bloccati modifiche e invii; feedback cumulativo della tastiera, statistiche visibili, messaggi di risultato e disponibilità della condivisione mantengono la presentazione precedente.

Con movimento ridotto, colori e descrizioni accessibili delle cinque tessere appaiono immediatamente dopo la registrazione del tentativo, senza rotazioni né attese artificiali; anche gli aggiornamenti dipendenti dalla rivelazione e lo sblocco degli input avvengono immediatamente nello stesso ordine. Una partita conclusa resta bloccata. La nuova apertura automatica del risultato deve seguire la conclusione effettiva di questa sequenza, non una durata fissa separata.

La tastiera conserva il miglior feedback cumulativo per ogni lettera nell'ordine verde, giallo, grigio; le lettere dimostrate interamente assenti sono visivamente e funzionalmente disabilitate in entrambe le modalità, anche da tastiera fisica, salvo evidenza positiva su duplicati. La conoscenza non rivelata della soluzione non disabilita tasti. Invio e Cancella restano utilizzabili quando appropriato. Lunghezza non valida, parola sconosciuta, uso di lettera assente e violazioni della modalità difficile ricevono feedback accessibile senza consumare un tentativo. Gli stati assente, rivelazione in corso e partita conclusa impediscono gli input non consentiti.

Ogni nuova vittoria o sconfitta conclusa localmente durante la visita emette una sola volta il feedback finale dopo che la rivelazione è terminata, anche con movimento ridotto. Esito e tempi restano fissati all'invio accettato, senza attendere l'animazione. Il segnale non viene emesso per tentativi non terminali, risultati ripristinati o ricevuti da un'altra visita, sfide scadute, callback di una giornata ormai non corrente o sfide ritirate, anche quando la sostituzione avviene nello stesso giorno prima della fine della rivelazione. Il controllo riguarda la sfida ancora corrente, non soltanto la data: una callback della sfida sostituita non deve ripristinare feedback, risultato o riepilogo obsoleti. La nuova partita conserva invece la propria rivelazione e può emettere il proprio segnale terminale una sola volta.

## Code notes

Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/main.ts`: `perform()`, `beforeReveal`, `revealRow`, `revealing` e callback di rivelazione; snapshot/ripristino salta la rivelazione. Esito e tempi sono già registrati prima dell'animazione; il callback controlla già il giorno corrente per il messaggio di esito.
- `src/main.ts`: render della tastiera, delega dei click e `input()`; gestione fisica ignora controlli modificabili e scorciatoie con modificatori. Riutilizzare i blocchi per assenti e stato terminale/rivelazione.
- `src/style.css`: tastiera centrata attualmente con flex avvolgibile; mantenere il comportamento responsive senza avvolgimento.
- `e2e/interface.spec.ts`: copre viewport 320/1280 e tastiera basata su summary.