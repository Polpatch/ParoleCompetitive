---
technical: false
refs:
  - daily-challenge
  - preferences
  - result-sharing
  - player
  - calendar
  - requirements/ui#General
  - requirements/quality#General
---
# Interfaccia e integrazione

Integrare le vere funzioni della partita giornaliera, parole, preferenze, statistiche e condivisione in un'unica applicazione ParoleCompetitive in italiano. Il progetto non contiene codice applicativo già presente: nessuna parte del comportamento può essere dichiarata già realizzata. Non sostituire gli esiti reali con dati dimostrativi e non lasciare schermate o collegamenti fittizi.

Presentare un'interfaccia essenziale responsive per telefono e desktop: griglia centrale di sei righe e cinque tessere, tastiera QWERTY sottostante, impostazioni, statistiche locali e risultato con azione di condivisione. Collegare l'apertura e il ritorno del giocatore al ripristino della sfida corretta, gli invii alla partita, i cambi di difficoltà e protezione spoiler alle preferenze e la condivisione all'esito concluso. Tutti questi eventi devono avere gli stessi effetti da controlli a schermo e tastiera fisica dove applicabile. Rispettare la divisione delle responsabilità dei Machine delle altre Task, senza un secondo stato indipendente che possa divergere.

Il calendario usa Europe/Rome e gestisce cambio giorno e ritorno da scheda sospesa: prima chiude l'eventuale partita scaduta e ne registra l'esito una sola volta, poi offre la nuova parola. Una nuova giornata ha una nuova partita; riaprire lo stesso giorno ripristina anche un risultato concluso senza rigiocarlo. Le statistiche, le preferenze future, l'eventuale downgrade e l'idoneità al bonus difficile devono restare coerenti in tutte le viste. Un esito ripristinato permette di nuovo la condivisione soltanto se è una vittoria o sconfitta, non una partita incompleta scaduta.

Fornire una breve guida in italiano con sei tentativi, colori e doppioni, reset a mezzanotte italiana, tempo dal primo tentativo valido anche a pagina chiusa, limiti dei dati locali e distinzione fra modalità standard e difficile. Il gioco standard blocca anch'esso lettere sicuramente assenti; il difficile aggiunge gli indizi di posizione e molteplicità osservata e un bonus del 10%, perso con downgrade. Il menu spiega che il passaggio standard→difficile non è consentito dopo l'avvio, mentre prima e dopo la partita i cambi sono liberi per la preferenza futura.

Controlli semantici, nomi accessibili, focus visibile, feedback annunciato per errori ed esito e contrasto sufficiente; il colore non è l'unico indizio accessibile. Rispettare reduced-motion nella rotazione delle tessere senza cambiare regole o tempi. Non intercettare digitazione di altri controlli editabili o scorciatoie con modificatori. Mostrare chiaramente gli eventuali limiti di persistenza; non promettere sincronizzazione o classifica online.

Il sito è statico e non richiede rete durante una partita dopo il caricamento, né API runtime, login, analytics o font esterni. Supportare Chromium, Firefox e Safari correnti e layout mobili senza rendere obbligatori Web Share o Clipboard per poter giocare. Non introdurre installazione PWA, service worker, nuovi selettori di tema o funzionalità estranee.

Verifica: aprire la superficie reale a larghezza mobile e desktop, giocare con entrambe le tastiere, osservare animazione e blocchi, riaprire una partita salvata e un risultato concluso, cambiare preferenze nei momenti consentiti, consultare statistiche e raggiungere la condivisione reale. Esercitare ritorno dopo cambio giorno con tempo controllato e verificare accessibilità da tastiera e reduced-motion; riportare i browser effettivamente esercitati e gli eventuali limiti di prova, senza dichiarare copertura non osservata.
