---
technical: false
refs:
  - game-appearance
  - requirements/ui#game-appearance
  - requirements/data#game-appearance
  - requirements/quality#game-appearance
---
# Aspetto del gioco

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