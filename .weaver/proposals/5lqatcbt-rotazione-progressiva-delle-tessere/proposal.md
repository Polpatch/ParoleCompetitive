---
status: approved
kind: change
base:
  requirements/quality/reliability.md: f9b63d3581d8053a0ae8492d295e68962efcba5042bf3bf109fd2e661adfa769
  requirements/ui/interface.md: 91d57d42c6cdd72735c4a776e6f3e9071230e5caf27c0172b14d95bc05db0276
created: 2026-11-08T19:17:59.518Z
request: 2026-11-08T17-56-10
label: Rivelazione tessere
job: dmmt1dm1
---
# Rotazione progressiva delle tessere

La rivelazione dei tentativi accettati deve procedere per tessera, anziché avviare tutte le rotazioni insieme.

## Decisioni
- Ogni rotazione mantiene la durata di 1 s; gli avvii sono sfalsati di 0,3 s, a 0 / 0,3 / 0,6 / 0,9 / 1,2 s. Le rotazioni si sovrappongono intenzionalmente e l’ultima termina a 2,2 s.
- L’ordine è da sinistra a destra, per ogni tentativo accettato.
- Il colore e la descrizione accessibile di ciascuna tessera cambiano a metà della propria rotazione; le tessere non ancora rivelate restano neutre.
- Con movimento ridotto tutti i feedback compaiono immediatamente dopo il salvataggio, senza rotazioni né ritardi artificiali.
- Invio, modifiche e nuovi tentativi restano bloccati fino alla fine dell’intera rivelazione; tastiera cumulativa, risultato, statistiche visibili e condivisione si aggiornano solo al completamento.
- Restano invariati salvataggio atomico del tentativo, tempi e punteggio fissati alla submission, risultati contati una volta, ripristino senza ripetere l’animazione e cambio del giorno.

## Ambito
Il Model già lega il nuovo tentativo alla fine della rivelazione e separa il risultato persistito dalla presentazione: non richiede nuove Machine, State o Event. Cambiano i Requirements di interfaccia e verifica, senza modifiche alle tecnologie. Nessuna domanda saltata e nessuna decisione lasciata implicita.
