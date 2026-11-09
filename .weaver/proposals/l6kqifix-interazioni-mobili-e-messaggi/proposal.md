---
status: approved
kind: change
base:
  model/daily-challenge/game-interface.md: ebf4ac7b091f5e3fe282f7739708387720b24029c488a72302497a9848a2a9cd
  requirements/quality/reliability.md: d68c7c81403299949a0bbbbf419457f53f6ca0900ea7943a61425b885c04de6c
  requirements/ui/interface.md: 9af2ae9d61935c5f01ae1569c89dc0edd61985b60b8a9fc1b61f995091f3afc3
  requirements/ui/panels.md: fe72998dddb3be44ae5d766d2254dc2eb2884532f09c523becd179a6b0dbe4b7
created: 2026-11-09T12:08:31.153Z
request: 2026-11-09T12-56-44
label: Esperienza mobile
job: m0dojpcg
---
# Interazioni mobili e messaggi

Ridurre zoom accidentale, scroll e messaggi macchinosi senza cambiare regole, punteggi o persistenza.

## Decisioni
- Bloccare doppio tap e pinch della pagina dove il browser lo consente; limite di accessibilità esplicitamente accettato, senza promettere il blocco dello zoom imposto dal browser.
- Schermata principale completa senza scroll da 320×568 CSS px con testo standard; scroll accessibile sotto tale altezza o con testo ingrandito. Pannelli con scroll interno invariato.
- Spostare introduzione e nota dati dal corpo alla guida; mantenere spiegazioni dati nelle impostazioni e statistiche.
- Evidenza statica del tasto premuto tramite bordo e ombra interna, senza cambiare i colori degli indizi.
- Tutti i tasti incorporati, incluso Invio: prima azione subito, ripetizione a 1000 ms e poi ogni 150 ms, nessuna azione aggiuntiva al rilascio. Tastiera fisica con ripetizione nativa.
- Una pressione attiva; arresto a rilascio, uscita dal tasto, annullamento, perdita del contesto, apertura pannello, cambio sfida, disabilitazione o rivelazione; nessuna ripresa automatica. Ridisegni ordinari non spezzano il gesto.
- Feedback brevi come toast, uno per volta per 4 secondi, sostituzione del precedente, chiusura accessibile e pausa su hover/focus; duplicati consecutivi senza raffiche di annunci.
- Toast sotto header, senza coprire tastiera o azioni; con pannello aperto unica presentazione al suo interno, inclusa condivisione. Nessun trasferimento del focus.
- Stati di acquisizione, rischi di salvataggio/coordinamento, riepilogo finale e testo per copia manuale restano persistenti.
- Italiano breve ma specifico, motivi di rifiuto distinti; esiti e soluzione solo dopo rivelazione. Tentativo accettato: solo annuncio accessibile, niente toast.
- Nessuna domanda saltata e nessuna nuova tecnologia.
