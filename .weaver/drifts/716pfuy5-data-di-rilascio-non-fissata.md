---
status: fixed
refs:
- requirements/data#daily-word
origin: 62esccbu
proposal: r6cnleox
task: a151zx5n
option: 1
job: gymuux6m
created: 2026-11-08T20:12:56.949Z
decided: 2026-11-08T21:07:46.791Z
---
# Data di rilascio non fissata

## What happens

La pianificazione in preparazione usa una data di attivazione provvisoria non collegata a una data di pubblicazione concordata. Il repository e il Task non identificano il giorno del rilascio che introduce la nuova pianificazione.

## What should happen

La nuova pianificazione deve attivarsi nella data Europe/Rome esplicitamente fissata per il rilascio che la introduce. Senza una data di rilascio concordata non è possibile fissare responsabilmente le assegnazioni e il giorno del ritiro della sfida precedente.

## Fix options

### Concordare il giorno di rilascio

Fissare una data Rome futura per il rilascio e pubblicare la pianificazione quel giorno; incorporare la stessa data come attivazione prima della pubblicazione. Le assegnazioni diventano definitive per quel giorno.

### Fissare la data al rilascio

Rinviare il congelamento finale finché il giorno del rilascio non è noto, quindi incorporare esplicitamente quella data prima di pubblicare. La pubblicazione attende tale decisione, senza ricalcoli all'apertura o nelle ricostruzioni successive.

## Where in the code

src/daily-word.ts, ACTIVATION_DATE e wordForDate; data/README.md, Schedule v2.

## Prepared question

```json
{
  "question": {
    "id": "716pfuy5",
    "question": "Quando deve diventare attiva la nuova pianificazione?",
    "context": "La pianificazione v2 è predisposta con una data di attivazione provvisoria, ma il repository e il Task non indicano una data di rilascio concordata. La scelta determina le assegnazioni definitive e il giorno in cui termina la sfida precedente.",
    "options": [
      {
        "label": "Concordare il giorno di rilascio",
        "description": "Fissare una data futura Europe/Rome e attivare la pianificazione quel giorno.",
        "details": "Le assegnazioni diventano definitive in anticipo per la data stabilita."
      },
      {
        "label": "Fissare la data al rilascio",
        "description": "Rinviare il congelamento finché il giorno del rilascio non è noto, quindi impostare esplicitamente quella data prima della pubblicazione.",
        "details": "La pubblicazione attende la decisione; nessun ricalcolo avviene all'apertura o nelle ricostruzioni successive."
      },
      {
        "label": "Mantenere la data provvisoria",
        "description": "Conservare l'attivazione pianificata attualmente nel codice, anche senza un giorno di rilascio concordato."
      }
    ],
    "recommended": 1,
    "multi": false
  },
  "decisions": [
    {
      "decision": "fix-code",
      "option": 1
    },
    {
      "decision": "fix-code",
      "option": 2
    },
    {
      "decision": "proposal"
    }
  ],
  "fingerprint": "sha256:0162833b82bb64083b66902ba79450a33e23f7da7d6098e6da305c1da4eb6dde",
  "prepared": "2026-11-08T20:55:53.976Z"
}
```
