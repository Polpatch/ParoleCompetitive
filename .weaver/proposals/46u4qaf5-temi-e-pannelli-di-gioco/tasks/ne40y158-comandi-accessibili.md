---
technical: false
refs:
  - player.SETTINGS_REQUESTED
  - player.GUIDE_REQUESTED
  - player.STATISTICS_REQUESTED
  - player.PANEL_DISMISSED
  - player.APPEARANCE_SELECTED
  - device
---
# Comandi accessibili

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
