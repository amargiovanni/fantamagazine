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
| **il Presidente Senza Insegna** | la squadra si chiama «Squadra 9», il nome che il sistema aveva già nella casella: nove presidenti su dieci ne hanno scelto uno, il decimo no | 1 |

## Running joke attivi

### La squadra senza nome

- **Nato nel numero:** 1
- **Stato:** attivo
- **Il fatto d'origine:** `league.json`: `teams[].name` vale «Squadra 9», unica denominazione non personalizzata delle dieci della lega
- **Come si usa:** si usa solo sul nome della squadra, mai sulla persona: il nome è una scelta del presidente e rientra nei bersagli leciti (§3)
- **Ultimo utilizzo:** numero 3
- **Note:** nasce con il numero 1; alla quarta ripresa consecutiva passa in
  osservazione e va rinnovato da un dato nuovo (style-guide §10).

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
- **Ultimo utilizzo:** numero 3
- **Note:** alla giornata 1 la profezia si avvera (6-2, 91 fantapunti) ma con Yildiz 5,5 e Martinez L. 5: fatto nuovo che rinnova il tormentone. È anche una trappola a orologeria: se Squadra 9 non vince il
  campionato, la profezia pubblicata è materiale da Premio Nostradamus al
  Contrario — per la lega che l'ha pronunciata, non per il presidente.

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

## Materiale inutilizzato

- 655 crediti su 982 (67%) al reparto offensivo, la quota più alta della lega — `rosters.json` — *ancora buono per:* una statistica della vergogna.
- Nove giocatori acquistati a un credito — `rosters.json` — *ancora buono per:* una pagella.
- La profezia protocollata nel numero 2 resta aperta fino a giugno: se il titolo va altrove è un Nostradamus al Contrario sulla lega intera; se arriva davvero, l'inchiesta promessa dal Direttore («nessuno arriva primo con le mani pulite, figurarsi chi arriva primo in agosto») — `content/2026-27/issue-002/editoriale.md` — *ancora buono per:* un approfondimento a fine stagione.
- Il campione designato ha vinto «con gli uomini sbagliati»: 59,5 crediti per fantapunto su Yildiz alla giornata 1 — `content/2026-27/issue-003/classifiche.md` — *ancora buono per:* un approfondimento sui 623 crediti, se la tendenza regge tre giornate.
