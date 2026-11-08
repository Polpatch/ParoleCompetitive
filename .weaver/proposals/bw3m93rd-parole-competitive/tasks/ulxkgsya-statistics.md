---
technical: false
refs:
  - statistics
  - requirements/rules#statistics
  - requirements/data#statistics
  - requirements/ui#statistics
  - requirements/quality#statistics
---
# Statistiche locali

Conservare sul dispositivo gli esiti delle sfide giornaliere e mostrarne riepilogo e distribuzione: vittorie totali, sconfitte totali, distribuzione delle vittorie ottenute in uno, due, tre, quattro, cinque o sei tentativi e punteggio dell'ultima partita conclusa. Le statistiche sono locali, non una classifica online; non aggiungere classifica per persona, cronologia ordinata o serie di vittorie.

Registrare gli esiti per data della sfida, oppure ricavare gli aggregati da un registro per data. Ogni esito terminale deve incidere al massimo una volta anche con refresh, riaperture, consegna ripetuta dell'evento o schede concorrenti. Conservare soltanto quanto serve per conteggi, sei fasce di vittoria, ultimo punteggio e ripristino giornaliero; non esporre una cronologia ordinata.

Una vittoria incrementa una sola volta il totale vittorie e la fascia corrispondente da uno a sei tentativi, e rende il proprio punteggio l'ultimo risultato. Esaurire i tentativi incrementa una sola volta le sconfitte e imposta a zero l'ultimo punteggio. La scadenza di una sfida iniziata conta una sola sconfitta e imposta a zero l'ultimo punteggio; la scadenza di una sfida non iniziata non cambia alcun totale né l'ultimo risultato. I giorni senza partita iniziata non aggiungono vittorie o sconfitte.

Mostrare etichette chiare per vittorie, sconfitte, distribuzione dei tentativi e punteggio più recente. Rendere correttamente lo stato vuoto e le fasce con conteggio zero, senza suggerire una graduatoria online. Il punteggio più recente è quello dell'ultima partita conclusa, con zero per una sconfitta o una scadenza iniziata.

I risultati e l'orologio del client sono fidati: non dichiarare che conteggi o tempi siano autorevoli, a prova di manomissione o sincronizzati fra dispositivi. Verificare un solo conteggio dopo reload, consegna ripetuta o schede concorrenti, la collocazione delle vittorie con uno e sei tentativi e la distinzione tra scadenza iniziata e non iniziata.