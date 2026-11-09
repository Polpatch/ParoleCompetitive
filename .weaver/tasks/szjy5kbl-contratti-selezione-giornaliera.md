---
column: done
technical: false
refs:
- automation
- challenge-source
- player.SELECTION_RETRY_REQUESTED
- game-interface
- requirements/quality#General
- requirements/tech#General
- specs#data
- specs#ci
- specs#deployment
- specs#infrastructure
- specs#notes
proposal: st31jv5v
job: qw6u7wvq
created: 2026-11-08T22:24:48.187Z
finished: 2026-11-08T23:34:06.556Z
---
# Contratti della selezione segreta

Completare i contratti trasversali della selezione giornaliera segreta e allineare tecnologie, documentazione e verifiche alla nuova disponibilità della sfida. Non introdurre un backend applicativo, account, classifica, analytics, tracking, PWA o service worker. Conservare TypeScript rigoroso, sito statico, dizionario italiano locale e regole di gioco, punteggio, autocomplete, aspetto, reveal e condivisione indipendenti dalla selezione.

L'automazione fidata richiede la pubblicazione del solo giorno corrente per esecuzione giornaliera, rilascio autorizzato o recupero manuale; comunica successo o fallimento per il tentativo corrente. Un completamento obsoleto non può rendere corrente una vecchia giornata o sostituire una sfida già fissata. Il fallimento conserva ogni assegnazione già fissata e l'eventuale pubblicazione già riuscita. Le richieste ripetute non estraggono nuovamente.

La fonte della sfida comunica il completamento dell'acquisizione o il fallimento. Solo una selezione valida e compatibile per il giorno ancora corrente può abilitare il gioco; un completamento fuori ordine non sostituisce il gioco corrente. Una selezione odierna valida già acquisita rimane utilizzabile in caso di errore o assenza di rete. Il comando esplicito del giocatore per riprovare una sfida indisponibile avvia una sola acquisizione, senza timer, polling o retry automatici.

La selezione segreta entra in vigore il 2026-11-08 al rilascio autorizzato. Il passaggio sostituisce una volta l'eventuale sfida pubblica di quella data, anche conclusa o scoperta in ritardo, senza una perdita aggiuntiva; conserva date precedenti e preferenze. Il previsto passaggio pubblico del 2026-11-09 viene abbandonato e non causa un secondo reset. Senza dato odierno valido il gioco attende onestamente, senza soluzione alternativa, partita o risultato inventato. Le partite precedenti non iniziate o incompiute scadono secondo le regole esistenti anche durante l'attesa.

Dopo avere acquisito le risorse statiche e la selezione valida del giorno, il gioco di quella giornata non richiede rete; ciò non promette apertura offline a freddo o conoscenza di giorni non ancora acquisiti. La stessa sfida è garantita ai client aggiornati compatibili: le vecchie copie del calendario pubblico non sono revocabili da un sito statico. La soluzione odierna resta leggibile nel browser, sono possibili ripetizioni e non si promette anti-cheat.

Mantenere il percorso verificato di rilascio statico sotto il prefisso del progetto: controlli dei tipi, verifiche deterministiche, build di produzione e verifica browser reale. Le pull request non ricevono la chiave e non pubblicano. Il segreto applicativo è necessario solo per fissare una nuova assegnazione nell'automazione fidata, non per verificare o costruire il frontend né per ripubblicare una giornata già fissata. Nessun nuovo servizio cloud o token di deployment di terze parti.

La documentazione inglese e il changelog devono descrivere, senza conservare il valore del segreto, data e migrazione concordate, formula e identità del vocabolario, pubblicazione automatica alle 00:07 Europe/Rome, recupero manuale, registro durevole immutabile, provisioning assistito soltanto nell'implementazione autorizzata e gestione esplicita di perdita o rotazione della chiave. Indicare ritardi, possibili esecuzioni perse o disattivate per inattività, limiti offline e dei vecchi client, ripetizioni possibili e soluzione corrente esposta. Eliminare le promesse incompatibili di calendario futuro autonomo o assenza assoluta di dati giornalieri da acquisire. Conservare provenienza e licenze del vocabolario e descrivere solo controlli realmente eseguiti.

Verificare i confini osservabili con le verifiche delle Tasks delle rispettive Machine: nessuna partita o penalità dall'attesa; una sola acquisizione per azione esplicita; nessuna promozione fuori data o sostituzione di un'assegnazione; recupero dello stesso risultato e mantenimento delle verifiche di rilascio. Non aggiungere test di semplice inoltro degli Events o del testo della documentazione.

## Code notes

Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `.github/workflows/pages.yml`: existing PR/main verify uses `npm ci`, typecheck, Vitest, build and Playwright smoke; official Pages upload/deploy, read-only default permissions. Current `pages` concurrency covers only deploy, not generation/build.
- `package.json`, `.nvmrc`, `vite.config.ts`: Node 24, existing scripts and `/ParoleCompetitive/` base. Keep these conventions.
- `src/main.ts` serializes reconciliation/actions and guards reveal/share identity; `src/session.ts` owns persistence and migration. Reuse them, not an independent event/state store.
- `README.md`, `data/README.md`, `CHANGELOG.md`: existing English operational/provenance docs. Replace future-calendar promises; preserve source caveats. Existing browser coverage lives in `e2e/`, not only `test/` and `tests/`.
