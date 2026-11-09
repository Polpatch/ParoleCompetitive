---
status: approved
kind: change
base:
  model/actors/player.md: 37d04560a5d083e66cec5fdba7b43cdbae0a8b138685bfc417526bf7ee23be2e
  model/daily-challenge/daily-game.md: cdc1aa2b38f6c8ee4f6e27b39368fb70c6e09ffed5eae850a68312b777b624f3
  model/preferences/game-preferences.md: d343b5256f9d7161b0dec55d42d6d7090de264d1281d8cb594e20a79b955c91e
  requirements/data/local-data.md: 1b6521d7b6e041ccd18346c9b804474e2ce1de658a827e18d5709c9f3cf3aa91
  requirements/quality/reliability.md: 59997b068c7a341475c14e5b721c891cea05ae9c7da1433f0fb2aabf4336947a
  requirements/rules/gameplay.md: d93fa407ba0c397dee09327c0341ddcc73a246c63e14b480c31bb6e2552a61b6
  requirements/ui/interface.md: 54eaa7326b0fe0c563fd141224bc070fc3f51d13edf53faee891bbe6fdfefa0a
  requirements/ui/panels.md: new
created: 2026-11-08T19:40:54.583Z
request: 2026-11-08T20-27-05
label: Autocomplete
job: pvfzj1dn
---
# Modalità autocomplete

Aggiunge un aiuto facoltativo alla compilazione senza modificare le regole di validità dei tentativi o i risultati già conclusi.

## Decisions
- Nei settings compare Autocomplete, inizialmente spento, con preferenza persistente sul dispositivo anche nei giorni successivi.
- La modalità si sceglie soltanto prima del primo tentativo accettato; dopo l’inizio resta bloccata fino alla conclusione. A partita conclusa cambia solo la preferenza futura.
- Ogni nuova riga riprende tutte le lettere verdi scoperte in qualunque tentativo accettato, nelle posizioni corrette; nessuna lettera gialla o informazione nascosta viene precompilata.
- Le verdi precompilate non si cancellano e non si sovrascrivono. Digitazione e cancella saltano le verdi: compilazione sequenziale dei vuoti da sinistra; cancella rimuove l’ultima lettera manuale. Nessuna selezione manuale delle caselle.
- La nuova riga compare precompilata solo al termine dell’intera rivelazione; nessuna nuova riga dopo vittoria, sconfitta o scadenza. Movimento ridotto mantiene lo stesso ordine senza attesa.
- Le caselle fisse sono verdi e accessibili come corrette e fisse. I settings spiegano il comportamento, il blocco della scelta e il moltiplicatore.
- Il primo tentativo accettato con Autocomplete attivo rende applicabile ×0,98 anche senza verdi precedenti; toggling e tentativi rifiutati non bastano.
- Il fattore ×0,98 si cumula con l’eventuale bonus hard ×1,10: fattore totale 1,078, con un solo arrotondamento finale. Sconfitte e scadenze restano a zero.
- Il ripristino conserva esattamente lettere manuali, verdi fisse e prossima posizione; non ripete animazioni, non consuma tentativi e non cambia i tempi.
- I vecchi salvataggi senza la nuova modalità equivalgono ad Autocomplete spento; progressi, risultati e punteggi esistenti restano invariati.

## Refinement
- Ripristinati gli eventi del giocatore per impostazioni, guida, statistiche, chiusura e aspetto, aggiungendo Autocomplete senza sostituirli.
- Conservati la sfida sostitutiva, lo stato Replaced, il ritiro degli esiti e RESULT_REVEALED con le esclusioni correnti; nessuna rimozione di comportamento già approvato.
- Reintegrati integralmente vocabolario canonico, calendario congelato, ritiro del giorno di attivazione, statistiche e condivisioni legate alla sfida corrente.
- Conservati apparenza, finestre modali, tastiera a tre righe e riepilogo automatico; Autocomplete entra nelle impostazioni esistenti e mantiene leggibili le fisse nelle due apparenze.
- Suddivisi i Requirements UI in interface.md e panels.md sotto il limite di 12 KB, spostando senza modifiche le sezioni su condivisione, aspetto e finestre.
- Aggiornati i tre Tasks per l'integrazione corrente; identità, Code notes e relative righe Commit restano invariati. Nessun codice letto e nessun nuovo Code notes.

## Assumptions
- Una sostitutiva nello stesso giorno è una nuova partita anche per Autocomplete: usa la preferenza futura conservata, non eredita scelta bloccata o lettere della sfida ritirata, e le riconciliazioni successive non la azzerano.
- La compatibilità dei salvataggi precedenti conserva le partite e i punteggi sopravvissuti; non annulla il ritiro della sfida già imposto dal Model corrente.
- Il controllo Autocomplete riutilizza la finestra delle impostazioni e la persistenza correnti senza introdurre un altro pannello, archivio o formato di condivisione.
- Le decisioni originali restano valide; queste integrazioni seguono il Model e i Requirements correnti e non richiedono nuove scelte del developer.

## Already present
- `result-share` — `src/share.ts`: snapshotResult, resultText e prepareResult usano il punteggio già fissato senza ricalcolarlo.
- `statistics` — `src/statistics.ts`: deriveStatistics legge il punteggio concluso senza applicare moltiplicatori.
