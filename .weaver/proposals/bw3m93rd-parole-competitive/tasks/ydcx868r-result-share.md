---
technical: false
refs:
  - result-share
  - requirements/data#result-share
  - requirements/ui#result-share
  - requirements/quality#result-share
---
# Condivisione risultati

Realizzare una condivisione ripetibile di un risultato vinto o perso, disponibile solo dopo la rivelazione del feedback finale. Preparare una presentazione privata del risultato senza modificare partita, stato, progressi, timestamp, punteggio o totali. La partita completata del giorno corrente, anche se ripristinata alla riapertura, resta condivisibile; le partite incompiute scadute non espongono un'azione di condivisione.

L'immagine esportata è una scheda PNG dedicata, mai uno screenshot della pagina: mostra titolo, data della sfida, esito, tentativi usati su sei, punteggio e griglia di sei righe per cinque caselle. Le caselle non usate sono neutre. Non esportare lettere, soluzione, tastiera, testo DOM nascosto, testo alternativo contenente tentativi o metadati della soluzione. Costruire sia immagine sia testo da uno snapshot del risultato completato dopo la rivelazione.

La preferenza spoiler-free è attiva per impostazione predefinita ed è modificabile. Quando attiva, l'intera prima riga è neutra in PNG e testo, senza colori verdi, gialli o grigi che rivelino informazioni; il testo usa segnaposto neutri. Quando disattiva, la prima riga conserva i colori del feedback, ma non le lettere, anche nel testo. Le altre righe presentano i colori del risultato senza lettere.

Quando il file immagine può essere condiviso nativamente sul dispositivo, offrirlo tramite il pannello di condivisione nativo; verificare effettivamente il supporto alla condivisione di file e conservare l'attivazione dell'utente necessaria all'apertura del pannello, preparando l'immagine prima del gesto quando occorre. Non dichiarare che il risultato è stato consegnato a un destinatario. Se la condivisione immagine non è supportata, usare il testo equivalente negli appunti; se gli appunti non sono disponibili o l'accesso è negato, mostrare lo stesso testo per la copia manuale e indicare in italiano che la copia automatica non è riuscita. Comunicare in italiano successi ed errori significativi.

La chiusura del pannello nativo è una cancellazione silenziosa: non avvia copia negli appunti né download PNG. Un errore di preparazione, condivisione o copia è distinto dalla cancellazione e dall'indisponibilità del supporto; segnalare l'errore senza alterare il risultato e consentire un nuovo tentativo. Non scaricare automaticamente il PNG come fallback.

Verificare la reale esportazione ispezionando pixel o contenuto disegnato: nessuna lettera della soluzione o dei tentativi deve comparire e, con spoiler-free attivo, tutte le caselle della prima riga devono essere completamente neutre. Verificare la capacità di condivisione nativa, il fallback testuale, il diniego degli appunti con copia manuale, la cancellazione e gli errori generici; non basta controllare che sia stata chiamata un'API. Osservare il comportamento reale in browser o dispositivo compatibile quando disponibile, documentando i limiti specifici di verifica senza affermare che il risultato sia stato consegnato.