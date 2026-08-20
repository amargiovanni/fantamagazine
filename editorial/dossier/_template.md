# Dossier — <Nome del presidente>

<!--
  MODELLO. Non modificare questo file per raccontare un presidente reale:
  copiarlo in editorial/dossier/<nome-presidente>.md (minuscolo, senza accenti,
  parole separate da trattini) e compilarlo.

  Il dossier è la memoria del giornale. Si legge PRIMA di scrivere un numero e
  si aggiorna SUBITO DOPO, nello stesso commit del numero. Un dossier non
  aggiornato è il modo più veloce per far morire un tormentone.

  Regola che vale su tutto il file: ogni riga qui dentro deve poter essere
  ricondotta a un fatto in data/ o a un numero pubblicato in content/.
  Niente osservazioni sulla persona: solo fantacalcio (vedi style-guide.md §3).
-->

## Anagrafica fantacalcistica

| Campo | Valore |
|---|---|
| **Squadra** | <nome esatto come in `data/<stagione>/league.json`> |
| **Presidente** | <nome esatto come in `league.json`, campo `teams[].manager`> |
| **`teamId`** | <id della squadra in `league.json`, per ritrovare i dati> |
| **Motto ufficiale** | <se se l'è dato lui> |
| **Motto attribuito da questa testata** | <quello che gli abbiamo cucito addosso noi> |
| **Prima comparsa** | numero <N> |

## Soprannomi

<!-- Ogni soprannome ha un'origine tracciabile. Un soprannome senza origine non
     si usa: si cancella. -->

| Soprannome | Origine | Numero |
|---|---|---|
| <soprannome> | <il fatto preciso da cui nasce, con i numeri> | <N> |

## Running joke attivi

<!-- Stato ammesso: attivo | in osservazione | pensionato.
     Vedi la regola del tre in style-guide.md §10. -->

### <Nome del tormentone>

- **Nato nel numero:** <N>
- **Stato:** <attivo | in osservazione | pensionato>
- **Il fatto d'origine:** <cosa è successo davvero, con la fonte: giornata,
  file, numeri>
- **Come si usa:** <la forma in cui va richiamato, in una riga>
- **Ultimo utilizzo:** numero <N>
- **Note:** <se è stato rinnovato da un fatto nuovo, quale; se è pensionato,
  in che numero è uscito il necrologio>

## Premi vinti

<!-- Deve corrispondere, riga per riga, a quanto registrato in
     editorial/albo.json. Se qui c'è un premio che lì non c'è, uno dei due è
     sbagliato. -->

| Premio | Numero | Motivazione |
|---|---|---|
| <nome esatto del premio, dalla tabella di style-guide.md §8> | <N> | <una riga> |

## Precedenti notevoli

<!-- Il casellario. Fatti, non opinioni: ognuno con la giornata di riferimento,
     così che un futuro approfondimento possa ripescarlo senza riaprire i dati. -->

| Giornata | Il fatto | Fonte |
|---|---|---|
| <giornata NN> | <cosa è successo, con i numeri> | <`matchday-NN/results.json` o simile> |

## Materiale inutilizzato

<!-- Il magazzino: battute buone nate al momento sbagliato, dettagli che non
     stavano nel pezzo, previsioni fatte dalla redazione e non ancora smentite.
     Da qui si pesca quando serve un approfondimento o un Nostradamus al
     Contrario. Ogni voce dice da dove viene. -->

- <spunto> — <fonte / numero di provenienza> — *ancora buono per:* <rubrica>
