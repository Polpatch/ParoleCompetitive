---
status: approved
kind: change
base:
  model/daily-challenge/daily-game.md: 707f0e3b55a6cdcad73a6943136168a9a4cd5354cdfc1e4a693a37cbaa3c4a1f
  model/daily-challenge/daily-word.md: aa16fa496e85e4a755c5d594b29bfda4b0255385641d6d18a3419086ee7f7e90
  model/daily-challenge/statistics.md: 8fcefbb60cb84966c0f04d9b3eb0575f330b6cc592ad16bf2e5fca6ac07f3c02
  model/result-sharing/result-share.md: 09ef6797bc3eee42210b173ee71fb736d8a78a9313e29d0a17193e9f2fe5ddc4
  requirements/data/local-data.md: c6bd93a32fcf952aa9a04d6214a33bad342c7e18c9b8daa70503a93b7dcec5a5
  requirements/quality/reliability.md: 7622ab2ae7838d50e4aea40fb9da4fd485f859054da8b7af0727f4eca3cdf142
  requirements/rules/gameplay.md: 104d16ebe1327a530a27077da52a7b24f36171e12306acff392ec8b4c266f592
  requirements/ui/interface.md: 45ee849ebeeb7541bbf8baa689fa7cbb59f392916a2e230efc9d44243c25d905
created: 2026-11-08T19:27:25.951Z
request: 2026-11-08T17-55-05
label: Vocabolario unico
job: pr2kme8z
---
# Vocabolario italiano unico

Le liste italiane attuali non contengono audio e ozono: la lacuna è nei dati, non nella normalizzazione. Il dizionario viene ampliato senza sostituire il controllo lessicale con eccezioni per singole parole.

## Decisioni
- Usare la lista italiana 660k della revisione upstream già fissata, insieme alle fonti attuali e a integrazioni documentate; includere AUDIO e OZONO.
- Usare esattamente lo stesso insieme per tentativi ammessi e possibili soluzioni, senza una selezione ridotta di soluzioni comuni.
- Ammettere forme flesse, parole rare e prestiti d'uso italiano; mantenere cinque lettere ASCII e la sola normalizzazione delle maiuscole.
- Ammettere anche parole volgari o offensive come tentativi e possibili soluzioni; non importare liste dedicate a nomi propri né dataset con licenza separata.
- Congelare e versionare una permutazione deterministica riproducibile dell'intero insieme, senza casualità o accessi di rete a runtime.
- Attivare il nuovo calendario nel giorno di Roma esplicito del rilascio; sostituire anche la sfida di quel giorno.
- Azzerare soltanto la partita e l'eventuale risultato del giorno di attivazione, anche se già conclusa; conservare date precedenti e preferenze.
- Conservare le regole su lettere già rivelate, modalità difficile, tentativi, tempi e punteggio; una parola nel dizionario non aggira tali vincoli.

Nessuna domanda saltata e nessuna decisione delegata implicitamente. La compatibilità dei giorni precedenti richiede di conservare il calendario storico; non viene azzerato lo storico completo.

## Impatto
- La fonte aggiunta è `paroleitaliane/660000_parole_italiane.txt` alla revisione `2951524b6d5b67986f542937cef16a54af63ff84`; la licenza dichiarata e il limite di provenienza restano documentati, senza promesse di esaustività.
- Il vecchio calendario resta disponibile soltanto per le date anteriori all'attivazione. Il nuovo calendario percorre una permutazione congelata dell'intero insieme comune.
- La sostituzione viene applicata prima di ripristino e scadenza anche se scoperta più tardi; non crea una sconfitta o una partita retroattiva.
- La sostituzione invalida anche il risultato condivisibile del vecchio gioco, senza pretendere di revocare contenuti già consegnati al sistema operativo.
- Quattro Tasks separano vocabolario/calendario, sostituzione della partita, statistiche e condivisione. Nessun cambio di tecnologia e nessuna modifica al codice applicativo fanno parte di questo job di design.
