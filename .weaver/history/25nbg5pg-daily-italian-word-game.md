---
created: 2026-11-08T14:28:47.713Z
updated: 2026-11-08T14:28:47.713Z
summary: Adds the daily Italian word puzzle with local progress, preferences, statistics, and privacy-preserving sharing.
tasks:
- 4hjxvkgi
- 5toibbjj
- mdubca3a
- otkav77m
- ulxkgsya
- ydcx868r
cleared:
  4hjxvkgi:
    title: Parola giornaliera
    refs:
    - daily-word
    - requirements/rules#daily-word
    - requirements/data#daily-word
    - requirements/quality#daily-word
    technical: false
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T14:03:55.934Z
    body: |-
      Fornire una sfida giornaliera condivisa per data, ripristinando la partita del giorno quando il dispositivo torna e creando una nuova partita quando cambia il giorno. Stabilire la data secondo il calendario gregoriano nel fuso IANA Europe/Rome, indipendentemente dal fuso scelto sul dispositivo e includendo i cambi DST.

      Usare una lista locale stabile e revisionata di soluzioni italiane di cinque lettere, distinta dal dizionario più ampio delle parole ammesse nei tentativi. Includere localmente tutti i dati necessari; non usare feed, scraping o API runtime e non presentare la lista come fonte ufficiale o come affiliata a Wordle.

      Distribuire una snapshot fissata del progetto napolux/paroleitaliane, registrandone revisione upstream esatta, file sorgente, data di acquisizione, trasformazioni e attribuzione MIT. La provenienza upstream è in parte ignota: dichiarare esplicitamente tale limite e non affermare garanzie legali o autorevolezza. Escludere i dati di coniugazione separati sotto CC-BY-SA e non attribuirli alla licenza MIT. Non copiare codice, grafica o calendario giornaliero di Par🇮🇹le.

      Normalizzare e deduplicare l'elenco di tentativi ammessi limitandolo a cinque lettere ASCII; costruire le soluzioni dalla lista di parole comuni, senza liste di nomi propri. Revisionare l'elenco più piccolo per escludere nomi, forme oscure o non italiane, termini offensivi e parole malformate; documentare forme mantenute e decisioni editoriali. Conservare dati sorgente, versione del calendario delle soluzioni e istruzioni di trasformazione riproducibili: non sostituire i dati reali con fixture dimostrative.

      Fissare epoca, ordinamento delle soluzioni e algoritmo deterministico che assegna una soluzione a ogni data di Europe/Rome. Aperture, refresh e rebuild non devono randomizzare la parola. Aggiornamenti futuri delle liste devono preservare le assegnazioni già pubblicate e la soluzione del giorno corrente.

      Riconciliare la data all'apertura, al ritorno della pagina visibile e al confine di giornata mentre la pagina è visibile. Al cambio, scadere la partita precedente non conclusa prima di offrire e annunciare la nuova sfida; dopo più giorni di assenza riconciliare direttamente col giorno corrente senza inventare sconfitte per giorni intermedi non giocati. La stessa data e lo stesso calendario distribuito devono offrire la stessa parola.

      La verifica deve coprire determinismo per la stessa data di Roma, mezzanotte, entrambi i cambi DST, ritorno dopo un confine mancato e conservazione della parola già pubblicata attraverso un rebuild.
  5toibbjj:
    title: Partita quotidiana
    refs:
    - daily-game
    - requirements/rules#daily-game
    - requirements/data#daily-game
    - requirements/ui#daily-game
    - requirements/quality#daily-game
    technical: false
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T14:15:04.984Z
    body: |-
      Realizzare una partita quotidiana di Wordle classico con sei tentativi, ciascuno di cinque lettere A–Z. Normalizzare soltanto maiuscole/minuscole; rifiutare lettere accentate, caratteri non alfabetici, nomi propri e parole non presenti nel dizionario ammesso. Ogni soluzione deve appartenere al dizionario ammesso. Le righe incomplete, parole sconosciute, lettere impossibili in base agli indizi e violazioni delle regole hard sono rifiutate in italiano senza consumare tentativi né avviare o reimpostare il tempo.

      Valutare le lettere duplicate in due passaggi: assegnare prima il verde alle posizioni esatte e consumare quelle occorrenze della soluzione; poi assegnare il giallo da sinistra a destra usando solo le occorrenze residue; tutte le altre sono grigie. Non assegnare mai più occorrenze positive di una lettera di quante ne abbia la soluzione. La tastiera QWERTY a schermo, Invio e cancellazione devono funzionare insieme ai tasti fisici A–Z, Enter e Backspace con comportamento equivalente; non intercettare la digitazione in altri controlli modificabili né scorciatoie con modificatori. Mostrare l’informazione cumulativa migliore per ciascun tasto secondo verde > giallo > grigio. Disabilitare funzionalmente e visivamente le lettere dimostrate totalmente assenti, in modalità standard e hard, su entrambe le tastiere; un duplicato grigio eccedente non disabilita una lettera con evidenza positiva e gli indizi non devono derivare dalla soluzione non rivelata.

      In hard, ogni riga accettata deve rispettare le posizioni verdi fissate, includere le lettere gialle osservate fuori da tutte le posizioni già escluse dal giallo e contenere ogni lettera almeno il massimo conteggio verde-più-giallo osservato in una singola riga precedente. Non sommare conteggi di righe diverse, non inferire duplicati non osservati e non imporre limiti superiori segreti; lettere note solo grigie sono già bloccate in entrambe le modalità.

      La prima submission accettata fissa l’inizio del tempo. Una submission accettata terminale fissa la fine al momento dell’invio, prima dell’animazione; il primo tentativo corretto ha quindi durata zero. Il tempo trascorso è t=max(0,(endedAt-startedAt)/1000), includendo schede nascoste e chiusura del browser. Rifiuti e riaperture non cambiano l’inizio. Per ogni riga accettata, G e Y sono i conteggi di verdi e gialli; con conteggi precedenti inizialmente zero, ΔG=max(0,G-currentPreviousG) e ΔY=max(0,Y-currentPreviousY). Impostare s=0 se uno dei delta è positivo; altrimenti incrementare il conteggio consecutivo di stagnazione s, inizialmente zero. Conteggi invariati o regressi senza delta positivo sono stagnazione: la prima riga stagnante non ha penalità, ciascuna stagnazione consecutiva successiva paga 50·(s−1). Calcolare B=1000+Σ per tutte le righe accettate di (100·ΔG+40·ΔY−50·max(0,s−1)). Per una vittoria in n tentativi accettati, raw=max(0,B)/(n·(1+t/60)); applicare m=1.10 solo se la partita è iniziata in hard e non è mai stata degradata; altrimenti m=1. Calcolare Score=Math.round(raw·m), arrotondando una sola volta dopo la moltiplicazione. Sconfitta e scadenza valgono zero.

      Una submission accettata e il relativo esito devono essere registrati una sola volta, atomicamente e prima della rivelazione visiva; impedire doppi Invio, modifiche e nuovi tentativi durante la rivelazione. Dopo un risultato terminale ignorare ulteriori tentativi. La modalità reduced-motion deve mantenere lo stesso ordine di registrazione e sblocco, con rivelazione immediata o senza rotazione. Mostrare sempre sei righe da cinque caselle, bozza corrente e righe accettate; rivelare il feedback con rotazione delle caselle: grigio assente, giallo presente in altra posizione, verde corretto. Spiegare rifiuti per lunghezza, parola sconosciuta, lettera assente e violazione hard. La conclusione mostra vittoria/sconfitta e punteggio fissato; il cambio di giorno spiega il reset e mostra la nuova partita vuota. Gli artefatti condivisi non devono mai contenere le lettere della soluzione, anche quando il risultato live la mostra.

      Persistire in localStorage namespaced e versionato le partite datate, tentativi accettati e feedback, inizio, fine, stato, identità della parola e della pianificazione, idoneità al bonus e punteggio confermato. Conservare anche la bozza corrente, così la chiusura non elimina lettere non inviate. Registrare ciascun tentativo accettato e il suo risultato terminale come un’unica modifica coerente prima della rivelazione. Il ripristino ricostruisce conoscenza tastiera, vincoli e riga successiva esatta, senza tentativi aggiunti o tempo modificato. L’ambito dei dati è l’origine di archiviazione locale del browser: nessuna sincronizzazione tra browser, dispositivi o account; cancellare i dati del sito li azzera e la navigazione privata potrebbe non conservarli. Prima di accettare un tentativo, riconciliare schede concorrenti: una scheda obsoleta deve ricaricare il record quotidiano autorevole, senza aggiungere un secondo esito; usare una strategia di scrittura serializzata nei browser supportati affinché un risultato non venga conteggiato due volte.

      Se la persistenza non è disponibile o i dati sono malformati, mostrare un avviso italiano onesto e mantenere una sessione in memoria giocabile senza dichiarare un salvataggio riuscito; non cancellare silenziosamente dati estranei del sito. Spiegare che l’applicazione quotidiana delle regole e statistiche durevoli richiedono archiviazione browser utilizzabile. Al cambio del giorno Europe/Rome, una partita iniziata e incompleta scade con fine all’effettivo confine giornaliero, punteggio zero e una sconfitta; una partita non iniziata scade senza risultato. Un confine mancato e scoperto in seguito non deve prolungare il gioco del giorno precedente.

      Verificare il comportamento effettivo con test deterministici per allocazione dei duplicati, vittoria al sesto tentativo, sei errori, rifiuto senza consumo o avvio del tempo, molteplicità hard osservata, tasti di duplicati grigi eccedenti, delta e stagnazione del punteggio, t=0 alla prima vittoria e tempo che attraversa la chiusura. Includere verifiche dei downgrade e del bonus 1.10 applicato prima di un unico arrotondamento finale. Uno smoke test browser deve esercitare input reale, rivelazione, ripristino dopo reload, blocco terminale e cambio di giorno con tempo/dati controllati, senza attesa fino a mezzanotte; verificare riconciliazione tra schede e risultati exactly-once. Non introdurre retry arbitrari, telemetria o misure anti-cheat.
  mdubca3a:
    title: Interfaccia e integrazione
    refs:
    - daily-challenge
    - preferences
    - result-sharing
    - player
    - calendar
    - requirements/ui#General
    - requirements/quality#General
    technical: false
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T14:07:07.001Z
    body: |-
      Integrare le vere funzioni della partita giornaliera, parole, preferenze, statistiche e condivisione in un'unica applicazione ParoleCompetitive in italiano. Il progetto non contiene codice applicativo già presente: nessuna parte del comportamento può essere dichiarata già realizzata. Non sostituire gli esiti reali con dati dimostrativi e non lasciare schermate o collegamenti fittizi.

      Presentare un'interfaccia essenziale responsive per telefono e desktop: griglia centrale di sei righe e cinque tessere, tastiera QWERTY sottostante, impostazioni, statistiche locali e risultato con azione di condivisione. Collegare l'apertura e il ritorno del giocatore al ripristino della sfida corretta, gli invii alla partita, i cambi di difficoltà e protezione spoiler alle preferenze e la condivisione all'esito concluso. Tutti questi eventi devono avere gli stessi effetti da controlli a schermo e tastiera fisica dove applicabile. Rispettare la divisione delle responsabilità dei Machine delle altre Task, senza un secondo stato indipendente che possa divergere.

      Il calendario usa Europe/Rome e gestisce cambio giorno e ritorno da scheda sospesa: prima chiude l'eventuale partita scaduta e ne registra l'esito una sola volta, poi offre la nuova parola. Una nuova giornata ha una nuova partita; riaprire lo stesso giorno ripristina anche un risultato concluso senza rigiocarlo. Le statistiche, le preferenze future, l'eventuale downgrade e l'idoneità al bonus difficile devono restare coerenti in tutte le viste. Un esito ripristinato permette di nuovo la condivisione soltanto se è una vittoria o sconfitta, non una partita incompleta scaduta.

      Fornire una breve guida in italiano con sei tentativi, colori e doppioni, reset a mezzanotte italiana, tempo dal primo tentativo valido anche a pagina chiusa, limiti dei dati locali e distinzione fra modalità standard e difficile. Il gioco standard blocca anch'esso lettere sicuramente assenti; il difficile aggiunge gli indizi di posizione e molteplicità osservata e un bonus del 10%, perso con downgrade. Il menu spiega che il passaggio standard→difficile non è consentito dopo l'avvio, mentre prima e dopo la partita i cambi sono liberi per la preferenza futura.

      Controlli semantici, nomi accessibili, focus visibile, feedback annunciato per errori ed esito e contrasto sufficiente; il colore non è l'unico indizio accessibile. Rispettare reduced-motion nella rotazione delle tessere senza cambiare regole o tempi. Non intercettare digitazione di altri controlli editabili o scorciatoie con modificatori. Mostrare chiaramente gli eventuali limiti di persistenza; non promettere sincronizzazione o classifica online.

      Il sito è statico e non richiede rete durante una partita dopo il caricamento, né API runtime, login, analytics o font esterni. Supportare Chromium, Firefox e Safari correnti e layout mobili senza rendere obbligatori Web Share o Clipboard per poter giocare. Non introdurre installazione PWA, service worker, nuovi selettori di tema o funzionalità estranee.

      Verifica: aprire la superficie reale a larghezza mobile e desktop, giocare con entrambe le tastiere, osservare animazione e blocchi, riaprire una partita salvata e un risultato concluso, cambiare preferenze nei momenti consentiti, consultare statistiche e raggiungere la condivisione reale. Esercitare ritorno dopo cambio giorno con tempo controllato e verificare accessibilità da tastiera e reduced-motion; riportare i browser effettivamente esercitati e gli eventuali limiti di prova, senza dichiarare copertura non osservata.
  otkav77m:
    title: Preferenze di gioco
    refs:
    - game-preferences
    - requirements/rules#game-preferences
    - requirements/data#game-preferences
    - requirements/ui#game-preferences
    technical: false
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T14:01:39.722Z
    body: |-
      Offrire le preferenze di difficoltà standard e hard e di condivisione spoiler-free. Il valore iniziale è standard; spoiler-free è inizialmente attivo. Persistire entrambe le preferenze tra i giorni, indipendentemente dai risultati immutabili delle partite completate. Rendere le impostazioni comprensibili, spiegando i minimi di occorrenze duplicate osservate in hard, il bonus hard del 10% e la perdita irrevocabile del bonus in caso di downgrade. La condivisione spoiler-free nasconde il feedback del primo tentativo nei contenuti condivisi; si può modificare in qualsiasi momento e influenza solo le condivisioni successive, mai punteggio o risultati precedenti.

      Prima del primo tentativo accettato, consentire il cambio di difficoltà in entrambe le direzioni; un tentativo rifiutato non blocca la scelta. Dopo l’avvio di una partita, consentire hard→standard e impedire standard→hard, disabilitando la scelta vietata e spiegandone il motivo. Il downgrade durante una partita incompleta rimuove le restrizioni hard e revoca definitivamente l’idoneità al bonus di quella partita, insieme all’aggiornamento della preferenza futura. Non ripristinare il bonus se la difficoltà torna hard. Il bonus 1.10 si applica soltanto a una partita iniziata hard e mai degradata; altrimenti il moltiplicatore è 1. Dopo la conclusione della partita, consentire di selezionare entrambe le difficoltà per la partita futura: tale modifica non altera difficoltà, punteggio o statistiche della partita completata. La nuova partita del giorno acquisisce la preferenza allora selezionata.
  ulxkgsya:
    title: Statistiche locali
    refs:
    - statistics
    - requirements/rules#statistics
    - requirements/data#statistics
    - requirements/ui#statistics
    - requirements/quality#statistics
    technical: false
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T14:18:15.371Z
    body: |-
      Conservare sul dispositivo gli esiti delle sfide giornaliere e mostrarne riepilogo e distribuzione: vittorie totali, sconfitte totali, distribuzione delle vittorie ottenute in uno, due, tre, quattro, cinque o sei tentativi e punteggio dell'ultima partita conclusa. Le statistiche sono locali, non una classifica online; non aggiungere classifica per persona, cronologia ordinata o serie di vittorie.

      Registrare gli esiti per data della sfida, oppure ricavare gli aggregati da un registro per data. Ogni esito terminale deve incidere al massimo una volta anche con refresh, riaperture, consegna ripetuta dell'evento o schede concorrenti. Conservare soltanto quanto serve per conteggi, sei fasce di vittoria, ultimo punteggio e ripristino giornaliero; non esporre una cronologia ordinata.

      Una vittoria incrementa una sola volta il totale vittorie e la fascia corrispondente da uno a sei tentativi, e rende il proprio punteggio l'ultimo risultato. Esaurire i tentativi incrementa una sola volta le sconfitte e imposta a zero l'ultimo punteggio. La scadenza di una sfida iniziata conta una sola sconfitta e imposta a zero l'ultimo punteggio; la scadenza di una sfida non iniziata non cambia alcun totale né l'ultimo risultato. I giorni senza partita iniziata non aggiungono vittorie o sconfitte.

      Mostrare etichette chiare per vittorie, sconfitte, distribuzione dei tentativi e punteggio più recente. Rendere correttamente lo stato vuoto e le fasce con conteggio zero, senza suggerire una graduatoria online. Il punteggio più recente è quello dell'ultima partita conclusa, con zero per una sconfitta o una scadenza iniziata.

      I risultati e l'orologio del client sono fidati: non dichiarare che conteggi o tempi siano autorevoli, a prova di manomissione o sincronizzati fra dispositivi. Verificare un solo conteggio dopo reload, consegna ripetuta o schede concorrenti, la collocazione delle vittorie con uno e sei tentativi e la distinzione tra scadenza iniziata e non iniziata.
  ydcx868r:
    title: Condivisione risultati
    refs:
    - result-share
    - requirements/data#result-share
    - requirements/ui#result-share
    - requirements/quality#result-share
    technical: false
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T14:13:20.452Z
    body: |-
      Realizzare una condivisione ripetibile di un risultato vinto o perso, disponibile solo dopo la rivelazione del feedback finale. Preparare una presentazione privata del risultato senza modificare partita, stato, progressi, timestamp, punteggio o totali. La partita completata del giorno corrente, anche se ripristinata alla riapertura, resta condivisibile; le partite incompiute scadute non espongono un'azione di condivisione.

      L'immagine esportata è una scheda PNG dedicata, mai uno screenshot della pagina: mostra titolo, data della sfida, esito, tentativi usati su sei, punteggio e griglia di sei righe per cinque caselle. Le caselle non usate sono neutre. Non esportare lettere, soluzione, tastiera, testo DOM nascosto, testo alternativo contenente tentativi o metadati della soluzione. Costruire sia immagine sia testo da uno snapshot del risultato completato dopo la rivelazione.

      La preferenza spoiler-free è attiva per impostazione predefinita ed è modificabile. Quando attiva, l'intera prima riga è neutra in PNG e testo, senza colori verdi, gialli o grigi che rivelino informazioni; il testo usa segnaposto neutri. Quando disattiva, la prima riga conserva i colori del feedback, ma non le lettere, anche nel testo. Le altre righe presentano i colori del risultato senza lettere.

      Quando il file immagine può essere condiviso nativamente sul dispositivo, offrirlo tramite il pannello di condivisione nativo; verificare effettivamente il supporto alla condivisione di file e conservare l'attivazione dell'utente necessaria all'apertura del pannello, preparando l'immagine prima del gesto quando occorre. Non dichiarare che il risultato è stato consegnato a un destinatario. Se la condivisione immagine non è supportata, usare il testo equivalente negli appunti; se gli appunti non sono disponibili o l'accesso è negato, mostrare lo stesso testo per la copia manuale e indicare in italiano che la copia automatica non è riuscita. Comunicare in italiano successi ed errori significativi.

      La chiusura del pannello nativo è una cancellazione silenziosa: non avvia copia negli appunti né download PNG. Un errore di preparazione, condivisione o copia è distinto dalla cancellazione e dall'indisponibilità del supporto; segnalare l'errore senza alterare il risultato e consentire un nuovo tentativo. Non scaricare automaticamente il PNG come fallback.

      Verificare la reale esportazione ispezionando pixel o contenuto disegnato: nessuna lettera della soluzione o dei tentativi deve comparire e, con spoiler-free attivo, tutte le caselle della prima riga devono essere completamente neutre. Verificare la capacità di condivisione nativa, il fallback testuale, il diniego degli appunti con copia manuale, la cancellazione e gli errori generici; non basta controllare che sia stata chiamata un'API. Osservare il comportamento reale in browser o dispositivo compatibile quando disponibile, documentando i limiti specifici di verifica senza affermare che il risultato sia stato consegnato.
---
# Daily Italian word game

Provides deterministic Rome-date challenges and curated word data; six-guess gameplay with hard mode and scoring; local restoration and cross-tab reconciliation; accessible keyboard input, preferences, local statistics, and result sharing.
