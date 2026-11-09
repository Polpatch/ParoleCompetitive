---
status: approved
kind: change
base:
  model/actors/automation.md: new
  model/actors/challenge-source.md: new
  model/actors/player.md: cafc24abcf52db6208f604296eecd05b12417361b9e4de3378414b6d978b032a
  model/daily-challenge/daily-publication.md: new
  model/daily-challenge/daily-word.md: 582384d53dffca673a407c1a01116543f04899e58c47c22b5693d1874d87d077
  model/daily-challenge/game-interface.md: ab1b595f2123150e90c118f07923fff136c759d0a9ab9ef12582af0301026b49
  requirements/data/daily-selection.md: new
  requirements/data/local-data.md: 6fc05b7841256db126484edc88271db40094b30388f9cb2787c06f57cfddc740
  requirements/quality/daily-selection.md: new
  requirements/quality/reliability.md: 7112e1aa34250709e657aa0ddd6ec2b4fd62ae4684e2768a8ca9b05ac2ff2ff5
  requirements/rules/daily-selection.md: new
  requirements/rules/gameplay.md: 08509ce647743959ca6745725560e0f945509ff78f67514f107e32920cb00e2b
  requirements/tech/platform.md: ebbf48e0978e2831c6bc4169f0a38c649c9ea44a3869e41bf15bc1897b3c1d12
  requirements/ui/daily-selection.md: new
  requirements/ui/interface.md: a16efc19e10a90fd9605a96fa624ecf8a6f70ec445ef0837d280ddc77dec90db
  specs.yaml: 7ade8d7e1f464577b9344a91fdf91b6ff4dfd2bb6383f169d21ad1cb4fc3df3f
created: 2026-11-08T22:14:40.594Z
request: 2026-11-08T22-56-00
label: Selezione segreta
job: qw6u7wvq
---
# Selezione giornaliera segreta

Impedire la ricostruzione delle soluzioni future dal repository pubblico senza backend applicativo o pianificazione pluriennale.

## Decisioni
- HMAC-SHA256 della sola data canonica Europe/Rome, con digest intero big-endian non negativo modulo il vocabolario canonico ordinato; ripetizioni ammesse.
- Attivazione esplicita 2026-11-08 al rilascio: una sola sostituzione dell'eventuale vecchia sfida dell'8, anche conclusa o scoperta più tardi; nessun secondo passaggio v2 il 9. Le date precedenti e le preferenze restano immutate.
- Vocabolario invariato di 7.679 parole, identità SHA-256 delle parole ordinate UTF-8 separate da LF con LF finale; nessun nuovo insieme di soluzioni.
- Secret PAROLE_DAILY_HMAC_KEY: 32 byte casuali codificati in 64 cifre esadecimali e decodificati dal generatore fidato; nessuna chiave o equivalente nel browser.
- Branch daily-data con assegnazioni append-only dei soli giorni già arrivati; JSON pubblico corrente sotto il prefisso Pages, con schema, data, vocabolario, identità della sfida e indice.
- Unico percorso Pages serializzato dall'inizio alla fine per pubblicazioni giornaliere, push main e recuperi manuali; snapshot main fidato verificato, nessuna retrocessione di codice o giornata. Recupero con lo stesso record già fissato anche dopo un deploy fallito.
- Schedule 00:07 Europe/Rome, una sola esecuzione giornaliera; recupero manuale workflow_dispatch, nessun polling o retry temporizzato arbitrario. Ritardi, esecuzioni perse e disattivazione dopo inattività restano limiti espliciti.
- Acquisizione ad apertura, ritorno visibile, cambio giorno e Riprova manuale; dato assente, malformato o incompatibile blocca soltanto il nuovo gioco, non inventa una soluzione o un risultato. Incompatibilità richiede aggiornamento.
- Una selezione valida già acquisita resta giocabile offline nella stessa giornata, con gli stessi progressi; nessuna promessa di apertura offline a freddo o di giornate non acquisite.
- Durante attesa, griglia neutra 6×5 e tastiera disabilitata; messaggi italiani accessibili, Riprova e Ricarica pagina quando incompatibile. Impostazioni, guida, aspetto e statistiche storiche restano accessibili, con pannelli e focus preservati.
- Le vecchie copie del client pubblico non sono revocabili: parità della sfida garantita ai client compatibili aggiornati, limite documentato senza reset globale.
- Provisioning assistito soltanto nell'implementazione autorizzata: input protetto GitHub CLI, nessun valore in Chat/log/argomenti/file versionati. Secret esistente mai rigenerato. Perdita o rotazione bloccano nuove assegnazioni fino a un periodo futuro esplicitamente autorizzato; record già fissati immutabili e ripubblicabili senza chiave.
- Preservare gioco, punteggio, autocomplete, reveal, accessibilità e condivisione indipendenti dalla selezione; aggiornare documentazione inglese, changelog e verifiche interessate.

## Limiti
La parola odierna è leggibile nel browser; non è anti-cheat. Nessun backend, account, classifica, PWA o service worker. Il design non crea segreti e non implementa né pubblica il sito. Nessuna domanda saltata.

## Fonti
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## Already present
- `daily-game/Ready/calendar.DAY_CHANGED` — `src/session.ts` expires an unstarted preceding game without an outcome.
- `daily-game/Playing/calendar.DAY_CHANGED` — `src/session.ts` expires a started preceding game once at the actual Rome boundary; `test/session.test.ts` and `e2e/statistics.spec.ts` cover expiry.
- `game-interface/Statistics open/calendar.DAY_CHANGED` — `src/main.ts` keeps the modal open while removing obsolete current-result presentation; `e2e/windows.spec.ts` covers rollover.
- `statistics` — `src/session.ts` derives totals from surviving dated outcomes; `tests/statistics.test.ts` covers deduplication and withdrawal.
- `result-share` — `src/main.ts` and `src/share.ts` guard challenge identity and preserve letter-free sharing; `e2e/replacement.spec.ts` exercises pending sharing during withdrawal.
