---
technical: false
refs:
  - daily-word
  - requirements/data#daily-word
  - requirements/rules#daily-word
  - requirements/quality#daily-word
---
# Vocabolario e calendario

Il vocabolario canonico è l'unione delle fonti comuni e da 60.000 parole già presenti, della lista italiana da circa 660.000 parole di napolux/paroleitaliane fissata alla revisione `2951524b6d5b67986f542937cef16a54af63ff84` e delle aggiunte locali documentate e revisionate. Include AUDIO e OZONO e ogni parola già ammessa come tentativo. La normalizzazione conserva solo voci di esattamente cinque lettere ASCII in maiuscolo, deduplicate e ordinate in modo riproducibile; non elimina accenti, traslittera né introduce eccezioni legate all'input. Le aggiunte hanno provenienza e decisioni editoriali registrate.

La lista non è ufficiale, autorevole, esaustiva né garantita legalmente; resta esplicita l'incertezza di provenienza presente a monte. Non si importano liste dedicate di nomi propri, il dataset separato di coniugazioni con licenza CC-BY-SA, né aggregati che includano tali dataset sotto una dichiarazione di sola licenza MIT. Si registrano percorsi esatti delle fonti, data di acquisizione, checksum, trasformazioni e attribuzione MIT pertinente. Non si copiano codice, grafica o calendario del gioco non ufficiale Par🇮🇹le.

Il vocabolario canonico è esattamente sia l'insieme dei tentativi ammessi sia quello delle soluzioni eleggibili per il nuovo calendario: non resta attivo un sottoinsieme ridotto di soluzioni comuni. Sono ammesse forme flesse italiane, parole rare, prestiti d'uso italiano e termini volgari o offensivi. Si escludono voci malformate, non italiane ed esclusivamente nomi propri; un significato italiano normale basta anche se la voce è usata anche come nome, e la sola maiuscola iniziale non prova che sia un nome proprio.

Per il nuovo calendario si genera e si congela una permutazione deterministica che contiene ogni voce canonica esattamente una volta. Sono registrati identità della pianificazione, algoritmo, seme fisso, impronta riproducibile dell'output e data di attivazione esplicita in Europe/Rome. A runtime sono inclusi soltanto vocabolario normalizzato e pianificazione congelata; snapshot originali, aggiunte e provenienza, istruzioni di generazione e ordine storico delle soluzioni v1 restano nel repository. Il gioco caricato non richiede fetch delle fonti né rete.

Il giorno è la data del calendario gregoriano in Europe/Rome, indipendente dal fuso scelto sul dispositivo e rispettosa dell'ora legale; a parità di data e pianificazione distribuita, tutti ricevono la stessa parola. Dalla data esplicita di attivazione in poi, la parola è selezionata all'offset non negativo di giorni Rome dall'attivazione, modulo la lunghezza della permutazione congelata. La permutazione attraversa l'intero insieme comune prima di ricominciare. Nessuna selezione casuale o ricalcolo di data o seme avviene all'apertura, al refresh o alla ricostruzione. Non si usa un feed runtime, scraping o API, né si dichiara affiliazione ufficiale con Wordle.

La data di attivazione è la data Europe/Rome esplicitamente fissata per il rilascio che introduce la nuova pianificazione, mai una data ricalcolata a ogni apertura o ricostruzione. Per le date anteriori restano identici epoch, algoritmo, ordine, identità e assegnazioni v1: modificare lunghezza o ordine v1 non deve spostarne le parole. Nel giorno di attivazione la nuova pianificazione sostituisce la sfida precedente per tutti, anche per chi l'ha già completata; si ritirano soltanto progresso e risultato di quella sfida, senza conteggiarla come sconfitta, e si offre una sola nuova partita vuota. Date anteriori e preferenze restano invariate. Riapplicare la sostituzione non ritira né azzera progresso o risultato della nuova sfida.

Alla riapertura dopo assenza, al ritorno di visibilità e al confine giornaliero mentre l'app è visibile, la riconciliazione applica ogni sostituzione di calendario ancora dovuta prima della normale scadenza. Anche dopo più giorni di assenza non inventa partite per i giorni intermedi: scadono le altre partite precedenti ancora incomplete e viene mostrata la sfida corrente. Le future modifiche di calendario conservano le assegnazioni di questo rilascio e richiedono una propria data di attivazione esplicita concordata.

La verifica dimostra determinismo per la stessa data Rome, al cambio di mezzanotte e nei due cambi di ora legale, al ritorno dopo un confine mancato e attraverso ricostruzioni che devono conservare la parola pubblicata. Usa il vocabolario reale incluso: `AUDIO` e `OZONO` sono valide sia come tentativi sia come soluzioni, così come esempi rappresentativi di forme flesse, prestiti e termini rari delle fonti scelte. Verifica che la permutazione congelata coincida esattamente con il canonico, senza omissioni, duplicati o candidati extra, e che generazione da input fissati e seme fisso sia riproducibile. Verifica assegnazioni storiche v1 prima dell'attivazione, voce del giorno di attivazione e date successive; verifica inoltre persistenza delle date precedenti, preferenze, progresso e risultati non interessati, e idempotenza della sostituzione anche dopo un confine mancato. La fonte ampia non diventa un payload runtime integrale non filtrato e nessun accesso runtime richiede rete.

## Code notes

Commit: 1770a5c6563f12fb3eee9bb54daef1c02993c6f6

- `src/daily-word.ts` importa `allowedWords` e `solutionsV1`: i tentativi sono un `Set`, mentre la selezione giornaliera indicizza la lista v1 congelata con epoch `2026-01-01`.
- `scripts/generate-words.mjs` legge le fonti comuni e da 60k e `data/solutions-v1.txt`; `normalize` filtra esattamente cinque lettere ASCII, converte in maiuscolo, deduplica e ordina. `src/word-data.ts` è generato, non modificato a mano.
- `data/README.md` registra revisione, trasformazioni, caveat di licenza e calendario v1 immutabile. Cambiarne lunghezza o ordine sposta le assegnazioni: conservarlo per le date precedenti al taglio.
- `tests/daily-word.test.ts` verifica forma/inclusione e rigenerazione, ma non casi del vocabolario reale; i test sintetici non rilevano omissioni di `AUDIO` e `OZONO`.
- La revisione upstream fissata contiene `paroleitaliane/660000_parole_italiane.txt` (blob `4d8dfa693a1c61d11987bbf28929558cc945418f`); le voci grezze non sono state ispezionate. Escludere `coniugazione_verbi.txt`, separatamente licenziato. Le fonti presenti omettono AUDIO e OZONO; la normalizzazione le accetterebbe se incluse.
