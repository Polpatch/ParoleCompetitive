---
created: 2026-11-08T14:28:47.713Z
updated: 2026-11-09T15:09:54.793Z
summary: Adds the daily Italian word puzzle with local progress, preferences, statistics, and privacy-preserving sharing.
tasks:
- 4hjxvkgi
- 5toibbjj
- mdubca3a
- otkav77m
- ulxkgsya
- ydcx868r
- ocstjfi0
- vluv5p42
- q0nire6e
- t4row6a2
- w14or752
- ne40y158
- ofo3l67b
- z8437g99
- t4w29tdv
- 5bgomc9a
- kfvv2i2f
- vyx88fs9
- a151zx5n
- 62esccbu
- sxn0vqo2
- b81e71gs
- w3fqu4q7
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
  ocstjfi0:
    title: Rivelazione progressiva delle tessere
    refs:
    - daily-game
    - requirements/ui#daily-game
    - requirements/quality#daily-game
    technical: false
    proposal: 5lqatcbt
    label: Rivelazione tessere
    finished: 2026-11-08T19:33:46.994Z
    body: |-
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
  q0nire6e:
    title: Statistiche dopo la sostituzione
    refs:
    - statistics
    - requirements/data#statistics
    - requirements/rules#statistics
    - requirements/quality#statistics
    technical: false
    proposal: lwdla3fv
    label: Vocabolario unico
    finished: 2026-11-08T20:26:19.056Z
    body: |-
      Le statistiche locali riflettono una sola volta ogni esito giornaliero concluso, anche dopo ricariche, riaperture o consegne concorrenti. Una vittoria incrementa le vittorie e il bucket corrispondente al numero di tentativi, da uno a sei; una sconfitta per tentativi esauriti o scadenza dopo l'inizio incrementa le sconfitte. Una partita scaduta prima di iniziare non modifica i conteggi. Sono mostrati vittorie, sconfitte, distribuzione delle vittorie nei sei tentativi e punteggio dell'ultima partita conclusa; una scadenza iniziata ha punteggio zero, mentre in assenza di esiti conclusi è mostrato lo stato senza risultato.

      Quando entra in vigore il nuovo calendario, è ritirato soltanto il contributo della partita del giorno di attivazione che apparteneva al calendario precedente, anche se già conclusa. Il ritiro elimina la relativa vittoria o sconfitta e, per una vittoria, il relativo bucket; non crea un risultato negativo. Le statistiche sono ricalcolate dagli esiti giornalieri superstiti: restano invariati tutti gli altri giorni e le preferenze, e il punteggio più recente torna a quello del più recente esito superstite oppure allo stato senza risultato. Ritiro ripetuto e risultati tardivi o riprodotti della vecchia partita non devono reintrodurre il contributo né alterare il risultato della nuova partita; il suo futuro esito è conteggiato una sola volta. Non sono richiesti classifiche, cronologia ordinata o serie aggiuntive. I risultati locali e l'orologio del dispositivo sono considerati attendibili, senza garanzie di sincronizzazione tra dispositivi o di resistenza a manomissioni.

      La verifica copre conteggio singolo dopo ricarica, consegne ripetute e schede concorrenti; bucket per vittorie in uno e sei tentativi; scadenza iniziata e non iniziata; rimozione di una vittoria col suo bucket e di una sconfitta; ripristino dell'ultimo punteggio precedente o dello stato senza risultato; conservazione degli altri giorni; un solo esito della nuova partita; e inalterabilità dopo ritiro ripetuto o consegna tardiva della vecchia partita.

      ## Code notes
      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/statistics.ts` deriveStatistics(recordsByDate) deriva vittorie, sconfitte, distribuzione a sei bucket e ultimo punteggio dai record datati; seleziona l'ultimo per endedAt, poi data, e restituisce null senza esiti conclusi.
      - `src/session.ts` conserva partite datate; `src/main.ts` mostra statistiche derivate dopo la rivelazione e serializza/riconcilia azioni. Rimuovere il solo record del giorno di attivazione consente alla derivazione esistente di ripristinare conteggi e ultimo punteggio.
      - Esiti vinti usano guesses.length-1 per il bucket; perse e scadute dopo l'inizio sono sconfitte, mentre pronte/in corso/scadute senza inizio non contano. La sostituzione non deve fabbricare una scadenza né azzerare le date superstiti. Il cambio invalida una volta l'identità della vecchia partita; esiti vecchi riprodotti o tardivi non devono sovrascrivere quello nuovo.
  t4row6a2:
    title: Condivisione del risultato sostituito
    refs:
    - result-share
    - requirements/data#result-share
    - requirements/quality#result-share
    - requirements/ui#result-share
    technical: false
    proposal: lwdla3fv
    label: Vocabolario unico
    finished: 2026-11-08T20:27:59.735Z
    body: |-
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
  ne40y158:
    title: Comandi accessibili
    refs:
    - player.SETTINGS_REQUESTED
    - player.GUIDE_REQUESTED
    - player.STATISTICS_REQUESTED
    - player.PANEL_DISMISSED
    - player.APPEARANCE_SELECTED
    - device
    technical: false
    proposal: 46u4qaf5
    label: Interfaccia di gioco
    finished: 2026-11-08T20:35:03.053Z
    body: |-
      Rendere disponibili nell’intestazione, in alto a destra anche su telefono, tre comandi con icona: ingranaggio per Impostazioni, punto interrogativo per Come si gioca e grafico per Statistiche. Ogni comando è un pulsante semantico con nome accessibile italiano e focus visibile; la sua attivazione esprime la corrispondente richiesta del giocatore, senza inviare lettere o tentativi al gioco.

      Il giocatore deve poter richiedere la chiusura della finestra aperta tramite Chiudi, Escape e clic o tocco direttamente sullo sfondo esterno. Interagire con il contenuto interno non equivale a chiuderlo. Queste richieste vengono ricevute dalla navigazione delle finestre, che mantiene una sola finestra e gestisce il ritorno del focus, senza cambiare bozza, tempo o risultato.

      Nelle impostazioni, la selezione di Sistema, Chiaro o Scuro esprime la richiesta di aspetto del giocatore, indipendente da difficoltà e privacy della condivisione. Le variazioni di preferenza chiara/scura del dispositivo sono comunicate al comportamento dell’aspetto: vengono seguite immediatamente soltanto quando è selezionato Sistema, senza trattarle come richieste di apertura o chiusura delle finestre.

      Conservare lingua italiana, titolo ParoleCompetitive, spiegazioni complete delle regole e dei dati locali, feedback accessibili, contrasto e significati dei colori senza usare il solo colore per descrivere le tessere. Non introdurre una modalità separata ad alto contrasto. Verificare sulla superficie reale stretta e desktop l’attivazione con puntatore e tastiera, i nomi dei comandi e l’assenza di input di gioco provocato dai comandi delle finestre.

      ## Code notes
      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/main.ts`: `render()` ricostruisce `app.innerHTML`; gli accordion usano `settingsOpen`, `guideOpen`, `statsOpen` e listener `toggle`. Riutilizzare la delegazione di click/change, sostituendo i trigger `summary` senza mantenere una seconda navigazione.
      - Il ripristino corrente del focus riconosce ID, difficoltà e tasti di gioco, non i summary. Assegnare identità stabili ai nuovi trigger; i tasti del modal non devono raggiungere `input()`.
      - `src/style.css` contiene focus visibile, palette e layout comuni. `e2e/interface.spec.ts` esercita 320/1280 px e un accesso da tastiera basato sul summary, da aggiornare; `e2e/statistics.spec.ts` usa anch’esso gli accordion.
      - L’esplorazione non ha trovato un listener per l’aspetto del dispositivo. Il comportamento dell’aspetto e quello delle finestre sono definiti nelle rispettive Tasks; nessun framework nuovo.
  t4w29tdv:
    title: Aspetto del gioco
    refs:
    - game-appearance
    - requirements/ui#game-appearance
    - requirements/data#game-appearance
    - requirements/quality#game-appearance
    technical: false
    proposal: 46u4qaf5
    label: Interfaccia di gioco
    finished: 2026-11-08T20:44:39.992Z
    body: |-
      L’interfaccia offre nelle impostazioni le scelte Aspetto Sistema, Chiaro e Scuro, identificando chiaramente la preferenza selezionata anche quando Sistema risolve in una delle due palette. Senza una preferenza salvata si applica Sistema. La preferenza scelta viene ricordata sul dispositivo, indipendentemente da difficoltà, scelta spoiler-free e risultati, e ripristinata dopo ricaricamento e nei giorni successivi; si conserva la preferenza Sistema, non il suo colore risolto.

      Con Sistema, il gioco usa l’aspetto chiaro o scuro attuale del dispositivo e applica immediatamente ogni cambiamento del dispositivo. Chiaro e Scuro applicano subito la rispettiva palette e ignorano cambiamenti del dispositivo finché non viene selezionato Sistema. Cambiare aspetto non chiude il pannello aperto, non azzera gioco o punteggio e non modifica inutilmente focus o scorrimento.

      La palette chiara mantiene l’aspetto corrente. La palette scura usa uno sfondo grigio neutro molto scuro e superfici leggermente più chiare. Entrambe mantengono testo leggibile, controlli distinguibili e indicatori di focus visibili, preservano i significati verde/giallo/grigio e le descrizioni delle tessere indipendenti dal colore; non introducono una modalità separata ad alto contrasto. Gli artefatti di condivisione e il gameplay restano invariati.

      L’aggiunta della preferenza non invalida sessioni precedenti altrimenti valide che ne siano prive: tali sessioni vengono trattate come Sistema e mantengono giochi salvati, bozza, difficoltà, preferenza spoiler-free, timestamp, punteggi e statistiche. Se la persistenza non è disponibile, la scelta continua a funzionare in memoria e resta visibile l’avviso italiano esistente sul salvataggio; non si promette il ripristino dopo ricaricamento, non si cancellano dati estranei e resta invariata la gestione esistente delle sessioni malformate per altri dati invalidi.

      Verificare l’interfaccia reale in Sistema, Chiaro e Scuro, compreso un cambiamento del dispositivo mentre il pannello è aperto e le due preferenze manuali; verificare leggibilità di tessere, tasti, controlli disabilitati, focus, finestre e feedback di condivisione in entrambe le palette risolte. Verificare ripristino della preferenza e lettura di una sessione legacy valida senza alterare progressi, punteggi o statistiche; con storage non disponibile, verificare applicazione in memoria e avviso di persistenza.

      ## Code notes

      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/preferences.ts`: `Preferences` e `defaultPreferences`; preferenze indipendenti dalla risoluzione del tema.
      - `src/session.ts`: `SESSION_KEY`, `Session`, `readSession`, `writeSession`; il runtime usa la sessione versionata locale `parolecompetitive:session:v1`, non gli helper standalone. I campi correnti richiesti sono difficoltà e spoiler-free; `readSession` non migra dati, quindi il default legacy è necessario per non rifiutare sessioni valide.
      - `src/main.ts`: rendering e handler preferenze; riutilizzare il percorso esistente di avviso e fallback in memoria su lettura/scrittura fallita.
      - `src/style.css`: palette chiara e superfici fisse, colori semantici delle tessere; riutilizzare i significati e mantenere stati di controllo/focus coerenti nelle palette.
      - `test/session.test.ts` copre persistenza tra reload/giorni e sessioni malformate; `test/preferences.test.ts` riguarda helper standalone, non il percorso runtime.
  vluv5p42:
    title: Finestre e riepilogo
    refs:
    - game-interface
    - requirements/ui#game-interface
    - requirements/ui#game-interface/Statistics open
    - requirements/quality#game-interface
    technical: false
    proposal: 46u4qaf5
    label: Interfaccia di gioco
    finished: 2026-11-08T20:23:53.478Z
    body: |-
      Sostituire le sezioni a fisarmonica con tre pulsanti-icona semantici nell’angolo superiore destro: ingranaggio per Impostazioni, punto interrogativo per Come si gioca e grafico per Statistiche. Fornire nomi accessibili descrittivi in italiano e mantenere tutti i comandi raggiungibili anche su schermi stretti.

      Aprire al massimo una finestra modale centrata per volta, con titolo accessibile, comando Chiudi esplicito, sfondo oscurato e altezza vincolata alla finestra. Il contenuto scorre verticalmente su telefono e desktop; lo sfondo è inerte e non scorre durante l’apertura. Spostare il focus nella finestra e mantenerlo al suo interno; Chiudi, Escape e un clic/tocco direttamente sullo sfondo la chiudono, mentre interagire nel pannello non lo chiude. Le pressioni dei tasti nella finestra non raggiungono il gioco. Alla chiusura manuale ripristinare il focus al relativo comando di apertura; dopo l’apertura automatica del riepilogo, ripristinarlo al comando Statistiche.

      Conservare nelle rispettive finestre la guida completa, le spiegazioni sui dati locali, le regole di difficoltà e i controlli senza spoiler. Le finestre non mettono in pausa il tempo e non alterano bozza, tentativi accettati, punteggio o conteggi; non modificano i blocchi di difficoltà, gli esiti o il conteggio delle statistiche. I cambiamenti delle preferenze e dell’aspetto, la preparazione della condivisione e i normali aggiornamenti di gioco, giorno o archiviazione mantengono la finestra aperta, aggiornata e con focus utilizzabile. Un nuovo caricamento mostra la schermata di gioco senza ripristinare una finestra aperta.

      Usare la stessa finestra Statistiche per apertura manuale e riepilogo automatico. Prima che l’esito odierno sia rivelato mostrare le statistiche e gli stati vuoti esistenti, senza durata del risultato corrente né azione di condivisione. Dopo la rivelazione mostrare anche esito, punteggio e durata fissati per la partita, quindi i totali locali esistenti e la distribuzione delle vittorie da uno a sei tentativi. La durata misura dal primo tentativo accettato a quello terminale, non fino al termine dell’animazione: mostrare m:ss sotto un’ora e h:mm:ss da un’ora, troncando ai secondi interi soltanto per la visualizzazione; una vittoria al primo tentativo mostra 0:00. Non aggiungere orari di inizio/fine né modificare la precisione del punteggio. L’apertura manuale di una partita odierna completata ripristinata mostra lo stesso esito, durata fissa, punteggio, statistiche e condivisione.

      Aprire automaticamente il riepilogo una sola volta dopo che è terminato il feedback finale di una vittoria o sconfitta appena inviata localmente in questa scheda; sostituire immediatamente qualsiasi altra finestra aperta. Non aprirlo per ricaricamento, risultato ripristinato o osservato da un’altra scheda, scadenza del giorno, tentativo non terminale o riepilogo già chiuso. Un’animazione conclusa dopo il cambio di giorno non apre il riepilogo del giorno precedente. Se il giorno cambia mentre Statistiche è aperta, aggiornare la nuova sfida, rimuovere riepilogo e condivisione del risultato precedente e conservare le statistiche aggregate. Il footer della finestra mantiene visibile l’azione Condividi risultato; il contenuto informativo sopra può scorrere senza essere coperto. Integrare le tre righe QWERTY stabili e i tasti d’azione utilizzabili nella superficie effettiva a 320 px e desktop, senza overflow orizzontale; verificare che contenuti lunghi e testo di copia manuale possano essere portati interamente sopra il footer. Aggiornare i flussi smoke browser esistenti per i comandi a icona e la condivisione disponibile solo nel footer modale. Aggiornare documentazione utente e registro delle modifiche in inglese descrivendo scelte di aspetto consegnate, comportamento delle finestre, durata finale e punto d’accesso alla condivisione, e riportare fedelmente le verifiche effettivamente eseguite.

      Se una sostituzione del vocabolario ritira la sfida mentre una finestra è aperta, mantenerla aperta con focus utilizzabile e contenuti aggiornati. In Statistiche rimuovere esito, durata, punteggio, azione di condivisione, testo manuale e feedback di condivisione della sfida ritirata; ricalcolare i conteggi dai soli esiti rimasti. Applicare la stessa rimozione quando il ritiro viene scoperto dopo il giorno di attivazione, senza inventare una partita sostitutiva per quel giorno passato. Una rivelazione tardiva della sfida ritirata non apre né ripopola il riepilogo, neppure se la data coincide; solo la nuova sfida può produrre il proprio riepilogo dopo una vittoria o sconfitta inviata localmente e rivelata. Verificare la sostituzione durante una rivelazione e con Statistiche già aperta, anche con movimento ridotto, senza azzerare gli altri esiti o le preferenze.

      ## Code notes
      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/main.ts`: `render()` e i flag `settingsOpen`/`statsOpen`/`guideOpen` oggi alimentano sezioni `details`; i listener ne gestiscono l’apertura. `perform()`, `beforeReveal`, `revealRow`, `revealing` e callback di rivelazione governano il feedback terminale; esiti e timestamp sono fissati prima della rivelazione. Il callback verifica già il giorno corrente per il messaggio di esito. Gli snapshot ignorano la rivelazione; le statistiche usano `beforeReveal` mentre è in corso.
      - `refreshShare()` prepara lo snapshot dopo la rivelazione con controllo di versione; oggi azione e textarea di copia manuale sono sulla pagina di gioco. La delega dei clic aggiorna messaggio e testo manuale. `focusSelector` ripristina focus per ID, difficoltà e pulsanti di gioco, non per i riepiloghi; `render()` ricrea `app.innerHTML`, quindi preservare focus/stato della finestra e attivazione nativa della condivisione richiede attenzione.
      - `src/style.css`: sezioni/dettagli e tastiera centrata a flex-wrap; riusare il comportamento responsive esistente tenendo conto che la tastiera è oggi una sequenza QWERTY piatta.
      - `e2e/interface.spec.ts` copre superfici 320px/1280px e test tastiera basati sul riepilogo; `e2e/statistics.spec.ts` usa un helper di apertura basato su `details` e verifica i conteggi degli esiti. Aggiornare questi flussi ai trigger modali senza duplicare il conteggio.
  w14or752:
    title: Tastiera e rivelazione
    refs:
    - daily-game.RESULT_REVEALED
    - requirements/ui#daily-game
    technical: false
    proposal: 46u4qaf5
    label: Interfaccia di gioco
    finished: 2026-11-08T20:29:14.466Z
    body: |-
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
  5bgomc9a:
    title: Preferenze autocomplete
    refs:
    - game-preferences
    - requirements/data#game-preferences
    - requirements/rules#game-preferences
    - requirements/quality#game-preferences
    technical: false
    proposal: ene7fbh4
    label: Autocomplete
    finished: 2026-11-08T20:47:55.499Z
    body: |-
      L'autocomplete è disattivato per impostazione predefinita e la preferenza resta salvata tra giorni. La scelta futura dell'autocomplete è indipendente dalla difficoltà e dai risultati già conclusi.

      Prima del primo tentativo accettato, cambiare autocomplete aggiorna insieme la scelta della partita corrente e quella per le partite future, senza modificare le lettere digitate nella bozza. I tentativi rifiutati non avviano la partita e non bloccano il cambiamento. Dopo il primo tentativo accettato, finché la partita è in corso, un cambiamento è rifiutato e lascia invariate sia la scelta corrente sia quella futura. Dopo la conclusione, un cambiamento modifica soltanto la preferenza futura; non altera la partita conclusa, il suo punteggio o le statistiche.

      Ogni nuova partita adotta la preferenza futura corrente, inclusa una sfida sostitutiva nello stesso giorno. Riaprire una partita esistente conserva la sua scelta, distinta da quella futura. La sostituzione non trasferisce la scelta bloccata della sfida ritirata né azzera la preferenza conservata. Le preferenze sono conservate insieme alla sessione di gioco e riconciliate mediante lo stesso percorso serializzato tra schede, non tramite un archivio separato. La qualità è verificata per cambiamenti prima del gioco, dopo invii rifiutati, durante una partita iniziata ma non conclusa e dopo la conclusione; si verifica inoltre che rifiuti, riapertura, giorno successivo, sostituzione e riconciliazione tra schede mantengano le scelte rispettive.

      ## Code notes
      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/preferences.ts`: `Preferences` e valori predefiniti/validazione; estendere il contratto delle preferenze.
      - `src/session.ts`: sessione che include preferenze e partite datate; mantenere i risultati conclusi immutabili.
      - `src/main.ts`: impostazioni instradate tramite enqueue/perform/writeSession serializzati; riutilizzare questo percorso, senza API di salvataggio separata. `selectDifficulty` è il modello per le transizioni di preferenza.
      - Test esistenti in `test/preferences.test.ts`, `test/session.test.ts` e `e2e/interface.spec.ts` coprono transizioni, ricaricamento e impostazioni.
  ofo3l67b:
    title: Bozze con lettere fisse
    refs:
    - daily-game
    - requirements/data#daily-game
    - requirements/rules#daily-game
    - requirements/ui#daily-game
    - requirements/quality#daily-game
    technical: false
    proposal: ene7fbh4
    label: Autocomplete
    finished: 2026-11-08T20:39:20.083Z
    body: |-
      Ogni nuova sfida acquisisce la preferenza Autocomplete corrente, inizialmente spenta in assenza di una scelta conservata. Prima del primo tentativo accettato la modalità della partita può cambiare senza modificare la bozza manuale; il primo tentativo accettato la blocca. Invii rifiutati non la bloccano. Durante una partita iniziata e incompleta la scelta non cambia; dopo la conclusione una modifica alla preferenza futura non cambia modalità o punteggio della partita conclusa.

      Con Autocomplete attivo la prima bozza non contiene lettere automatiche. Dopo un tentativo accettato errato con possibilità residue, soltanto alla fine dell'intera rivelazione la nuova bozza contiene tutte le lettere verdi già scoperte in qualunque tentativo accettato, nelle rispettive posizioni. Le occorrenze duplicate sono distinte per posizione. Nessuna lettera gialla, occorrenza non dimostrata o informazione della soluzione nascosta viene precompilata. Le verdi sono fisse: non si cancellano e non si sovrascrivono.

      Digitazione e cancellazione da tastiera fisica e sullo schermo saltano le fisse. Le lettere manuali occupano i vuoti da sinistra; cancella elimina la lettera manuale più a destra e riporta il cursore a quella casella. Senza lettere manuali cancella non cambia nulla; una bozza completa non accetta altre lettere. Non introdurre selezione manuale delle caselle. Un vuoto rende incompleto l'invio; la parola completa è composta dalle cinque posizioni in ordine, comprese le fisse. Il rifiuto conserva bozza e posizioni fisse senza consumare tentativi o avviare il tempo. Restano applicabili dizionario, lettere assenti, duplicati, regole hard, sei tentativi e vittoria al sesto. Con Autocomplete spento resta invariato il comportamento precedente.

      La modalità attiva al primo tentativo accettato applica ×0,98 anche a una vittoria al primo tentativo o senza precedenti verdi utilizzabili. Toggle e rifiuti precedenti non fanno maturare il fattore. Moltiplicare il punteggio grezzo esistente per l'eventuale bonus hard ×1,10 e per il fattore Autocomplete prima di un unico arrotondamento finale: hard idoneo con Autocomplete vale ×1,078; dopo un declassamento hard resta solo ×0,98. Sconfitte e scadenze valgono zero. Risultati conclusi, statistiche e condivisione usano il punteggio già fissato, senza nuovi ricalcoli dovuti alle preferenze.

      Conservare la registrazione coerente di tentativo ed eventuale risultato prima dell'animazione, i tempi fissati all'invio e il blocco dell'input per tutta la rivelazione. Non esporre nuove fisse nella riga successiva prima del termine completo; la riga diventa modificabile insieme agli aggiornamenti già previsti di tastiera, statistiche, risultato e condivisione. Nella bozza le fisse appaiono verdi e la descrizione accessibile ne indica lettera, posizione, correttezza e stato fisso; le altre caselle restano neutre. La riga inviata mantiene la rivelazione esistente, anche per lettere prima fisse. Movimento ridotto mantiene l'ordine senza attese. Nessuna nuova bozza giocabile dopo vittoria, sconfitta o scadenza; nessuna compilazione automatica invia tentativi o modifica i tempi.

      Conservare localmente la scelta della singola partita separata dalla preferenza futura e una bozza di cinque posizioni che mantenga esattamente vuoti, fisse e lettere manuali. Ricavare le fisse dai feedback accettati. Il ripristino ricostruisce la prossima posizione modificabile e la bozza già iniziata senza ripetere rivelazioni, aggiungere tentativi o cambiare tempi e punteggi; se la chiusura avviene durante la rivelazione, ripristina il tentativo registrato e la successiva bozza quando ancora giocabile. Mantenere serializzazione, riconciliazione fra schede ed esiti conteggiati una volta sola.

      I salvataggi validi precedenti senza informazioni Autocomplete restano leggibili come modalità spenta: conservare progressi, bozze manuali, tempi, risultati, punteggi e statistiche; non applicare loro una nuova preferenza futura. Resta obbligatorio il ritiro della sola sfida superata nel giorno di attivazione del nuovo vocabolario: la compatibilità con i vecchi salvataggi non la preserva. Mantenere gli avvisi e la sessione in memoria previsti quando la persistenza non è utilizzabile, senza cancellare dati estranei o dichiarare salvataggi riusciti.

      Conservare il vocabolario canonico e il calendario congelato correnti, inclusa l'ammissione ordinaria di AUDIO e OZONO e i controlli sulle lettere note. Al ritiro di una sfida eliminare anche le sue verdi fisse e le lettere manuali; nessuna rivelazione tardiva deve compilare la bozza della sostitutiva. La nuova sfida nello stesso giorno acquisisce la preferenza futura conservata, con sei tentativi e nessuna conoscenza ereditata. Riaperture e riconciliazioni ripetute non azzerano la scelta o la bozza della sostitutiva. Verificare sostituzione durante una rivelazione Autocomplete e con bozza parzialmente compilata, preservando le altre date e i risultati sopravvissuti.

      Conservare il riepilogo automatico soltanto dopo la rivelazione finale locale della sfida corrente, mai per un risultato ripristinato, osservato da un'altra scheda, scaduto o ritirato. Nessuna nuova bozza dopo il ritiro; la sostitutiva ha una bozza propria. Non inviare input di gioco con una finestra modale aperta. Le fisse restano leggibili e accessibili in entrambe le apparenze. Documentare la modalità Autocomplete, il blocco della scelta e il fattore di punteggio nel README e nel changelog in inglese.

      Verificare verdi non contigue, duplicate e accumulate; impossibilità di modificarle o cancellarle; completezza con vuoti; rifiuti senza alterazioni; input fisico e sullo schermo; modalità spenta e compatibilità hard. Coprire ×0,98 al primo tentativo e senza aiuto effettivo, ×1,078 con hard idoneo, declassamento e zeri terminali, con casi che distinguano arrotondamento unico da intermedi. Sulla superficie reale verificare comparsa e accessibilità delle fisse soltanto al termine della rivelazione, salto delle posizioni, movimento ridotto, blocco terminale e ricarica della bozza parziale; verificare inoltre ripristino dei vecchi salvataggi, cambio del giorno e riconciliazione fra schede senza esiti duplicati. Conservare la verifica delle regole preesistenti senza introdurre telemetria o meccanismi anti-manomissione.

      ## Code notes
      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/game.ts`: `Game`, `setDraft`, `submitGuess`, `scoreGame`; pure rules, current append/delete-last draft string, reset on acceptance, hard multiplier before one rounding. Positional gaps must not change submitted word order.
      - `src/session.ts`: `changeDraft`, `playGuess`, `reconcile`; `src/main.ts`: `input`, `perform`, `render`, serialized reconciliation/write before reveal. Reuse this commit path; do not derive durable state from animation. Rendering masks feedback until midpoint and locks input/outcomes until completion.
      - `src/persisted-game.ts`: `validatePersistedGame` recalculates won scores with `scoreGame`; absent old mode must mean disabled. Keep session validators backward-compatible.
      - Existing coverage: `test/game.test.ts`, `test/persisted-game.test.ts`, `test/session.test.ts`, `e2e/interface.spec.ts`, `e2e/statistics.spec.ts`. `src/share.ts` and `src/statistics.ts` already consume committed scores; no extra share format or statistics fields.
  z8437g99:
    title: Controllo autocomplete
    refs:
    - player.AUTOCOMPLETE_SELECTED
    - requirements/ui#game-preferences
    technical: false
    proposal: ene7fbh4
    label: Autocomplete
    finished: 2026-11-08T20:40:56.320Z
    body: |-
      Nella finestra modale delle impostazioni deve comparire un controllo accessibile denominato Autocomplete, inizialmente spento, che consente al giocatore di scegliere l'inserimento automatico delle lettere già trovate nella posizione corretta. Mostrare la preferenza conservata sul dispositivo, indipendentemente dalla difficoltà e dalla privacy di condivisione.

      Prima del primo tentativo accettato, il controllo permette di accendere o spegnere la modalità per la partita corrente e per quelle future, senza cancellare lettere manuali già digitate. Un invio rifiutato non blocca questa scelta. Dopo il primo tentativo accettato e fino alla conclusione, disabilitare il controllo con una spiegazione accessibile: non è consentito cambiare né la modalità corrente né la preferenza futura. A partita conclusa riabilitarlo, spiegando che modifica soltanto la preferenza delle partite future, mai il risultato, il punteggio o la modalità della partita appena conclusa.

      La spiegazione in italiano deve indicare che tutte le verdi già scoperte vengono riprese nel tentativo successivo dopo la rivelazione completa; sono fisse, non cancellabili né sovrascrivibili, e digitazione e cancella le saltano compilando soltanto i vuoti in ordine. Deve indicare il fattore ×0,98, applicabile già dal primo tentativo accettato con la modalità attiva anche senza lettere precompilate, e il cumulo con l'eventuale bonus hard ×1,10 prima di un unico arrotondamento finale.

      Conservare gli altri controlli e le loro spiegazioni: hard con minimo delle ripetizioni osservate, bonus del 10% e sua perdita al declassamento; passaggio standard→hard bloccato soltanto durante una partita iniziata e incompleta; privacy di condivisione sempre modificabile. Verificare il controllo Autocomplete sulla superficie reale con tastiera e descrizione del blocco, prima dell'inizio, dopo un rifiuto e dopo la conclusione.

      Conservare il controllo Aspetto con Sistema, Chiaro e Scuro e i tre pulsanti di apertura delle finestre modali. Cambiare Autocomplete mantiene aperte le impostazioni e conserva focus e scorrimento utilizzabili; gli eventi della finestra non devono compilare la bozza dietro di essa. Verificare il controllo e la spiegazione in entrambe le apparenze e a 320 px senza alterare le tre righe della tastiera, il riepilogo finale o la condivisione esclusivamente nella finestra delle statistiche.

      ## Code notes
      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/main.ts`: settings in `render()`; settings `change` handler; `enqueue`/`perform` serialize actions, reconcile sessions and persist through `writeSession`. Reuse this path for the new player choice rather than a parallel settings store.
      - `src/preferences.ts`: `Preferences`, defaults and validation; `src/session.ts`: embedded session preferences and difficulty-selection pattern. Coordinate the control with the preference lifecycle Task.
      - `test/preferences.test.ts`, `test/session.test.ts` and `e2e/interface.spec.ts` already exercise preference transitions and real settings restoration. The standalone `savePreferences`/`loadPreferences` API is not the UI's persistence path.
  62esccbu:
    title: Vocabolario e calendario
    refs:
    - daily-word
    - requirements/data#daily-word
    - requirements/rules#daily-word
    - requirements/quality#daily-word
    technical: false
    proposal: lwdla3fv
    label: Vocabolario unico
    finished: 2026-11-08T21:18:00.446Z
    body: |-
      Il vocabolario canonico è l'unione delle fonti comuni e da 60.000 parole già presenti, della lista italiana da circa 660.000 parole di napolux/paroleitaliane fissata alla revisione `2951524b6d5b67986f542937cef16a54af63ff84` e delle aggiunte locali documentate e revisionate. Include AUDIO e OZONO e ogni parola già ammessa come tentativo. La normalizzazione conserva solo voci di esattamente cinque lettere ASCII in maiuscolo, deduplicate e ordinate in modo riproducibile; non elimina accenti, traslittera né introduce eccezioni legate all'input. Le aggiunte hanno provenienza e decisioni editoriali registrate.

      La lista non è ufficiale, autorevole, esaustiva né garantita legalmente; resta esplicita l'incertezza di provenienza presente a monte. Non si importano liste dedicate di nomi propri, il dataset separato di coniugazioni con licenza CC-BY-SA, né aggregati che includano tali dataset sotto una dichiarazione di sola licenza MIT. Si registrano percorsi esatti delle fonti, data di acquisizione, checksum, trasformazioni e attribuzione MIT pertinente. Non si copiano codice, grafica o calendario del gioco non ufficiale Par🇮🇹le.

      Il vocabolario canonico è esattamente sia l'insieme dei tentativi ammessi sia quello delle soluzioni eleggibili per il nuovo calendario: non resta attivo un sottoinsieme ridotto di soluzioni comuni. Sono ammesse forme flesse italiane, parole rare, prestiti d'uso italiano e termini volgari o offensivi. Si escludono voci malformate, non italiane ed esclusivamente nomi propri; un significato italiano normale basta anche se la voce è usata anche come nome, e la sola maiuscola iniziale non prova che sia un nome proprio.

      Per il nuovo calendario si genera e si congela una permutazione deterministica che contiene ogni voce canonica esattamente una volta. Sono registrati identità della pianificazione, algoritmo, seme fisso, impronta riproducibile dell'output e data di attivazione esplicita in Europe/Rome. A runtime sono inclusi soltanto vocabolario normalizzato e pianificazione congelata; snapshot originali, aggiunte e provenienza, istruzioni di generazione e ordine storico delle soluzioni v1 restano nel repository. Il gioco caricato non richiede fetch delle fonti né rete.

      Il giorno è la data del calendario gregoriano in Europe/Rome, indipendente dal fuso scelto sul dispositivo e rispettosa dell'ora legale; a parità di data e pianificazione distribuita, tutti ricevono la stessa parola. Dalla data esplicita di attivazione in poi, la parola è selezionata all'offset non negativo di giorni Rome dall'attivazione, modulo la lunghezza della permutazione congelata. La permutazione attraversa l'intero insieme comune prima di ricominciare. Nessuna selezione casuale o ricalcolo di data o seme avviene all'apertura, al refresh o alla ricostruzione. Non si usa un feed runtime, scraping o API, né si dichiara affiliazione ufficiale con Wordle.

      La data di attivazione è la data Europe/Rome esplicitamente fissata per il rilascio che introduce la nuova pianificazione, mai una data ricalcolata a ogni apertura o ricostruzione. Per le date anteriori restano identici epoch, algoritmo, ordine, identità e assegnazioni v1: modificare lunghezza o ordine v1 non deve spostarne le parole. Nel giorno di attivazione la nuova pianificazione sostituisce la sfida precedente per tutti, anche per chi l'ha già completata; si ritirano soltanto progresso e risultato di quella sfida, senza conteggiarla come sconfitta, e si offre una sola nuova partita vuota. Date anteriori e preferenze restano invariate. Riapplicare la sostituzione non ritira né azzera progresso o risultato della nuova sfida.

      Alla riapertura dopo assenza, al ritorno di visibilità e al confine giornaliero mentre l'app è visibile, la riconciliazione applica ogni sostituzione di calendario ancora dovuta prima della normale scadenza. Anche dopo più giorni di assenza non inventa partite per i giorni intermedi: scadono le altre partite precedenti ancora incomplete e viene mostrata la sfida corrente. Le future modifiche di calendario conservano le assegnazioni di questo rilascio e richiedono una propria data di attivazione esplicita concordata.

      La verifica dimostra determinismo per la stessa data Rome, al cambio di mezzanotte e nei due cambi di ora legale, al ritorno dopo un confine mancato e attraverso ricostruzioni che devono conservare la parola pubblicata. Usa il vocabolario reale incluso: `AUDIO` e `OZONO` sono valide sia come tentativi sia come soluzioni, così come esempi rappresentativi di forme flesse, prestiti e termini rari delle fonti scelte. Verifica che la permutazione congelata coincida esattamente con il canonico, senza omissioni, duplicati o candidati extra, e che generazione da input fissati e seme fisso sia riproducibile. Verifica assegnazioni storiche v1 prima dell'attivazione, voce del giorno di attivazione e date successive; verifica inoltre persistenza delle date precedenti, preferenze, progresso e risultati non interessati, e idempotenza della sostituzione anche dopo un confine mancato. La fonte ampia non diventa un payload runtime integrale non filtrato e nessun accesso runtime richiede rete.

      ## Code notes

      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/daily-word.ts` importa `allowedWords` e `solutionsV1`: i tentativi sono un `Set`, mentre la selezione giornaliera indicizza la lista v1 congelata con epoch `2026-01-01`.
      - `scripts/generate-words.mjs` legge le fonti comuni e da 60k e `data/solutions-v1.txt`; `normalize` filtra esattamente cinque lettere ASCII, converte in maiuscolo, deduplica e ordina. `src/word-data.ts` è generato, non modificato a mano.
      - `data/README.md` registra revisione, trasformazioni, caveat di licenza e calendario v1 immutabile. Cambiarne lunghezza o ordine sposta le assegnazioni: conservarlo per le date precedenti al taglio.
      - `tests/daily-word.test.ts` verifica forma/inclusione e rigenerazione, ma non casi del vocabolario reale; i test sintetici non rilevano omissioni di `AUDIO` e `OZONO`.
      - La revisione upstream fissata contiene `paroleitaliane/660000_parole_italiane.txt` (blob `4d8dfa693a1c61d11987bbf28929558cc945418f`); le voci grezze non sono state ispezionate. Escludere `coniugazione_verbi.txt`, separatamente licenziato. Le fonti presenti omettono AUDIO e OZONO; la normalizzazione le accetterebbe se incluse.
  kfvv2i2f:
    title: Sostituzione della partita
    refs:
    - daily-game
    - requirements/data#daily-game
    - requirements/rules#daily-game
    - requirements/quality#daily-game
    - requirements/ui#daily-game
    technical: false
    proposal: lwdla3fv
    label: Vocabolario unico
    finished: 2026-11-08T21:15:02.237Z
    body: |-
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
  vyx88fs9:
    title: Condivisione nella finestra
    refs:
    - result-share
    - requirements/ui#result-share
    technical: false
    proposal: 46u4qaf5
    label: Interfaccia di gioco
    finished: 2026-11-08T21:13:31.816Z
    body: |-
      L’unica azione «Condividi risultato» è nel footer della finestra statistiche/risultato ed è disponibile soltanto per la partita odierna vinta o persa dopo la rivelazione finale. Non compare durante una partita incompleta né dopo la scadenza o il cambio di giornata. Rimuovere l’azione duplicata dalla pagina di gioco.

      Il footer resta visibile fuori dall’area informativa scorrevole e dispone di spazio riservato pari alla propria altezza: anche l’ultimo elemento e il testo copiabile manualmente possono scorrere completamente sopra il footer, senza essere coperti. Preparazione, esito e feedback di copia manuale restano nella finestra; il testo manuale è selezionabile e raggiungibile da tastiera e touch. Il controllo offre feedback accessibile in italiano per successo, errore e copia manuale; l’annullamento della condivisione nativa è silenzioso.

      La condivisione usa uno snapshot privato del risultato rivelato: titolo, data della sfida, esito, tentativi accettati su sei, punteggio e griglia di sei righe per cinque celle; celle inutilizzate neutre. Non include lettere, soluzione, tastiera, contenuto DOM nascosto, testo alternativo con tentativi o metadati della soluzione. Con la modalità spoiler-free disattivata resta la prima riga a colori ma senza lettere; con la modalità spoiler-free attivata l’intera prima riga è neutra. La stessa privacy vale per il testo alternativo, che usa segnaposto neutri nella prima riga quando la modalità spoiler-free è attiva. Le modifiche di aspetto dell’applicazione cambiano solo il controllo visibile, mai immagine o testo esportati.

      Mantenere disponibilità e ripristino del risultato odierno, rilevamento delle capacità, preparazione, attivazione nativa tramite gesto dell’utente, tentativi ripetibili e alternative di testo esistenti. L’annullamento non copia né scarica; un errore consente un nuovo tentativo; se la copia automatica non è disponibile, esporre il medesimo testo privato per la copia manuale. Non scaricare automaticamente PNG e non modificare partita, tempi, punteggio o totali.

      Conservare le verifiche di qualità: coprire immagine nativa, fallback testuale, diniego degli appunti/copia manuale, annullamento ed errore generico; ispezionare contenuto o pixel effettivamente esportati per escludere lettere e verificare la prima riga neutra con modalità spoiler-free attiva. Non considerare sufficiente la sola chiamata a un’API. Verificare il gesto utente nativo e, dove disponibile, il comportamento reale su browser/dispositivo; dichiarare i limiti specifici senza affermare consegne. Descrivere accuratamente i test automatici disponibili, senza attribuire loro copertura pixel o retry della preparazione se assente.

      Conservare il ritiro dei risultati sostituiti anche nella nuova finestra: disponibilità, immagine preparata, testo manuale e messaggi appartengono alla sfida corrente, non soltanto alla sua data. Una sostituzione disabilita e rimuove la presentazione della vecchia sfida; preparazioni o completamenti tardivi non la riattivano e non avviano fallback. La nuova sfida rende disponibile la condivisione solo dopo la propria vittoria o sconfitta rivelata. La finestra resta aperta e utilizzabile durante l'aggiornamento; gli esiti degli altri giorni e la preferenza spoiler-free restano validi. Non dichiarare revocabili copie o condivisioni già consegnate all'esterno.

      ## Code notes

      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      `src/main.ts`: `refreshShare()` prepara lo snapshot dopo la rivelazione con guardia di versione; il rendering colloca attualmente azione e textarea nella pagina di gioco, e la delega ai clic avvia la condivisione o riprova la preparazione aggiornando messaggio/testo. Il rerender ricostruisce `app.innerHTML`; preservare apertura e focus della finestra e l’attivazione nativa richiede attenzione. Le statistiche durante la rivelazione derivano da `beforeReveal`. `src/style.css` contiene gli stili dei dettagli attuali. `e2e/statistics.spec.ts` usa helper di apertura basati sui dettagli; `e2e/interface.spec.ts` copre layout a 320/1280 px e tastiera basata sul riepilogo. README e `package.json` descrivono comandi e script esistenti.
  a151zx5n:
    title: 'Fix the code: Data di rilascio non fissata'
    refs:
    - requirements/data#daily-word
    technical: true
    finished: 2026-11-08T21:12:55.934Z
    body: |-
      ## What happens

      La pianificazione in preparazione usa una data di attivazione provvisoria non collegata a una data di pubblicazione concordata. Il repository e il Task non identificano il giorno del rilascio che introduce la nuova pianificazione.

      ## What should happen

      La nuova pianificazione deve attivarsi nella data Europe/Rome esplicitamente fissata per il rilascio che la introduce. Senza una data di rilascio concordata non è possibile fissare responsabilmente le assegnazioni e il giorno del ritiro della sfida precedente.

      ## Chosen option

      ### Concordare il giorno di rilascio

      Fissare una data Rome futura per il rilascio e pubblicare la pianificazione quel giorno; incorporare la stessa data come attivazione prima della pubblicazione. Le assegnazioni diventano definitive per quel giorno.

      ## Where in the code

      src/daily-word.ts, ACTIVATION_DATE e wordForDate; data/README.md, Schedule v2.
  sxn0vqo2:
    title: Selezione giornaliera
    refs:
    - daily-word
    - requirements/data#daily-word
    - requirements/rules#daily-word
    - requirements/quality#daily-word
    - requirements/ui#daily-word
    technical: false
    proposal: st31jv5v
    label: Selezione segreta
    finished: 2026-11-09T08:13:39.302Z
    body: |-
      Acquisire la selezione pubblicata per il giorno corrente nel calendario gregoriano Europe/Rome e attivare una sfida soltanto quando la selezione è valida, compatibile e riferita alla richiesta ancora corrente. Le date precedenti al 2026-11-08 mantengono l’assegnazione v1; la selezione segreta inizia il 2026-11-08 al rilascio autorizzato dell’implementazione, senza dipendere dalla data di build o di apertura. Il successivo 2026-11-09 non avvia alcuna migrazione.

      Conservare invariato l’esatto vocabolario canonico di 7.679 parole, sia per i tentativi sia per le soluzioni: l’unione delle fonti comuni e da 60k già adottate e della fonte italiana completa già fissata, con aggiunte locali documentate e revisionate, inclusi AUDIO e OZONO. Conservare ogni tentativo precedentemente ammesso; mantenere solo parole italiane di esattamente cinque lettere ASCII maiuscole, deduplicare e ordinare senza regole dipendenti dalla lingua. Non rimuovere accenti tramite traslitterazione né creare eccezioni per l’input. Ammettere inflessioni, prestiti in uso italiano, parole rare e termini volgari o offensivi sia come tentativi sia come soluzioni; escludere voci malformate, non italiane ed esclusivamente nomi propri, senza usare la sola maiuscola iniziale come prova. Conservare provenienza, attribuzione e decisioni editoriali già documentate, l’avvertenza sulla provenienza a monte ignota e l’assenza di garanzie ufficiali o legali. Non importare liste dedicate di nomi propri, coniugazioni con licenza separata o aggregati sotto un’attribuzione MIT impropria; non copiare codice, arte o calendario di altri giochi.

      Identificare il vocabolario indipendentemente dall’ordine di selezione con SHA-256 esadecimale minuscolo dei termini maiuscoli ordinati e codificati UTF-8, uno per riga con LF anche dopo l’ultima parola. Generazione e validazione client devono condividere identità e ordine esatti. Pubblicare un record di schema 1 composto soltanto da schema, data, identità del vocabolario, identità della sfida e indice. La data deve essere una data reale canonica `YYYY-MM-DD` di Roma; l’indice è intero nell’intervallo ammesso e l’identità della sfida deve corrispondere a `hmac-v1:<date>:<vocabularyId>`. Validare tutti i campi e la loro coerenza prima di adottare il record. Nessun dato assente, errato o incompatibile può ricadere sulla selezione pubblica o su un’estrazione locale; nessuna sequenza segreta post-attivazione, seme o equivalente va inclusa nel client. Non scaricare fonti durante il gioco.

      Eliminare il calendario pubblico v2 attivo per il futuro, la sua generazione e il suo utilizzo nel gioco. Conservare soltanto la compatibilità storica v1 delle date precedenti all’attivazione e le fonti canoniche: nessun secondo percorso pubblico deve selezionare soluzioni dal giorno di passaggio.

      Acquisire una volta all’apertura, al ritorno della scheda visibile, al confine giornaliero visibile o su richiesta esplicita di Riprova, salvo che l’assegnazione valida di oggi sia già trattenuta. Trigger concorrenti possono condividere una sola acquisizione; nessun retry temporizzato, backoff, polling o fetch ripetuto automatico. Riprova avvia una sola acquisizione e click duplicati durante il caricamento non producono richieste parallele o giochi duplicati. Ricontrollare giorno e identità della richiesta al completamento: risultati tardivi o superati non attivano giorni passati né sovrascrivono richieste più recenti. Non sostituire mai un’assegnazione valida già trattenuta con una risposta conflittuale dello stesso giorno.

      Trattenere il record validato insieme alla partita nel meccanismo di sessione versionato esistente, condiviso con la partita giornaliera: non introdurre uno store separato. Per ripristinare la soluzione e validare la partita salvata dello stesso giorno non servono segreti o rete. Una selezione valida già acquisita resta giocabile offline fino alla fine del giorno romano; dopo mezzanotte non autorizza più la partita. Non è garantito l’avvio offline a freddo, né la selezione di giorni futuri non pubblicati. Dati incompatibili non cancellano partite o preferenze salvate; client statici precedenti in cache non sono revocabili e possono continuare il vecchio calendario, fuori dalla garanzia di sfida comune. Spiegare tali limiti nella guida.

      Al primo riconcilio, prima della scadenza ordinaria, ritirare una sola volta esclusivamente la sfida pubblica superata del 2026-11-08, con bozza, tentativi e risultato anche se vinta, persa, scaduta o scoperta più tardi. Il ritiro non è una sconfitta; conservare giorni anteriori e preferenze. Se l’8 novembre è il giorno corrente, offrire la nuova partita HMAC distinta solo dopo aver acquisito una selezione valida; se la scoperta è tardiva, ritirare il solo record di quel giorno senza creare una partita passata né una sconfitta. Ripetizioni, reload, ricostruzioni e schede concorrenti non ripetono il ritiro né resettano la partita HMAC. Il giorno seguente non provoca una seconda migrazione. Eseguire il riconcilio pendente prima della scadenza ordinaria all’apertura, al ritorno visibile e al confine visibile di Roma; scadere le partite incompiute al loro effettivo confine anche se i dati odierni mancano. Non inventare partite o sconfitte per giorni non giocati.

      Finché manca una selezione valida di oggi, lasciare la sfida indisponibile: nessuna partita attiva, bozza, tentativo, durata di soluzione, scelta per-partita bloccata, punteggio o risultato. Mostrare la normale griglia vuota neutra 6×5 e tastiera a tre righe disabilitata, bloccando input fisico e su schermo senza mostrare lettere, feedback o risultati di ieri. Presentare stati accessibili in italiano per caricamento e indisponibilità; il fallimento non deve suggerire sconfitta o salvataggio riuscito. Dopo il fallimento mostrare “Riprova”, disabilitato durante l’acquisizione; per schema o vocabolario incompatibile spiegare che occorre aggiornare il gioco e offrire “Ricarica pagina” oltre al tentativo deliberato, senza cancellare dati. Per una data obsoleta spiegare che la pubblicazione di oggi non è disponibile, senza rinominare il dato come odierno.

      Durante caricamento e indisponibilità restano utilizzabili azioni d’intestazione, impostazioni, aspetto, guida e statistiche storiche. Mantenere aperta una finestra già aperta, con focus e scorrimento utilizzabili; lo stato di caricamento non sposta il focus. Non mostrare durata o riepilogo del risultato corrente, recap automatico o azione di condivisione senza risultato rivelato di oggi; mantenere statistiche aggregate storiche, includendo scadenza o ritiro applicati correttamente. Dopo acquisizione valida, avviare una sola partita nuova oppure ripristinare la partita e il risultato dello stesso giorno senza azzerare progressi, scelta di completamento automatico, ripetere rivelazioni o duplicare risultati. Per il ritiro dell’8 novembre, informare in italiano che sfida e risultato di quel giorno sono stati sostituiti, che risultati precedenti e impostazioni sono conservati e che la nuova partita attende la pubblicazione se necessario; una scoperta tardiva identifica il giorno ritirato senza creare una partita passata. Non suggerire un’altra sostituzione il 9 novembre. Preservare navigazione da tastiera, tema, modalità di rivelazione, punteggio senza modifiche, condivisione priva di lettere e comportamento senza spoiler.

      Verificare in modo controllato la normalizzazione deterministica, fingerprint e appartenenza effettiva invariata delle 7.679 parole, incluse AUDIO, OZONO e campioni di categorie ammesse; testare l’ammissione reale e non soltanto la dimensione della lista o una permutazione precedente. Coprire mezzanotte romana, entrambi i cambi DST, fusi del dispositivo diversi, riapertura dopo confini mancati e cambio giorno durante acquisizione ritardata; preservare v1 storico e ritiro singolo senza reset il 9 novembre. Coprire risposta valida, errore HTTP, assenza, JSON malformato, schema non supportato, data impossibile o errata, vocabolario errato, indice non valido e identità incoerente: mai partita di fallback, tentativi, timer o esito; mantenere selezione trattenuta valida anche dopo errore e rifiutarla dopo mezzanotte. Ripristinare dopo refresh bozza posizionale parziale, righe confermate, scelta bloccata e risultato terminale; conservare punteggi storici e preferenze e impedire a schede concorrenti o migrazione ripetuta di cancellare progressi, duplicare risultati o ripristinare l’attivazione pubblica superata. Coprire acquisizioni ritardate e fuori ordine, risposta obsoleta dopo mezzanotte, retry duplicati, eventi di storage durante caricamento e cambio data prima dell’adozione. Verificare il sito costruito per il prefisso di produzione con date controllate e risposte pubbliche intercettate: caricamento, fallimento, retry manuale, acquisizione riuscita, reload/offline nello stesso giorno, giorno non pubblicato e recupero manuale; osservare tastiera disabilitata, griglia vuota, stato accessibile, modale/focus e statistiche storiche mantenute, assenza di recap/condivisione obsoleti e gioco dopo acquisizione. Non dichiarare supporto offline a freddo.

      ## Code notes

      Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

      - `src/daily-word.ts`: `scheduleIdForDate`, `wordForDate`, assegnazioni v1/v2, data romana e osservatore di mezzanotte; `src/word-data.ts` contiene gli array generati.
      - `scripts/generate-words.mjs` unisce fonti fissate, esclusioni, ordinamento hash v2 e verifica fingerprint; `data/README.md`, `data/schedule-v2.txt`, `data/solutions-v1.txt` documentano provenienza e calendario. Rimuovere il percorso v2 futuro mantenendo v1.
      - `tests/daily-word.test.ts` copre identità e ammissione del vocabolario, attivazione, Roma/DST e rigenerazione; aggiornare le asserzioni obsolete di permutazione, non ridurre i controlli di ammissione.
      - `src/main.ts:145-235` serializza riconciliazione storage e rivelazione; `src/daily-word.ts:32-78` osserva startup visibile, ritorno visibilità e mezzanotte romana. Riutilizzare il meccanismo di sessione della partita giornaliera. HMAC deve evitare precisione `Number`; identità canonica ordinata distinta dalla vecchia hash di permutazione. Nessun download fonti; impedire che risposte accodate o tardive dopo mezzanotte vengano applicate.
  b81e71gs:
    title: Integrazione e verifiche finali
    refs:
    - requirements/quality
    - requirements/tech
    technical: true
    finished: 2026-11-09T13:36:27.377Z
    body: |-
      Completare l'integrazione e le verifiche rimaste interrotte nell'ultimo lavoro, preservando tutte le modifiche locali e senza rifare le funzionalità già realizzate. Il Model e i Requirements approvati restano il contratto: questa Task non introduce nuove funzionalità e non decide Drifts aperti.

      Il resoconto dell'ultimo job riporta typecheck, build di produzione e 93 test unitari superati, ma una verifica browser con 19 fallimenti e 52 successi. La verifica inizialmente non poteva avviarsi perché la porta era occupata; la successiva esecuzione ha riutilizzato un server di sviluppo, quindi non dimostra la correttezza del sito di produzione. Alcune verifiche cercano ancora vecchi messaggi e vecchie statistiche, altre incontrano due controlli di chiusura omonimi. Non presumere che tutti i fallimenti siano soltanto test obsoleti: distinguere errori dell'ambiente, aspettative superate e difetti reali del comportamento.

      Le verifiche devono esercitare una build di produzione completa sotto il prefisso di progetto configurato, non un server di sviluppo riutilizzato. Impiegare un ambiente o una porta libera senza terminare server estranei. Il fallimento già riportato costituisce la riproduzione: non rieseguire controlli soltanto per confermarlo. Dopo le correzioni, esercitare prima i percorsi interessati e completare una verifica integrata finale, con typecheck, test deterministici, build e smoke browser contro il sito realmente compilato. Non ottenere il verde saltando casi, indebolendo invarianti, aumentando arbitrariamente timeout o retry, o serializzando i test per nascondere corse.

      Allineare soltanto le aspettative divenute obsolete alle decisioni già approvate: toast accessibili invece dei vecchi messaggi inline, nuova presentazione di statistiche e storico, e azioni di chiusura identificate nel contesto corretto. Le verifiche devono continuare a dimostrare comportamento e accessibilità osservabili, non fissare dettagli incidentali di testo o implementazione. Correggere gli eventuali difetti di integrazione necessari a rispettare il contratto, preservando input fisico e su schermo, pressioni prolungate, rivelazione, reduced motion, autocomplete, punteggi, statistiche, storico, salvataggi e condivisione senza lettere.

      Completare in particolare la verifica interrotta della sostituzione/ritiro di una sfida con la finestra statistiche aperta e durante una rivelazione. La finestra deve rimanere utilizzabile e coerente, senza dati, durata, condivisione o feedback manuale del risultato ritirato. Una riconciliazione o un completamento tardivo non può cancellare la partita acquisita corrente, alterarne tentativi, scelta di autocomplete, tempi o risultato, interrompere una rivelazione valida della sfida corrente o far riapparire un recap obsoleto. Lo storico e i totali devono riflettere soltanto gli esiti ancora validi. Il test aggiunto dal lavoro interrotto è rimasto nel progetto, mentre la successiva correzione tentata non è stata applicata: verificare il comportamento reale, non limitarsi a mantenere il test esistente.

      Il Drift d7qk5rv9, Global touch restriction, è separato e resta una decisione del developer. Non rimuovere o restringere automaticamente regole touch seguendo la sola raccomandazione del Drift: i Requirements distinguono selezione/callout sui tasti e soppressione dello zoom di pagina richiesta esplicitamente altrove. Questa Task non approva, scarta o decide quel Drift né modifica Model o Requirements. Se emerge un impedimento reale dipendente da quella decisione, documentarlo precisamente senza dichiarare completata una verifica non eseguita.

      La Task è conclusa soltanto quando le verifiche proporzionate all'integrazione sono riuscite nell'ambiente corretto e il job ha completato il resoconto e la registrazione del lavoro secondo il normale processo. Distinguere controlli realmente esercitati da limiti di verifica su dispositivi touch o condivisione nativa. Aggiornare la documentazione inglese e il changelog soltanto quanto necessario per le correzioni effettive. Non riaprire o ricreare tutte le precedenti Tasks Done e non chiudere questa Task prima della verifica finale. Nessun provisioning o rotazione della chiave segreta, modifica di assegnazioni giornaliere, push o pubblicazione automatica: il rilascio delle nuove modifiche resta un'azione separata.

      ## Code notes

      Commit: 991659b661a43604f410e309f4d098dd260c44c1

      - Working tree: 27 file modificati e 18 elementi non tracciati alla diagnosi; preservare il lavoro esistente. L'ultimo job era aljzeog8; la Task già Done 4qd9h5b9 aveva una verifica rimasta incompleta.
      - `playwright.config.ts`: preview di produzione con prefisso /ParoleCompetitive/ sulla porta 4173; il server development già presente su quella porta ha invalidato l'ambiente della verifica precedente. Non riutilizzarlo come prova di produzione.
      - `package.json`: mantenere gli script typecheck, test, build e smoke e il lockfile npm.
      - `e2e/replacement.spec.ts`, righe 182-270 lette: casi con statistiche aperte, ritiro tardivo e rivelazione autocomplete; restano selettori role=status e formule testuali delle statistiche precedenti. Ultimo caso aggiunto: stale public progress cannot discard an acquired autocomplete reveal.
      - `src/main.ts`, `src/statistics.ts`, `src/share.ts` e gli e2e di statistiche/condivisione/finestre contengono le modifiche di integrazione da preservare; verificare l'UI attuale prima di aggiornare selettori.
      - `src/style.css`: regola globale html touch-action: manipulation; selezione e callout sono già limitati a .keyboard button. Consultare insieme i Requirements daily-game e game-interface prima di attribuire a questa regola un difetto.
  w3fqu4q7:
    title: 'Fix the code: Global touch restriction'
    refs:
    - requirements/ui#daily-game
    technical: true
    finished: 2026-11-09T15:08:18.598Z
    body: |-
      ## What happens

      The game page applies `touch-action: manipulation` globally, restricting gestures outside embedded keys as well as on them.

      ## What should happen

      The interface requirement limits selection and touch-callout suppression to embedded keys and explicitly says not to disable page gestures for that purpose; other page content and gestures must remain unaffected.

      ## Chosen option

      ### Remove global touch rule

      Remove the page-wide touch-action restriction and retain only the embedded-key selection and callout rules. This preserves browser gestures across the page.

      ## Where in the code

      src/style.css: global html touch-action rule
---
# Daily Italian word game

Provides Rome-date challenges and curated word data; six-guess gameplay with hard mode and scoring; local restoration and cross-tab reconciliation; accessible keyboard input, preferences, local statistics, and privacy-preserving sharing. Accepted rows reveal feedback progressively or immediately under reduced motion. Accessible modal settings, guide and statistics include result recaps; appearance follows the device or an explicit choice. Optional autocomplete preserves fixed green letters, positional drafts and its scoring multiplier. From 8 November 2026, compatible published selections replace the public schedule; the superseded activation-day challenge is withdrawn once while earlier outcomes and later games are preserved. A retained selection cannot be replaced by a conflicting same-day assignment. Sharing remains in the statistics window and rejects stale replaced results.
