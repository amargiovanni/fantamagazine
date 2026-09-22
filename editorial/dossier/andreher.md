# Dossier — AnDreher

<!--
  Compilato dal numero 1 (speciale insediamento, 20 agosto 2026). Ogni riga di
  questo file risale a `data/2026-27/league.json`, `data/2026-27/rosters.json` o
  a `content/2026-27/issue-001/`. Si aggiorna nello stesso commit del numero.
-->

## Anagrafica fantacalcistica

| Campo | Valore |
|---|---|
| **Squadra** | GinTonici |
| **Presidente** | AnDreher |
| **`teamId`** | `8775876` |
| **Motto ufficiale** | nessuno agli atti |
| **Motto attribuito da questa testata** | «Non ho crediti, ho possibilità.» |
| **Prima comparsa** | numero 1 |

## Soprannomi

| Soprannome | Origine | Numero |
|---|---|---|
| **il Banchiere** | 337 crediti lasciati in cassa a fine asta, il tesoretto più grande della lega e il 33,7% della propria dotazione mai impiegato | 1 |
| **l'Uomo dei Settantotto** | alla giornata 2 fa 78 fantapunti e perde 3-4, lo stesso identico punteggio con cui Squadra 9 vince 3-0 nello stesso pomeriggio | 4 |

## Running joke attivi

### Il tesoretto dei 337

- **Nato nel numero:** 1
- **Stato:** in osservazione
- **Il fatto d'origine:** asta 2026-27: 663 crediti spesi su 1000, residuo 337, il più alto della lega (`league.json`)
- **Come si usa:** si cita ogni volta che serve un metro per una spesa altrui, e ogni volta che il presidente si lamenta di qualcosa
- **Ultimo utilizzo:** numero 6
- **Note:** nasce con il numero 1; alla quarta ripresa consecutiva passa in
  osservazione e va rinnovato da un dato nuovo (style-guide §10).
- **Note:** quarto utilizzo consecutivo nel numero 5 (i 337 sono intatti dopo tre giornate e la prima vittoria). Nessun fatto nuovo lo rinnova: passa in **osservazione**, torna il giorno in cui un credito si muove.
- **Note:** ripreso nel numero 6, lo speciale di metà settimana scritto sui dati della giornata 1.

### Il portiere da un credito

- **Nato nel numero:** 3
- **Stato:** attivo
- **Il fatto d'origine:** giornata 1: in porta Stankovic F., 1 credito, fantavoto 3,5 (secondo più basso della lega); in panchina Svilar, 100 crediti, fantavoto 7; Malen fa 18,5, il più alto della giornata (`matchday-01/lineups.json`)
- **Come si usa:** il Banchiere considera il portiere titolare «un costo fisso, e i costi fissi sono quelli da un credito»; si richiama ogni volta che Svilar resta in panchina
- **Ultimo utilizzo:** numero 6
- **Note:** ribaltato alla giornata 2: Svilar titolare a 7,5, secondo miglior portiere della giornata, con Stankovic F. in panchina a 4,5 e Okoye a 4. Il fatto d'origine non esiste più. Passa in **osservazione**: torna solo se il portiere da un credito torna in porta (§10).

### I settantotto che valgono zero

- **Nato nel numero:** 4
- **Stato:** attivo
- **Il fatto d'origine:** giornata 2: GinTonici 78 fantapunti, sconfitta 3-4 con il COCA JUNIORS; Squadra 9 fa gli stessi 78 e vince 3-0 (`matchday-02/results.json`)
- **Come si usa:** il 78 è l'unità di misura della giustizia in questa lega: «ne ha fatti abbastanza per vincere, contro chiunque altro»
- **Ultimo utilizzo:** numero 6
- **Note:** nasce insieme alla correzione riuscita e inutile del portiere: il Banchiere ha fatto la cosa giusta e ha perso, ed è il motivo della sua Sconfitto della Settimana.
- **Note:** rinnovato alla giornata 3: vince 2-0 con 73, il punteggio più basso dei quattro vincitori, una settimana dopo aver perso con 78. Coppa del Vincitore Involontario del numero 5: «ha preso tre punti al ribasso».
- **Note:** nel numero 6 il Casellario ribalta la dichiarazione del numero 1 («i soldi fermi non rendono»): 11,5 fantapunti ogni cento crediti, il rendimento migliore della lega; «i soldi fermi non rendono, i portieri fermi sì».

## Premi vinti

| Premio | Numero | Motivazione |
|---|---|---|
| Lo Sconfitto della Settimana | 4 | Settantotto fantapunti, gli stessi con cui Squadra 9 ha vinto 3-0 nello stesso pomeriggio, e sconfitta per 3-4: un punto in due giornate con il quinto totale della lega, 154. |
| La Coppa del Vincitore Involontario | 5 | Vittoria per 2-0 con 73 fantapunti, il punteggio più basso tra i quattro vincitori della terza giornata, una settimana dopo aver perso con 78. |

## Precedenti notevoli

| Giornata | Il fatto | Fonte |
|---|---|---|
| Asta 2026-27 | 337 crediti residui, il tesoretto più grande della lega | `league.json` |
| Asta 2026-27 | 263 punti di quotazione acquistati per 663 crediti, contro i 980 spesi dal J medical per gli stessi 263 punti | `rosters.json` |
| Asta 2026-27 | 98 crediti per otto centrocampisti, la spesa di centrocampo più bassa della lega | `rosters.json` |
| Asta 2026-27 | Malen pagato 296 crediti, quotazione 34, valore a coefficiente 119 | `rosters.json` |
| Asta 2026-27 | Pavlovic pagato 1 credito contro un valore a coefficiente di 49, il miglior affare assoluto dell'asta | `rosters.json`, pubblicato nel numero 1 |
| Asta 2026-27 | Petagna, uno dei due giocatori della lega con l'asterisco di fuori listino, pagato 1 credito | `rosters.json`, pubblicato nel numero 1 |
| Bombe di Tancredi Soffiata | Svilar per Thuram, e Malen più 31 crediti per Yildiz: il Banchiere paga per comprarsi il sovrapprezzo record dell'asta — scambio inventato, cifre vere; stato `lanciata` in `editorial/bombe.json` | `content/2026-27/issue-001/bombe.md` |
| Giornata 1 | Pareggio 2-2 con il Borussia Addurmt, 76 a 75,5; quarto in classifica | `matchday-01/results.json`, `standings.json` |
| Giornata 1 | Malen 18,5, il fantavoto più alto della giornata (16 crediti per fantapunto); Stankovic F. 3,5 in porta con Svilar a 7 in panchina; Molina N. senza voto | `matchday-01/lineups.json` |
| Giornata 1 | Fantamedia del Rimorso migliore della lega: 11,5 fantapunti ogni 100 crediti spesi | `content/2026-27/issue-003/classifiche.md` |
| Giornata 1 | Bombe: cede Svilar per Corvi più 95 crediti, e Malen per Pulisic più 136: arriverebbe a 568 crediti in cassa — scambi inventati, cifre vere; stato `lanciata` | `content/2026-27/issue-003/bombe.md` |
| Giornata 2 | Sconfitta 3-4 con il COCA JUNIORS, 78 a 84,5: gli stessi 78 con cui Squadra 9 vince 3-0; settimo con 1 punto e 154 fantapunti, quinto totale della lega | `matchday-02/results.json`, `standings.json` |
| Giornata 2 | Svilar (100 crediti) finalmente titolare, 7,5, secondo miglior portiere della giornata; Stankovic F. (1) 4,5 e Okoye (19) 4 in panchina | `matchday-02/lineups.json` |
| Giornata 2 | Malen 14,5, il fantavoto più alto tra i titolari della lega per la seconda giornata consecutiva; Jimenez A. (15) 4, peggior titolare; Rowe (36) senza voto | `matchday-02/lineups.json` |
| Giornata 2 | Sconfitto della Settimana del numero 4: ha corretto l'unico errore che gli veniva contestato e ha perso lo stesso | `content/2026-27/issue-004/rubrica-fissa.md` |
| Giornata 3 | Vittoria 2-0 sull'Aston pirla con 73, il più basso dei quattro vincitori; quinto con 4 punti e 227 fantapunti | `matchday-03/results.json`, `standings.json` |
| Giornata 3 | Modulo cambiato dal 4-4-2 al 4-3-3; Svilar (100) 5; Politano (13) 9,5 miglior titolare; Malen (296) 6; Jimenez A. senza voto; Stankovic F. 3 e Okoye 4 in panchina | `matchday-03/lineups.json` |
| Giornata 3 | Segno d'oroscopo nel numero 5; nessuna bomba a suo carico | `content/2026-27/issue-005/rubrica-fissa.md` |
| Numero 6 | Casellario delle dichiarazioni: «i soldi fermi non rendono» smentita dai propri risultati (11,5 fantapunti ogni cento crediti, il migliore della lega); pagella delle rose 5,5 | `content/2026-27/issue-006/approfondimento-casellario.md`, `mercato.md` |
| Numero 6 | Bomba: riceve Leao e Berardi (163 crediti) per Stankovic F. (1 credito, 3,5): arriva a otto attaccanti e resta a 337 in cassa — scambio inventato, cifre vere; stato `lanciata` | `content/2026-27/issue-006/bombe.md` |

## Materiale inutilizzato

- Scarto complessivo sul coefficiente: −261 crediti, di gran lunga il migliore della lega — `content/2026-27/issue-001/approfondimento-asta.md` — *ancora buono per:* il giorno in cui vince, perché «nessuno arriva primo con le mani pulite» (§3).
- Svilar pagato 100 crediti: reparto portieri da 120, secondo della lega alla pari con il COCA JUNIORS e dietro ai 132 del J medical — `rosters.json` — *ancora buono per:* una classifica.
- Coefficiente della porta 13,3 alla giornata 2 (100 crediti diviso 7,5): terzo peggiore della lega pur avendo il secondo miglior portiere di giornata — `content/2026-27/issue-004/classifiche.md` — *ancora buono per:* una statistica della vergogna.
- I 337 crediti sono intatti dopo due giornate e quattro bombe che ne prevedevano il movimento — `editorial/bombe.json` — *ancora buono per:* il giorno in cui li spende, che va celebrato come un evento nazionale.
- Svilar 7 (panchina), 7,5, 5: il portiere da cento crediti rende meno ogni domenica in cui gioca — `matchday-0*/lineups.json` — *ancora buono per:* il pezzo sui portieri, seconda puntata.
