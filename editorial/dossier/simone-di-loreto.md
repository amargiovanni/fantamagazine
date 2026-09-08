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
| **il Presidente del Venticinquesimo Nome** | alla giornata 2 deposita 24 nomi su 25 e l'unico assente è Yildiz, 327 crediti, il sovrapprezzo record dell'asta: non tra gli 11 titolari, non tra i 13 di panchina | 4 |

## Running joke attivi

### La squadra senza nome

- **Nato nel numero:** 1
- **Stato:** attivo
- **Il fatto d'origine:** `league.json`: `teams[].name` vale «Squadra 9», unica denominazione non personalizzata delle dieci della lega
- **Come si usa:** si usa solo sul nome della squadra, mai sulla persona: il nome è una scelta del presidente e rientra nei bersagli leciti (§3)
- **Ultimo utilizzo:** numero 4
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
- **Ultimo utilizzo:** numero 5
- **Note:** alla giornata 1 la profezia si avvera (6-2, 91 fantapunti) ma con Yildiz 5,5 e Martinez L. 5; alla giornata 2 regge di nuovo (3-0, sei punti su sei) e stavolta con Yildiz non depositato affatto: due fatti nuovi in due giornate, il tormentone è rinnovato fino al numero 6. È anche una trappola a orologeria: se Squadra 9 non vince il
  campionato, la profezia pubblicata è materiale da Premio Nostradamus al
  Contrario — per la lega che l'ha pronunciata, non per il presidente.
- **Note:** giornata 3: prima sconfitta, 3-5 con l'Atletico Piedini, 82,5 a 87,5, e la squadra scende terza pur avendo il totale più alto della lega (251,5). Come da formula, il numero 5 apre «un'istruttoria sul titolo assegnato ad agosto». Rinnovato.

### Il venticinquesimo nome

- **Nato nel numero:** 4
- **Stato:** attivo
- **Il fatto d'origine:** giornata 2: la rosa depositata contiene 24 uomini su 25 e il nome mancante è Yildiz, 327 crediti, quotazione 23, valore a coefficiente 81, sovrapprezzo +246 e record assoluto dell'asta (`matchday-02/lineups.json`, `rosters.json`)
- **Come si usa:** a ogni giornata si conta quanti nomi ha depositato; l'uomo più caro della lega si cita come «il venticinquesimo», mai come un assente per infortunio, che sarebbe un fatto sulla persona e non sulla scelta
- **Ultimo utilizzo:** numero 5
- **Note:** il reparto offensivo da 623 crediti ha prodotto 10,5 fantapunti alla giornata 1 e 6 alla giornata 2, totale 16,5 in due giornate, con sei punti su sei in classifica.
- **Note:** giornata 3: Yildiz non depositato per la seconda giornata consecutiva, e stavolta Squadra 9 perde. Martinez L. (296) fa 14, il primo voto degno dei 623 crediti. Madame Panchinska aveva scritto nel numero 4 che il venticinquesimo sarebbe tornato il giorno della prima sconfitta: la sconfitta è arrivata, lui no.

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
| Giornata 2 | Vittoria 3-0 sull'Amaro Luciano con 78 fantapunti, esattamente il punteggio con cui il GinTonici ha perso 3-4 nello stesso pomeriggio; primo con 6 punti e 169 fantapunti, il totale più alto della lega | `matchday-02/results.json`, `standings.json` |
| Giornata 2 | Modulo cambiato dal 4-3-3 al 4-4-2: due giornate, due moduli, sei punti | `matchday-02/lineups.json` |
| Giornata 2 | Yildiz, 327 crediti, non risulta né tra gli 11 titolari né tra i 13 di panchina: 24 nomi depositati su 25 | `matchday-02/lineups.json`, `rosters.json` |
| Giornata 2 | Miglior fantavoto della squadra Frattesi, 30 crediti, 10, e nessun titolare oltre il 10, in una giornata in cui sei squadre su dieci hanno prodotto almeno un 11; Meret 4 in porta, Martinez L. (296) 6, Scalvini (1 credito) 6, Joao Mario e Diouf senza voto | `matchday-02/lineups.json` |
| Giornata 2 | Avversari affrontati in due giornate per complessivi 136,5 fantapunti: il totale più basso della lega alla pari con il Borussia Addurmt, contro i 169 del COCA JUNIORS | `matchday-01/results.json`, `matchday-02/results.json` |
| Giornata 2 | Bersaglio principale del numero 4: titolo di apertura e inchiesta speciale. Non può esserlo nel numero 5 | `content/2026-27/issue-004/` |
| Giornata 2 | Bomba: cede Yildiz al Nostalgia Nera e incassa Kolo Muani (302) più 266 crediti, i primi della sua stagione — scambio inventato, cifre vere; stato `lanciata` | `content/2026-27/issue-004/bombe.md` |
| Giornata 3 | Sconfitta 3-5 con l'Atletico Piedini, 82,5 a 87,5, il terzo punteggio della giornata; terzo con 6 punti e 251,5 fantapunti, il totale più alto della lega (Indice di Giustizia Differita −2) | `matchday-03/results.json`, `standings.json` |
| Giornata 3 | Martinez L. (296) 14, Frattesi 11; Meret 4; Esposito Se. titolare senza voto; Bijlow (14) 1,5 in panchina senza entrare, «un Falcone»; Yildiz (327) non depositato per la seconda volta di fila | `matchday-03/lineups.json` |
| Giornata 3 | Non bersaglio principale del numero 5 (rotazione §3); la profezia del numero 4 di Madame Panchinska (Yildiz torna il giorno della sconfitta) smentita dai fatti | `content/2026-27/issue-005/` |

## Materiale inutilizzato

- 655 crediti su 982 (67%) al reparto offensivo, la quota più alta della lega — `rosters.json` — *ancora buono per:* una statistica della vergogna.
- Nove giocatori acquistati a un credito — `rosters.json` — *ancora buono per:* una pagella.
- La profezia protocollata nel numero 2 resta aperta fino a giugno: se il titolo va altrove è un Nostradamus al Contrario sulla lega intera; se arriva davvero, l'inchiesta promessa dal Direttore («nessuno arriva primo con le mani pulite, figurarsi chi arriva primo in agosto») — `content/2026-27/issue-002/editoriale.md` — *ancora buono per:* un approfondimento a fine stagione.
- Il campione designato ha vinto «con gli uomini sbagliati»: 59,5 crediti per fantapunto su Yildiz alla giornata 1 — `content/2026-27/issue-003/classifiche.md` — *ancora buono per:* un approfondimento sui 623 crediti, se la tendenza regge tre giornate.
- Indice di rimpianto panchinaro 6,5 alla giornata 1 e 3,0 alla giornata 2, il più basso tra le prime quattro: non sceglie meglio, ha semplicemente una panchina che non vale il rimpianto — `content/2026-27/issue-004/approfondimento-panchine.md` — *ancora buono per:* una statistica della vergogna.
- Il giorno in cui Yildiz torna in campo è già scritto nell'oroscopo del numero 4 come il giorno della prima sconfitta: se succede, è un Nostradamus al Contrario per Madame Panchinska, non per il presidente — `content/2026-27/issue-004/rubrica-fissa.md` — *ancora buono per:* l'albo, se la profezia salta.
- Squadra 9 ha il totale più alto della lega ed è terza: se resta fuori dal podio con il primo totale per due giornate, è un Nostradamus al Contrario per la lega intera — `matchday-03/standings.json` — *ancora buono per:* l'editoriale.
