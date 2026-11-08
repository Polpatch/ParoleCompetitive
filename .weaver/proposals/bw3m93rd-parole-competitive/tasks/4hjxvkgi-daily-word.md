---
technical: false
refs:
  - daily-word
  - requirements/rules#daily-word
  - requirements/data#daily-word
  - requirements/quality#daily-word
---
# Parola giornaliera

Fornire una sfida giornaliera condivisa per data, ripristinando la partita del giorno quando il dispositivo torna e creando una nuova partita quando cambia il giorno. Stabilire la data secondo il calendario gregoriano nel fuso IANA Europe/Rome, indipendentemente dal fuso scelto sul dispositivo e includendo i cambi DST.

Usare una lista locale stabile e revisionata di soluzioni italiane di cinque lettere, distinta dal dizionario più ampio delle parole ammesse nei tentativi. Includere localmente tutti i dati necessari; non usare feed, scraping o API runtime e non presentare la lista come fonte ufficiale o come affiliata a Wordle.

Distribuire una snapshot fissata del progetto napolux/paroleitaliane, registrandone revisione upstream esatta, file sorgente, data di acquisizione, trasformazioni e attribuzione MIT. La provenienza upstream è in parte ignota: dichiarare esplicitamente tale limite e non affermare garanzie legali o autorevolezza. Escludere i dati di coniugazione separati sotto CC-BY-SA e non attribuirli alla licenza MIT. Non copiare codice, grafica o calendario giornaliero di Par🇮🇹le.

Normalizzare e deduplicare l'elenco di tentativi ammessi limitandolo a cinque lettere ASCII; costruire le soluzioni dalla lista di parole comuni, senza liste di nomi propri. Revisionare l'elenco più piccolo per escludere nomi, forme oscure o non italiane, termini offensivi e parole malformate; documentare forme mantenute e decisioni editoriali. Conservare dati sorgente, versione del calendario delle soluzioni e istruzioni di trasformazione riproducibili: non sostituire i dati reali con fixture dimostrative.

Fissare epoca, ordinamento delle soluzioni e algoritmo deterministico che assegna una soluzione a ogni data di Europe/Rome. Aperture, refresh e rebuild non devono randomizzare la parola. Aggiornamenti futuri delle liste devono preservare le assegnazioni già pubblicate e la soluzione del giorno corrente.

Riconciliare la data all'apertura, al ritorno della pagina visibile e al confine di giornata mentre la pagina è visibile. Al cambio, scadere la partita precedente non conclusa prima di offrire e annunciare la nuova sfida; dopo più giorni di assenza riconciliare direttamente col giorno corrente senza inventare sconfitte per giorni intermedi non giocati. La stessa data e lo stesso calendario distribuito devono offrire la stessa parola.

La verifica deve coprire determinismo per la stessa data di Roma, mezzanotte, entrambi i cambi DST, ritorno dopo un confine mancato e conservazione della parola già pubblicata attraverso un rebuild.