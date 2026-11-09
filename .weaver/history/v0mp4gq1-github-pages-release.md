---
created: 2026-11-08T15:10:33.071Z
updated: 2026-11-08T15:10:33.071Z
summary: Adds the TypeScript and Vite toolchain, automated checks, and GitHub Pages deployment.
tasks:
- vwh2bjk4
cleared:
  vwh2bjk4:
    title: Progetto e pubblicazione
    refs:
    - specs#languages
    - specs#frameworks
    - specs#data
    - specs#testing
    - specs#ci
    - specs#repository
    - specs#deployment
    - specs#cloud
    - specs#infrastructure
    - specs#notes
    - requirements/tech#General
    technical: true
    proposal: bw3m93rd
    label: ParoleCompetitive
    finished: 2026-11-08T15:05:15.757Z
    body: |-
      Predisporre il progetto reale completo per ParoleCompetitive: TypeScript strict, Vite, HTML, CSS e DOM senza framework UI. Usare npm con lockfile e una versione Node.js LTS supportata e coerente tra sviluppo e CI; scegliere versioni stabili compatibili senza riportare versioni non verificate. Separare regole pure da effetti DOM senza introdurre un secondo state store o astrazioni superflue. Rendere disponibili installazione, avvio locale, controllo tipi, test deterministici, build e smoke del sito compilato.

      Predisporre localStorage versionato per il contratto locale delle partite, preferenze ed esiti, e il caricamento delle liste italiane locali curate previste dalle altre Task. Nessun database, backend, account, cloud applicativo, anti-cheat, analytics, font remoto, PWA o service worker. Usare le API browser native: Intl per Europe/Rome, Canvas 2D per l'immagine senza lettere e Web Share/Clipboard con rilevamento capacità; niente libreria di screenshot dell'intera pagina.

      Usare Vitest per i test deterministici delle regole consumer-visible e Playwright per esercitare il sito realmente compilato. Configurare GitHub Actions su pull request e push a main: installazione da lockfile, tipi, test, build e smoke browser. La pubblicazione automatica deve seguire le verifiche riuscite e avvenire solo da main, con le azioni ufficiali di artifact e deploy Pages, environment GitHub e permessi minimi; le pull request non pubblicano. Non richiedere token di deploy esterni, Terraform, Bicep, funzioni serverless o altri file di infrastruttura cloud.

      Inizializzare Git nella cartella del progetto e creare automaticamente il repository pubblico ParoleCompetitive nell'account autenticato della GitHub CLI, branch main; collegare origin al repository reale, registrare il progetto e pubblicare il contenuto richiesto. All'inizio del setup la cartella non è un repository Git e GitHub CLI non è nel PATH: installazione di GitHub CLI e autenticazione autorizzata sono prerequisiti espliciti. Non inventare credenziali, remote, URL o successi; non sovrascrivere un repository o checkout esistente. Se manca un'identità autorizzata, un permesso o il nome è già occupato, completare tutto il lavoro raggiungibile e indicare esattamente il blocco della creazione/rilascio, senza sostituire la scelta con una creazione manuale dichiarata riuscita.

      Configurare Pages con sorgente GitHub Actions, relativo environment e base path del project site ParoleCompetitive. Asset e collegamenti devono funzionare sotto il prefisso del repository senza riscritture server. Escludere dal versionamento output generati, dipendenze, segreti e stato locale degli agenti, preservando le definizioni Weaver previste dal progetto.

      Documentare in inglese prerequisiti, comandi di sviluppo/verifica/build, installazione e autenticazione GitHub CLI, creazione e rilascio Pages, provenienza e limiti di licenza delle liste, algoritmo giornaliero, formula esatta del punteggio, regole difficile e downgrade, statistiche locali e limiti di storage, privacy e fallback condivisione; aggiungere un breve changelog iniziale. Non affermare che il dizionario o il gioco siano ufficiali. Le altre Task forniscono i contratti comportamentali: questa Task deve usare i moduli reali, non sostituirli con mock o schermate dimostrative.

      Verifica: eseguire i comandi reali di tipi, regole, build e smoke e aprire il sito compilato servito sotto il prefisso Pages, osservando asset e interazione. Dove credenziali e permessi sono disponibili, osservare anche repository creato, esito della pipeline e sito Pages pubblicato, riportando soltanto URL ed esiti reali. Un limite di autenticazione esterna va dichiarato, non trasformato in una verifica positiva.
---
# GitHub Pages release

Configures the project-site base path, reproducible npm installation, strict type checking, deterministic and built-site browser checks, documentation, and verified deployment from main.
