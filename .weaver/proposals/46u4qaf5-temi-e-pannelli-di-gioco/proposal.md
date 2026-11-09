---
status: approved
kind: change
base:
  model/actors/device.md: new
  model/actors/player.md: f3c802ec81cb6e6f47f950a48d55a77ce81ab49352f3bace9f1fdb270caa6c84
  model/daily-challenge/daily-game.md: 982ff506f85ae74a03d89ca396de368a8012acf28661c1d788dcd2312c35b9e3
  model/daily-challenge/game-interface.md: new
  model/preferences/game-appearance.md: new
  requirements/data/local-data.md: 2ca5c07017d4f015b25d0ad7c7da7e4616b7cf1a74b42cd7c4c69643998ac758
  requirements/quality/reliability.md: 96adea0f3cc4504b992dd38dfb3aa959b6a9267d0ff7c02b03e0a09c54f30573
  requirements/ui/interface.md: 9fce16405e6c45206d796b346279bcf5bb895743b9ac4f669493cc8631801748
created: 2026-11-08T19:29:00.425Z
request: 2026-11-08T17-49-28
label: Interfaccia di gioco
job: 2edg9ih1
---
# Temi e pannelli di gioco

La pagina usa accordion e una tastiera a flusso libero; occorrono temi espliciti, finestre accessibili e una disposizione QWERTY stabile.

## Decisioni
- Aspetto selezionabile fra Sistema, Chiaro e Scuro; Sistema è il valore iniziale e segue immediatamente le variazioni del dispositivo, mentre le scelte manuali le ignorano.
- La scelta dell’aspetto viene salvata sul dispositivo e mantenuta tra giorni e aperture; i dati precedenti restano validi e acquisiscono Sistema senza perdere partite, preferenze o statistiche. Salvataggio indisponibile: avviso onesto e funzionamento in memoria.
- Il chiaro conserva la resa attuale; lo scuro usa superfici grigio scuro neutre con contrasto sufficiente. Significati dei feedback e immagini condivise restano invariati.
- Tre icone in alto a destra aprono Impostazioni, Come si gioca e Statistiche; gli accordion vengono sostituiti da una sola finestra modale centrata alla volta.
- Le finestre hanno contenuto scorrevole, focus contenuto e sfondo non interattivo; Chiudi, Escape e clic sullo sfondo le chiudono e restituiscono il focus. Non modificano bozza, progressi o tempo; gli aggiornamenti interni non le chiudono e il reload riparte senza popup.
- Impostazioni mantiene difficoltà, relative spiegazioni e spoiler-free, aggiungendo Aspetto; guida e statistiche mantengono i contenuti esistenti.
- Un’unica finestra Statistiche e risultato mostra i conteggi locali e, dopo una vittoria o sconfitta odierna rivelata, durata, punteggio e Condividi risultato.
- La durata conclusiva è mostrata in m:ss, oppure h:mm:ss da un’ora, senza modificare tempi e formule del punteggio; la vittoria al primo tentativo mostra 0:00.
- Il riepilogo si apre automaticamente una sola volta dopo il reveal di una nuova vittoria/sconfitta inviata in questa scheda, sostituendo qualsiasi finestra aperta. Reload, chiusura del riepilogo, risultati da altre schede e scadenza giornaliera non lo riaprono. Dopo apertura automatica il focus torna all’icona Statistiche.
- Condividi risultato compare solo nel footer sempre visibile della finestra; il contenuto sopra scorre interamente senza essere coperto. Messaggi e testo per copia manuale restano accessibili nella finestra; privacy, fallback e cancellazione della condivisione non cambiano.
- Tastiera a tre righe totali: QWERTYUIOP, ASDFGHJKL e ZXCVBNM, con Invio prima di Z e Cancella dopo M. Righe centrate e stabili anche a 320 px, senza scorrimento orizzontale; tasti azione più larghi dove possibile. Le regole e l’equivalenza dei tasti fisici non cambiano.
- Nessuna nuova tecnologia, dipendenza, modifica alle formule, ranking o sincronizzazione remota.

Nessuna domanda saltata nel disegno originale. La rifinitura non riapre decisioni già prese; le assunzioni di riconciliazione sono indicate sotto.

## Rifinitura sul Model corrente
- Ripristinate integralmente le regole approvate sul vocabolario canonico, sul calendario congelato e sul ritiro della sfida del giorno di attivazione; non vengono più proposte le precedenti esclusioni o il sottoinsieme ridotto di soluzioni.
- Conservati lo stato Replaced, le transizioni di sostituzione e il ritiro degli esiti anche dopo una conclusione o una scoperta tardiva; sostituire una sfida non diventa una scadenza né una sconfitta.
- Conservati i requisiti correnti di persistenza, statistiche, privacy e verifica della sostituzione, oltre alle temporizzazioni e al movimento ridotto già approvati.
- Assunzione di riconciliazione: un risultato ritirato non può emettere RESULT_REVEALED né riaprire il riepilogo, anche se la sfida sostitutiva ha la stessa data; la validità segue la sfida e non soltanto il giorno.
- Assunzione di riconciliazione: la sostituzione conserva la finestra aperta e il focus, come gli altri aggiornamenti interni; Statistiche rimuove risultato, durata, condivisione e testo obsoleti e usa gli esiti sopravvissuti. Solo il risultato rivelato della nuova sfida può produrre il nuovo riepilogo.
- La compatibilità delle sessioni prive di Aspetto non impedisce il ritiro già previsto delle sfide sostituite: aggiungere la preferenza non causa ulteriori azzeramenti.
- Aggiornati i criteri delle Task su rivelazione, finestre e condivisione senza modificare identità, Code notes o Commit originari; nessuna lettura del codice e nessuna nuova tecnologia.


## Already present
- `requirements/ui#General` — `src/main.ts` e `src/style.css` forniscono già lingua italiana, guida alle regole, pulsanti semantici, feedback accessibili e focus visibile; la modifica rimuove soltanto l’esclusione del selettore di aspetto.
