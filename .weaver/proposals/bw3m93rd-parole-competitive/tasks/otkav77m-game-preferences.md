---
technical: false
refs:
  - game-preferences
  - requirements/rules#game-preferences
  - requirements/data#game-preferences
  - requirements/ui#game-preferences
---
# Preferenze di gioco

Offrire le preferenze di difficoltà standard e hard e di condivisione spoiler-free. Il valore iniziale è standard; spoiler-free è inizialmente attivo. Persistire entrambe le preferenze tra i giorni, indipendentemente dai risultati immutabili delle partite completate. Rendere le impostazioni comprensibili, spiegando i minimi di occorrenze duplicate osservate in hard, il bonus hard del 10% e la perdita irrevocabile del bonus in caso di downgrade. La condivisione spoiler-free nasconde il feedback del primo tentativo nei contenuti condivisi; si può modificare in qualsiasi momento e influenza solo le condivisioni successive, mai punteggio o risultati precedenti.

Prima del primo tentativo accettato, consentire il cambio di difficoltà in entrambe le direzioni; un tentativo rifiutato non blocca la scelta. Dopo l’avvio di una partita, consentire hard→standard e impedire standard→hard, disabilitando la scelta vietata e spiegandone il motivo. Il downgrade durante una partita incompleta rimuove le restrizioni hard e revoca definitivamente l’idoneità al bonus di quella partita, insieme all’aggiornamento della preferenza futura. Non ripristinare il bonus se la difficoltà torna hard. Il bonus 1.10 si applica soltanto a una partita iniziata hard e mai degradata; altrimenti il moltiplicatore è 1. Dopo la conclusione della partita, consentire di selezionare entrambe le difficoltà per la partita futura: tale modifica non altera difficoltà, punteggio o statistiche della partita completata. La nuova partita del giorno acquisisce la preferenza allora selezionata.
