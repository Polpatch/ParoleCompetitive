---
column: done
technical: false
refs:
- daily-game
- requirements/ui#daily-game
- requirements/quality#daily-game
proposal: l6kqifix
job: m0dojpcg
created: 2026-11-09T12:15:13.103Z
finished: 2026-11-09T12:46:31.784Z
---
# Tastiera e feedback

La partita giornaliera mostra sempre sei righe di cinque caselle, conserva i tentativi accettati e presenta la bozza attiva. La tastiera incorporata ha esattamente tre righe centrate e senza ritorno a capo: QWERTYUIOP; ASDFGHJKL; quindi Invio, ZXCVBNM e Cancella. Gruppi e ordine restano invariati su telefono e desktop, anche a 320 px senza scorrimento orizzontale della pagina; le righe più corte sono rientrate e i tasti d’azione più larghi quando lo spazio lo consente. Non sono presenti tasti numerici, di punteggiatura o accentati.

I tasti fisici A–Z, Invio e Backspace hanno comportamento equivalente e mantengono la ripetizione nativa del sistema operativo. L’input di gioco non intercetta altri controlli modificabili né scorciatoie con modificatori, e non agisce mentre un pannello modale è aperto.

Con il completamento automatico attivo, le lettere corrette note occupano le rispettive posizioni della bozza come caselle verdi fisse. Le descrizioni accessibili indicano lettera, posizione, correttezza e stato fisso; il colore non è l’unico indicatore. Le altre caselle restano neutre. Inserimento e cancellazione saltano le caselle fisse e modificano in sequenza quelle restanti; non è possibile selezionare manualmente una casella. Caselle fisse e descrizioni restano leggibili nelle modalità chiara e scura.

Le nuove caselle precompilate appaiono soltanto dopo la completa animazione di rivelazione della riga precedente, simultaneamente alla nuova bozza modificabile. Prima di allora non è mostrata alcuna parte della nuova bozza. Una partita terminale non mostra una bozza attiva. Il ripristino mostra subito la bozza ricostruita senza riprodurre animazioni delle righe accettate.

Ogni invio accettato rivela solo la riga interessata, con rotazioni da sinistra a destra: grigio per lettera assente, giallo per lettera presente in altra posizione, verde per lettera corretta. Ogni rotazione dura un secondo; iniziano a 0, 0,3, 0,6, 0,9 e 1,2 secondi dall’inizio della rivelazione. Le rotazioni si sovrappongono e la sequenza completa termina quando finisce la quinta, nominalmente dopo 2,2 secondi. Ogni casella resta neutra e senza feedback nella descrizione accessibile fino al punto mediano della propria rotazione; allora colore e descrizione corrispondente appaiono insieme. Il feedback già rivelato rimane visibile mentre le caselle successive vengono rivelate: non viene mai esposto tutto insieme. La regola vale anche per lettere che erano fisse e verdi nella bozza.

Fino al termine della quinta rotazione non sono consentiti nuovi invii, modifiche o tentativi. Feedback cumulativo della tastiera, statistiche visibili, messaggi di risultato e condivisione mantengono la presentazione precedente alla rivelazione completa; solo dopo mostrano l’esito impegnato. Il tentativo accettato e l’eventuale risultato terminale sono registrati prima dell’animazione, senza prolungare il tempo di soluzione né alterare il punteggio.

Con la preferenza di sistema per il movimento ridotto, dopo la registrazione del tentativo sono mostrati immediatamente i cinque feedback cromatici e le rispettive descrizioni accessibili, senza rotazioni o attese artificiali. Aggiornamenti dipendenti dalla rivelazione e sblocco dell’input rispettano immediatamente lo stesso ordine; le partite terminali restano bloccate.

I tasti della tastiera mostrano il miglior feedback cumulativo, con priorità verde, giallo, grigio. Le lettere interamente assenti sono visibilmente e funzionalmente disabilitate in entrambe le modalità; Invio e cancellazione restano utilizzabili quando appropriato. Gli errori per lunghezza incompleta o caratteri non A–Z, lettere fisse, lettere escluse, parola non ammessa e violazioni della modalità difficile sono distinti, non consumano tentativi e non avviano il tempo. I messaggi italiani sono rispettivamente: “Servono 5 lettere dalla A alla Z”, “Le lettere verdi sono fisse”, “Lettera già esclusa”, “Parola non ammessa” e “Rispetta gli indizi della modalità difficile”. Il conflitto tra schede mostra “Partita aggiornata in un’altra scheda. Controlla la griglia”. Restano invariati gli effetti esistenti di rifiuto su tentativi e orologio.

Dopo la rivelazione completa di un tentativo non terminale viene annunciato accessibilmente “Tentativo inviato”, senza toast visibile. I messaggi dipendenti dalla rivelazione attendono il completamento della sequenza, anche con movimento ridotto. Il testo finale è “Hai indovinato! Punteggio: {score}” oppure “Tentativi finiti. La parola era {solution}. Punteggio: 0”; resta nel riepilogo statistiche. Un toast breve è consentito soltanto dopo la rivelazione terminale. Le lettere soluzione non compaiono negli artefatti di condivisione.

Quando il cambio di selezione ritira la partita salvata del giorno di attivazione, il testo italiano spiega che sfida e risultato di quel giorno sono stati sostituiti, mentre risultati precedenti e impostazioni sono stati conservati. Mostra la nuova griglia vuota di sei righe per cinque, conoscenza tastiera azzerata e input idoneo sbloccato; non riappaiono vecchie animazioni, punteggi o messaggi. Se il ritiro viene scoperto in ritardo, viene spiegato il giorno ritirato senza presentare una nuova partita per quel giorno passato.

Su ogni tasto incorporato abilitato, mentre è premuto, appare immediatamente un bordo statico di pressione e un’ombra interna. Feedback verde, giallo o grigio, indicatore di focus e contrasto sufficiente restano preservati in entrambe le modalità; il tasto non si anima né si sposta. Un tasto disabilitato non mostra feedback di pressione attivabile.

La pressione puntatore di un tasto incorporato abilitato, inclusi Invio e Cancella, esegue subito l’azione normale. La prima ripetizione avviene dopo 1000 ms di pressione continua, poi ogni 150 ms. Una pressione breve produce esattamente un’azione; rilascio e relativo click non ne aggiungono. Attivazione semantica da tastiera e tecnologia assistiva restano disponibili senza duplicazioni.

È attivo al massimo un tasto incorporato tenuto premuto. Il normale aggiornamento della bozza o dell’aspetto non annulla la pressione né crea flussi di ripetizione aggiuntivi. La ripetizione si arresta al rilascio, uscita del puntatore dal tasto, annullamento del puntatore o perdita della cattura, perdita di finestra o focus, pagina nascosta, apertura di un modale, cambio di giorno o sfida, disabilitazione del tasto o inizio della rivelazione di una riga accettata. Non riprende senza una nuova pressione. Ogni attivazione rispetta l’idoneità corrente, le lettere assenti, completamento automatico, blocchi di rivelazione e stato terminale; azioni in coda obsolete non possono modificare una sfida sostitutiva.

Solo sui tasti incorporati sono soppressi selezione del testo e callout touch. Guide, altro testo esplicativo e testo per la copia manuale restano selezionabili. Le restrizioni di zoom della pagina appartengono ai requisiti dell’interfaccia di gioco; i gesti della pagina non sono disabilitati per sopprimere la selezione dei tasti.

## Code notes

Commit: 991659b661a43604f410e309f4d098dd260c44c1

`src/main.ts`: `render()`, `input()`, `perform()`, delegated click and global `keydown`; `data-letter` and `data-action` identify keys. Rendering replaces the entire DOM: a hold must survive ordinary renders; actions are serialized through a queue. Reuse existing locks and positional editing. `src/style.css` contains keyboard rows and focus rules, but no pressed/selection/touch styling. `index.html` sets only the initial viewport scale; global zoom belongs to the interface Task. `src/game.ts` validates guesses and returns rejection text; `session.ts` propagates it. Prevent queued held Invio actions from crossing a reveal or context change. Existing test surfaces: `e2e/interface.spec.ts`, `e2e/accessible-controls.spec.ts`.
