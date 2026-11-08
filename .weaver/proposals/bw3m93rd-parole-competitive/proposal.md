---
status: approved
kind: setup
base:
  model/actors/calendar.md: new
  model/actors/player.md: new
  model/daily-challenge/daily-game.md: new
  model/daily-challenge/daily-word.md: new
  model/daily-challenge/feature.md: new
  model/daily-challenge/statistics.md: new
  model/preferences/feature.md: new
  model/preferences/game-preferences.md: new
  model/result-sharing/feature.md: new
  model/result-sharing/result-share.md: new
  model/system.md: 9ec8f01c229071e47b223b4d70045bb1016eea995cdc2e93c1914343d6c669c8
  requirements/data/local-data.md: new
  requirements/quality/reliability.md: new
  requirements/rules/gameplay.md: new
  requirements/tech/platform.md: new
  requirements/ui/interface.md: new
  specs.yaml: new
created: 2026-11-08T13:43:54.957Z
request: 2026-11-08T14-00-01
label: ParoleCompetitive
job: i8s65dgr
---
# Parole competitive

Avvia ParoleCompetitive con un progetto statico completo: partita giornaliera italiana, punteggio, statistiche locali, impostazioni e condivisione senza lettere.

## Decisioni
- Partita italiana di sei tentativi da cinque lettere; vittoria possibile anche al sesto, sconfitta dopo sei errori.
- Solo GitHub Pages: nessun backend, account, servizio cloud applicativo o verifica anti-manomissione; utenti considerati affidabili.
- TypeScript e Vite, DOM e CSS senza framework UI.
- Creazione automatica del repository pubblico ParoleCompetitive nell'account autenticato della GitHub CLI, branch main; nessuna sovrascrittura di repository esistenti.
- GitHub Actions verifica tipi, regole deterministiche, build e smoke browser e pubblica automaticamente Pages da main; nessun Terraform o altra infrastruttura cloud.
- Liste locali curate da una snapshot di napolux/paroleitaliane, con attribuzione MIT, provenienza documentata e revisione; dizionario dei tentativi distinto dalle soluzioni comuni. Nessuna fonte italiana ufficiale individuata dalla ricerca; nessuna pretesa di sincronizzazione con Wordle o Par🇮🇹le.
- Parola uguale per tutti secondo Europe/Rome, inclusa ora legale; selezione autonoma deterministica senza rete.
- Una partita al giorno nel browser/dispositivo; avanzamento e preferenze in localStorage, ripresa dopo chiusura, esito non rigiocabile.
- Al cambio giorno la partita precedente scade; se aveva almeno un tentativo valido, conta una sconfitta a zero punti una sola volta; giorni mai iniziati esclusi.
- Solo parole italiane di cinque lettere A–Z nel dizionario; maiuscole equivalenti; esclusi accenti e nomi propri. Invii incompleti, sconosciuti o vietati non consumano tentativi e non avviano il tempo.
- Tastiere QWERTY incorporata e fisica equivalenti, con Invio e cancellazione; indizi cumulativi verde > giallo > grigio. Lettere sicuramente assenti non inseribili in entrambe le modalità; un doppione grigio non annulla un indizio positivo.
- Valutazione dei doppioni: verdi prima, gialli sulle sole occorrenze residue, grigi oltre la disponibilità.
- Tempo continuo dal primo tentativo valido all'invio conclusivo, comprese chiusure della pagina; animazione esclusa dal tempo conclusivo.
- Punteggio: t secondi, n tentativi, ΔG e ΔY incrementi positivi dei conteggi rispetto alla riga precedente (inizialmente zero); s cresce senza miglioramenti e si azzera se crescono verdi o gialli. B=1000+Σ(100·ΔG+40·ΔY−50·max(0,s−1)); vittoria=round(max(0,B)/(n·(1+t/60))); sconfitta e scadenza=0.
- Difficile: verdi fissi, gialli obbligatori fuori dalle posizioni escluse e minimo di ripetizioni pari al massimo verde+giallo osservato nella stessa riga, senza usare quantità segrete.
- Difficile disattivato di default; prima dell'avvio cambi liberi, durante la partita solo difficile→facile; il downgrade perde il bonus e non consente il ritorno a difficile. Dopo l'esito i cambi riguardano solo le preferenze future.
- Bonus difficile confermato nella risposta libera: moltiplicatore 1,10 sul punteggio non arrotondato di una vittoria interamente difficile, poi unico arrotondamento; mai bonus a sconfitte/scadenze.
- Statistiche locali: vittorie, sconfitte, distribuzione delle vittorie in 1–6 tentativi e punteggio dell'ultima partita; nessuna classifica tra persone o storico ordinato.
- Protezione spoiler attiva di default, sempre modificabile; nell'immagine e nel testo condivisi neutralizza completamente la prima riga.
- A partita conclusa condivisione nativa di un'immagine del risultato con griglia colorata, giorno, esito e punteggio, senza lettere, tastiera o soluzione; non screenshot completo della pagina.
- Se la condivisione nativa di file manca, copia di testo con griglia colorata senza lettere; nessun download PNG automatico. L'annullamento del dialogo non innesca fallback.
- UI italiana essenziale responsive mobile/desktop, titolo ParoleCompetitive, griglia 6×5, tastiera sottostante, impostazioni, risultato e statistiche; animazione rispettosa di reduced-motion.
- Sito statico senza PWA, service worker o garanzia di avvio offline; dopo il caricamento non occorre rete per giocare.

## Vincoli operativi rilevati
- La cartella non è un repository Git e non contiene codice applicativo.
- GitHub CLI non è disponibile nel PATH corrente: installazione e autenticazione autorizzata sono prerequisiti espliciti della Task di creazione GitHub, non sostituibili con un remote fittizio.
- La licenza MIT del dizionario candidato non elimina l'incertezza sulla provenienza di alcune liste; la revisione e la documentazione non devono dichiarare una fonte ufficiale o una garanzia legale.

## Fonti esaminate
- https://help.nytimes.com/en_US/360011158491-New-York-Times-Games/24611727334932-Wordle — descrizione ufficiale del gioco originale, non feed italiano.
- https://github.com/pietroppeter/wordle-it — versione italiana dichiarata non ufficiale.
- https://github.com/napolux/paroleitaliane — liste candidate, MIT dichiarata e avviso su provenienze in parte ignote.

Nessuna domanda saltata; nessuna decisione delegata tacitamente. Le scelte tecniche di dettaglio dell'agente sono motivate nelle Specs. Ogni Task registra i criteri applicabili senza richiedere accesso all'intervista.
