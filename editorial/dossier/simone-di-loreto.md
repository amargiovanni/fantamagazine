# Dossier — Simone Di Loreto

<!--
  Compilato dal numero 1 (speciale insediamento, 20 agosto 2026). Ogni riga di
  questo file risale a `data/2026-27/league.json`, `data/2026-27/rosters.json` o
  a `content/2026-27/issue-001/`. Si aggiorna nello stesso commit del numero.
-->

## Anagrafica fantacalcistica

| Campo | Valore |
|---|---|
| **Squadra** | Squadra 9 |
| **Presidente** | Simone Di Loreto |
| **`teamId`** | `7231597` |
| **Motto ufficiale** | nessuno agli atti |
| **Motto attribuito da questa testata** | «Il nome viene dopo.» |
| **Prima comparsa** | numero 1 |

## Soprannomi

| Soprannome | Origine | Numero |
|---|---|---|
| **il Presidente delle Sei Offerte** | sei offerte depositate per Calhanoglu (Atletico Piedini, 160 crediti) con zero crediti in cassa, tutte respinte con la stessa parola: «Lautaro» — offerte inventate, cifre vere | 4 |
| **il Presidente Senza Insegna** | la squadra si chiama «Squadra 9», il nome che il sistema aveva già nella casella: nove presidenti su dieci ne hanno scelto uno, il decimo no | 1 |

## Running joke attivi

### La squadra senza nome

- **Nato nel numero:** 1
- **Stato:** in osservazione
- **Il fatto d'origine:** `league.json`: `teams[].name` vale «Squadra 9», unica denominazione non personalizzata delle dieci della lega
- **Come si usa:** si usa solo sul nome della squadra, mai sulla persona: il nome è una scelta del presidente e rientra nei bersagli leciti (§3)
- **Ultimo utilizzo:** numero 4
- **Note:** quarto utilizzo consecutivo nel numero 4 (nato nel 1, ripreso nei numeri 2, 3 e 4): passa in osservazione per la regola del tre (style-guide §10) e torna solo se un dato nuovo lo rinnova.

### Il campione designato

- **Nato nel numero:** 2
- **Stato:** attivo
- **Il fatto d'origine:** l'editoriale del numero 2 protocolla la sentenza che
  circola nella lega — «Tanto alla fine vince Squadra 9» — e la trasforma in
  previsione agli atti, appoggiata ai numeri della rosa: 982 crediti spesi,
  623 su due attaccanti, +246 di sovrapprezzo su Yildiz
  (`content/2026-27/issue-002/editoriale.md`, `rosters.json`)
- **Come si usa:** ogni risultato di Squadra 9 si legge contro la profezia: una
  vittoria «conferma quanto già deliberato dalla lega», una sconfitta «apre
  un'istruttoria sul titolo assegnato ad agosto»
- **Ultimo utilizzo:** numero 4
- **Note:** alla giornata 1 la profezia si avvera (6-2, 91 fantapunti) ma con Yildiz 5,5 e Martinez L. 5: fatto nuovo che rinnova il tormentone. Nel numero 4 la lega aggiunge una parola, «vince *ancora* lui», registrata dall'editoriale come dichiarazione della lega e non come fatto: nessun titolo passato risulta in `data/`. Trappola a orologeria: se Squadra 9 non vince, la profezia è un Nostradamus al Contrario per la lega che l'ha pronunciata.

### Il Turco, ovvero il nono dell'Inter

- **Nato nel numero:** 4
- **Stato:** attivo
- **Il fatto d'origine:** `rosters.json`: otto giocatori dell'Inter su venticinque in rosa (Bisseck, Spence, Pavard, Sucic P., Diouf, Zielinski, Bonny, Martinez L.), nessun'altra rosa ne ha più di cinque; Calhanoglu (Inter) è dell'Atletico Piedini a 160 crediti, quotazione 27, valore a coefficiente 95, 9,5 alla giornata 1; l'oroscopo del numero 1 consigliava «prendi il nono»; Squadra 9 ha zero crediti (`league.json`) e l'intero centrocampo le è costato 136 crediti, meno dei 160 del solo Calhanoglu
- **Come si usa:** il presidente lo chiama «il Turco» seguito da un'espressione che questa testata riporta solo come citazione sua, con la sua ortografia («dimmerda», una parola): il bersaglio è l'ossessione di mercato, mai il calciatore; l'unica contropartita che gli viene chiesta è Martinez L. (296) ed è l'unica che non offre («Lautaro è il progetto»); Madame Panchinska rivendica la paternità del consiglio; si riapre a ogni voce di mercato, a ogni voto di Calhanoglu e a ogni voto di Martinez L.
- **Ultimo utilizzo:** numero 4
- **Note:** bersaglio principale del numero 4 (titolo di apertura): non può esserlo nel numero 5. Il numero chiuso: portieri 60 + difensori 131 + centrocampisti 136 = 327 crediti, esattamente il prezzo di Yildiz (`rosters.json`).

## Premi vinti

| Premio | Numero | Motivazione |
|---|---|---|
| — | — | Nessuno. I premi del §8 si calcolano sui risultati di una giornata e al numero 1 non ne è stata giocata nessuna. |

## Precedenti notevoli

| Giornata | Il fatto | Fonte |
|---|---|---|
| Asta 2026-27 | 623 crediti su 982 (63%) per due soli attaccanti: Yildiz 327 e Martinez L. 296 | `rosters.json` |
| Asta 2026-27 | Yildiz pagato 327 crediti, quotazione 23, valore a coefficiente 81: il sovrapprezzo assoluto più alto dell'asta (+246) | `rosters.json` |
| Asta 2026-27 | Otto giocatori dell'Inter su venticinque | `rosters.json` |
| Asta 2026-27 | Bilancio d'asta di 982 crediti contro i 1000 di dotazione, zero residui | `league.json`, `rosters.json` |
| Asta 2026-27 | Martinez L., quotazione 35 e la più alta della rosa, pagato 296: trentuno crediti meno di Yildiz, che ne quota 23 | `rosters.json`, pubblicato nel numero 1 |
| Asta 2026-27 | Esposito Se. pagato 1 credito contro un valore a coefficiente di 46 | `rosters.json`, pubblicato nel numero 1 |
| Bombe di Tancredi Soffiata | riceve Geubbels per Esposito Se. e Malen più 31 crediti per Yildiz: i primi 31 crediti della stagione, «anche gli ultimi» — scambio inventato, cifre vere; stato `lanciata` in `editorial/bombe.json` | `content/2026-27/issue-001/bombe.md` |
| Vigilia giornata 1 | Bersaglio principale del numero 2: l'editoriale protocolla la profezia della lega «tanto alla fine vince Squadra 9» a giornate giocate zero, e il presidente «non commenta i pronostici, li ritira a giugno» (dichiarazione nostra) | `content/2026-27/issue-002/editoriale.md` |
| Giornata 1 | Vittoria 6-2 sul COCA JUNIORS con 91 fantapunti, il massimo della giornata; primo in classifica: la profezia del numero 2 si avvera alla prima giornata | `matchday-01/results.json`, `standings.json` |
| Giornata 1 | Yildiz 5,5 e Martinez L. 5: i 623 crediti d'attacco producono 10,5 fantapunti in due; i 91 li fanno Bremer 11,5, Bisseck 10, Zielinski 10, Diouf 10 (162 crediti in tutto); Frattesi 11,5 in panchina | `matchday-01/lineups.json` |
| Giornata 1 | Bomba: cede Frattesi (30) per Kolo Muani (302), alla pari perché ha zero crediti — scambio inventato, cifre vere; stato `lanciata` | `content/2026-27/issue-003/bombe.md` |
| Numero 4 | Bersaglio principale dello speciale: sei offerte per Calhanoglu (Esposito Se.; Esposito Se. più otto da un credito; Frattesi; il nome della squadra; l'asterisco di fuori listino; Yildiz più 167 di conguaglio), tutte respinte con «Lautaro» — offerte inventate, cifre vere | `content/2026-27/issue-004/approfondimento-turco.md` |
| Numero 4 | Diciannove giocatori (P+D+C) costati 327 crediti in tutto, quanto Yildiz da solo; centrocampo da 136 crediti contro i 160 del solo Calhanoglu | `rosters.json`, pubblicato nel numero 4 |
| Numero 4 | Editoriale «dice, dice, e intanto è primo con 91»: la legge «chi parla di più perde» dichiarata abrogata; il pool Formazioni Pulite trascriverà ogni dichiarazione fino a giugno | `content/2026-27/issue-004/editoriale.md` |
| Numero 4 | Lettera «Innamorato di un Centrocampista Altrui» alla Posta del Cuore; segno d'oroscopo (ascendente: il nono giocatore dell'Inter, che non c'è) | `content/2026-27/issue-004/rubrica-fissa.md` |
| Numero 4 | Bomba: cede Martinez L. (296) per Calhanoglu (160) alla pari, non potendo chiedere i 136 di differenza — scambio inventato, cifre vere; stato `lanciata` | `content/2026-27/issue-004/bombe.md` |

## Materiale inutilizzato

- 655 crediti su 982 (67%) al reparto offensivo, la quota più alta della lega — `rosters.json` — *ancora buono per:* una statistica della vergogna.
- Nove giocatori acquistati a un credito — `rosters.json` — *ancora buono per:* una pagella.
- La profezia protocollata nel numero 2 resta aperta fino a giugno: se il titolo va altrove è un Nostradamus al Contrario sulla lega intera; se arriva davvero, l'inchiesta promessa dal Direttore («nessuno arriva primo con le mani pulite, figurarsi chi arriva primo in agosto») — `content/2026-27/issue-002/editoriale.md` — *ancora buono per:* un approfondimento a fine stagione.
- Il campione designato ha vinto «con gli uomini sbagliati»: 59,5 crediti per fantapunto su Yildiz alla giornata 1 — `content/2026-27/issue-003/classifiche.md` — *ancora buono per:* un approfondimento sui 623 crediti, se la tendenza regge tre giornate.
- Le sei offerte sono un contatore: la settima («la settima è gratis», consigli del numero 4) si conta alla prima voce di mercato reale che coinvolga Squadra 9 — *ancora buono per:* una bomba o una voce di corridoio.
- Se Calhanoglu fa più di Martinez L. in una giornata, il fascicolo si riapre da solo; se Martinez L. fa più di Calhanoglu, «il progetto» ha ragione per una settimana — `lineups.json` delle prossime giornate — *ancora buono per:* una pagella.
