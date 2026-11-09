---
status: approved
kind: change
base:
  model/actors/player.md: 9fbc39bc5bde97636020fdcd8cd3ef35b496b3537613d01b4a7b1a0c91fc931b
  model/daily-challenge/game-interface.md: d11ea7e5fa65f2abe840cd93b93ac503d5bbbb82e6414596612166847912efdf
  model/daily-challenge/statistics.md: 09738e3a1d24e035590badebc99f6ce14b34629a28c4696eaa9cdd588ae0636d
  requirements/data/local-data.md: 6d26ce3b02d29487f1e44673186cf991106246d0ad95010faa3dd642a8328ed8
  requirements/quality/reliability.md: 846dd5ca9e3c86d4d4293749588ea120a33c405dd85325fb518d125f0abd101c
  requirements/quality/statistics.md: new
  requirements/rules/gameplay.md: e39f1008c672cdc2ae46d2dfe0d0efcdd27f7737d4e2746175124e30d961c225
  requirements/ui/interface.md: 97e93b224a8636f1e59f712b1689f041891d385df032db77d46f71d279f3f0e3
  requirements/ui/panels.md: 79b346770726aa4ea659695bdd2ec499bf69fd946f9f86f0ee281910dea00b1f
  requirements/ui/statistics.md: new
created: 2026-11-09T12:15:22.334Z
request: 2026-11-09T13-03-04
label: Statistiche e storico
job: 2g6ov7r4
---
# Statistiche e storico partite

Rende leggibili le statistiche locali e permette di consultare le partite conservate senza modificarle.

## Decisioni
- La sezione notifica indica la finestra Statistiche esistente, con schede Statistiche e Storico.
- Il punteggio totale è la somma dei punteggi definitivi di tutti gli esiti locali validi; sostituisce il dato aggregato dell'ultima partita, non il recap odierno.
- Due riquadri affiancati in alto mostrano vittorie e sconfitte, con coppa e cuore spezzato centrati sul bordo superiore interrotto; totale sotto e istogramma a seguire.
- L'istogramma usa sei barre verticali, tentativi 1–6, scala lineare da zero al massimo conteggio e valori espliciti; gli zeri non hanno altezza fittizia.
- Lo storico comprende vittorie, sconfitte e scadenze iniziate, incluso oggi soltanto dopo la rivelazione finale; esclude partite non iniziate, in corso e ritirate.
- Ogni riga chiusa mostra soltanto soluzione, tentativi e punti. L'espansione mostra griglia 6×5 con lettere e feedback, data, esito, tentativi, punti e durata, senza gioco né condivisione storica.
- Ordine di conclusione decrescente, parità stabile; sfide diverse dello stesso giorno restano distinte, nessuna paginazione, accordion inizialmente chiusi e apertura multipla.
- Ogni apertura e recap automatico parte da Statistiche. Condivisione e relativo feedback compaiono soltanto lì, per l'esito odierno già rivelato.
- Durante la stessa apertura, cambio scheda, tema, giorno e aggiornamenti conservano scheda e aperture valide; vengono rimossi soltanto elementi ritirati. Il recap automatico passa sempre a Statistiche.
- Dati soltanto locali, nessun archivio remoto o dato ricostruito inventato; stato vuoto italiano e totale iniziale zero.
- Nessuna domanda saltata e nessuna nuova tecnologia.
