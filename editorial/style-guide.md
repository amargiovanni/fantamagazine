# Il Fatto Fantidiano — Guida di stile

> *Le notizie che i fantallenatori vorrebbero insabbiare.*

Questo documento è la linea editoriale della testata. Si legge **prima** di
scrivere qualunque numero e vince su qualsiasi idea brillante venuta in corso
d'opera. Se una battuta non rispetta questa guida, la battuta si taglia: la
guida non si negozia.

---

## 1. Che giornale siamo

Il Fatto Fantidiano è un quotidiano d'inchiesta che ha un solo, gravissimo
problema: l'unica cosa su cui indaga è una lega privata di fantacalcio,
**Fantac-ACCIA**, dove non è mai successo assolutamente niente di penalmente
rilevante.

Noi lo raccontiamo lo stesso, con la faccia di chi ha appena aperto un
fascicolo. La comicità **non sta nella battuta**: sta nella distanza tra il
tono — cronaca giudiziaria, fonti riservate, atti in nostro possesso — e il
fatto, che è un signore adulto che ha lasciato in panchina un attaccante da 12
fantapunti perché "aveva un presentimento".

Non facciamo satira che strizza l'occhio. Non scriviamo mai "che ridere",
"epico", "clamoroso" più di una volta a numero, e non usiamo mai le emoji.
Il Fatto Fantidiano **crede a quello che scrive**. È questo che lo rende
divertente.

---

## 2. La voce

**Registro:** finto-serio, deadpan, prima pagina di quotidiano. Il cronista non
ride mai della propria battuta.

Sette regole operative, tutte verificabili su un testo già scritto:

1. **Frasi brevi.** Soggetto, verbo, disastro. Il periodo lungo è un lusso che
   ci concediamo solo negli approfondimenti, e sempre per prendere la rincorsa.
2. **La caduta va in fondo.** Ogni paragrafo chiude sulla parola più cattiva.
   Se la battuta è a metà paragrafo, il paragrafo è montato male.
3. **Niente spiegazioni.** Se l'ultima riga spiega la penultima, si cancella
   l'ultima riga. Sempre. Senza rimpianti.
4. **Il numero è la battuta.** "Ha fatto pochi punti" non è giornalismo.
   "Ha chiuso a 58,5, meno del suo portiere di due stagioni fa" lo è.
5. **Lessico giudiziario, sempre.** *Il fascicolo. Gli atti in nostro possesso.
   Fonti vicine allo spogliatoio. Un dirigente che chiede l'anonimato. Non
   risulta indagato. Si è avvalso della facoltà di non schierare.*
6. **Istituzioni immaginarie ricorrenti.** La **Procura Fantidiana**, il pool
   **Formazioni Pulite**, l'**Ufficio Sinistri Modulo**, il **Casellario dei
   Precedenti**. Vanno citate come se esistessero da sempre e come se il
   lettore già le conoscesse. Non si spiegano mai.
7. **Mai il punto esclamativo.** Nemmeno uno. Il Fatto Fantidiano è un giornale
   serio: le grida stanno nel titolo, in maiuscolo, dove è previsto dal
   contratto tipografico.

**Anti-esempio** (da non scrivere mai):

> Ahahah Ottavio ha proprio toppato questa settimana 😅 che disastro ragazzi!!

**Esempio** (stesso fatto, voce giusta):

> Sono le 14:59 quando Ottavio inserisce la formazione. Alle 15:00 il suo
> centrocampista titolare risulta ancora, tecnicamente, in vacanza. Alle 17:40
> Sconforto Cosenza ha 58 punti e una spiegazione che nessuno ha chiesto.

---

## 3. La linea rossa

Questa è la parte più importante del documento. La lega è fatta di amici veri e
il giornale sopravvive solo finché ridono tutti, compreso il bersaglio.

**Si colpiscono le SCELTE. Non si colpisce mai la persona.**

Bersagli **leciti** — tutto ciò che il fantallenatore ha deciso:

- formazioni, moduli, panchine, cambi, capitani;
- il mercato: colpi annunciati, scambi, aste e crediti — ma **solo se il dato
  risulta agli atti** (`league.json` o un numero precedente di questa testata);
- l'orario di inserimento della formazione e i ritardi;
- dichiarazioni (nostre, inventate) e previsioni pubblicate su questa testata;
- la classifica, la fantamedia, ogni numero che risulta agli atti;
- il nome della squadra, il motto, lo stemma, la lore che si è scelto da solo.

Bersagli **vietati**, senza eccezioni e senza "ma qui era simpatico":

- vita privata, relazioni, famiglia, figli, ex;
- lavoro, stipendio, situazione economica reale;
- aspetto fisico, salute, età usata come difetto;
- provenienza geografica usata come difetto, politica, religione, orientamento
  sessuale, qualunque tratto identitario;
- fatti veri raccontati fuori dal gruppo della lega;
- allusioni sessuali su persone reali.

Inoltre: i **calciatori veri di Serie A** si commentano solo come li
commenterebbe un giornale sportivo. Un 4,5 in pagella a un difensore reale è
cronaca; un insulto personale a un difensore reale non è satira, è un tweet.

### Il diritto di non comparire

La lega è stata avvisata prima che il giornale esistesse: *chi non vuole
comparire parla ora*. Chi lo ha detto è iscritto in `editorial/opt-out.json`, e
quella lista **vince su qualsiasi battuta**.

Per un presidente iscritto all'opt-out:

- non si scrive **mai** il suo nome, né quello della sua squadra, né un suo
  soprannome, né una perifrasi che lo renda riconoscibile ("il presidente che
  sappiamo", "un ex vincitore di questa lega");
- non gli si assegnano premi, non finisce nell'albo, non ha un dossier attivo;
- i suoi risultati compaiono **solo dentro le tabelle aggregate** (classifica,
  risultati di giornata), dove sono un fatto della competizione e non un
  bersaglio;
- la regola di copertura del §3 ("in un numero `post` tutti i presidenti sono
  nominati") **non si applica a lui**: l'opt-out batte la copertura.

Il file è un array, senza commenti:

```json
[
  { "manager": "Nome Presidente", "since": "2026-09-14" }
]
```

`manager` è il nome come compare in `data/<stagione>/league.json`
(`teams[].manager`); `since` è la data in cui l'iscritto ha parlato. Si esce
dall'opt-out solo su richiesta esplicita dell'interessato, rimuovendo la riga.
Un dubbio sull'identificabilità si risolve **sempre** a favore dell'opt-out.

### Il test dello striscione

Prima di pubblicare una riga, chiediti: *questa frase la leggerei ad alta voce,
davanti a tutta la lega, con il diretto interessato seduto in prima fila?*

Se la risposta è "sì, e ride anche lui" → si pubblica.
Se la risposta è "dipende dall'umore" → si riscrive.
Se la risposta è "no" → non esiste una versione migliore. Si taglia.

### Rotazione del bersaglio

- Nessun fantallenatore può essere **bersaglio principale** (titolo di apertura
  *oppure* Sconfitto della Settimana) per **due numeri consecutivi**.
- In ogni numero `post`, **tutti** i fantallenatori della lega compaiono almeno
  una volta. Non essere nominati è più offensivo che essere sfottuti.
- Chi vince viene sfottuto quanto chi perde. Il primo in classifica è sospetto
  per definizione: nessuno arriva primo con le mani pulite.

---

## 4. La regola della tracciabilità

**Ogni battuta su un fantallenatore risale a un fatto scritto in `data/` o in
`editorial/dossier/`.** Senza fonte, la battuta non esiste.

In pratica, mentre si scrive:

| Cosa scrivo | Da dove deve venire |
|---|---|
| punteggi, gol, fantapunti | `data/<stagione>/matchday-NN/results.json` |
| formazioni, moduli, panchine, voti dei singoli | `.../lineups.json` |
| posizioni, punti, fantapunti totali | `.../standings.json` |
| squadre, presidenti, crediti residui | `data/<stagione>/league.json` — `teams[].credits` è **il residuo della squadra**, un numero solo: il prezzo pagato per il singolo giocatore **non risulta agli atti** e non si cita mai |
| soprannomi, tormentoni, precedenti | `editorial/dossier/<manager>.md` |
| premi già assegnati | `editorial/albo.json` |
| dichiarazioni citate di numeri passati | `content/<stagione>/issue-NNN/*.md` |
| chi non va nominato | `editorial/opt-out.json` |
| i tre numeri veri di un numero `pre` | la **giornata precedente** già committata: della giornata in corso non esiste ancora un solo dato |

**Regola del fatto minimo:** ogni articolo contiene almeno **tre numeri veri**
presi dai dati. Un pezzo senza numeri è un pezzo che sta bluffando, e si vede.

**Mai inventare un risultato.** Non si aggiusta un punteggio perché la battuta
verrebbe meglio. Se i dati non reggono la battuta, si cambia battuta: i dati
sono l'unica cosa vera del giornale.

### Le citazioni, invece, sono tutte inventate

Le dichiarazioni virgolettate sono **sempre** finte ed è giusto così: sono il
cuore comico della testata. Hanno una sola regola.

**Il test dell'incredibilità:** se qualcuno potrebbe fare uno screenshot della
citazione e mandarla nella chat della lega spacciandola per vera, la citazione
è **troppo realistica**. Si alza di un gradino l'assurdità e si riprova.

- ❌ *«Ho sbagliato formazione, mi dispiace».* — potrebbe averlo detto davvero.
- ✅ *«La formazione l'ho fatta scegliere a mio nipote di quattro anni. Rifarei
  tutto, tranne il nipote».*
- ✅ *«Non commento le sconfitte. Le archivio».*

Le interviste immaginarie si presentano come tali nel modo più serio possibile:
*"raggiunto telefonicamente da questa testata, il presidente si è avvalso della
facoltà di riattaccare"*.

---

## 5. I titoli — nove colonne

Il titolo è il prodotto. Si scrive per ultimo e si riscrive tre volte.

**Forma canonica:**

```
OCCHIELLO IN MAIUSCOLO: fatto all'indicativo presente, poi la caduta
```

**Regole dure:**

- massimo **nove parole** e **65 caratteri**, contati **dopo** l'occhiello:
  l'occhiello (`SCANDALO:`, `ESCLUSIVO:`, …) è tipografia, non testo, e non
  entra nel conteggio;
- **presente indicativo** — il passato remoto è da settimanale, il futuro è da
  oroscopo (e infatti lo usiamo solo lì);
- **un numero concreto** ogni volta che è possibile;
- **nessun punto esclamativo**, mai;
- **nessun gioco di parole sui cognomi reali** delle persone della lega: il
  soprannome sì, se è già registrato nel dossier; la storpiatura del cognome no;
- l'occhiello ruota: `SCANDALO`, `ESCLUSIVO`, `L'INCHIESTA`, `PARLA IL
  PROTAGONISTA`, `RETROSCENA`, `IL CASO`, `DOCUMENTI`, `SI DIMETTE`. Mai lo
  stesso occhiello due numeri di fila.

**Esempi in target** (questo è il livello, non un'aspirazione):

- `SCANDALO: schiera quattro attaccanti, ne segnano zero`
- `ESCLUSIVO: il capitano era in tribuna, lui lo scopre oggi`
- `L'INCHIESTA: chi ha visto la sua formazione? Erano le 14:59`
- `DOCUMENTI: 58 fantapunti, zero gol, nessuna spiegazione`
- `IL CASO: primo in classifica, e adesso qualcuno spieghi come`

Sono tutti sotto le nove parole e i 65 caratteri dopo l'occhiello, e ognuno
poggia su un dato che esiste davvero in `data/`. Se un titolo non supera
entrambe le prove, non è un titolo: è un appunto.

Il campo `headline` di `issue.json` è il titolo di apertura del numero: è
sempre uno di questi, ed è il pezzo di testo più letto che scriviamo.

---

## 6. Le rubriche

Le rubriche sono sei e i loro nomi in `column` sono un **contratto tecnico**
(vedi §9): non si inventano rubriche nuove senza aggiornare anche il sito.

### 6.1 `cronaca-pagelle` — Cronaca e pagelle

Firma abituale: **Gianni Sfotta**. Lunghezza: 500–900 parole più le pagelle.

Struttura:

1. **L'attacco**, sempre con un orario preciso: *"Sono le 15:02 quando…"*.
2. **La cronaca della giornata**: le partite raccontate come fatti di cronaca
   nera, con almeno tre numeri veri per partita.
3. **Le pagelle**, una voce per **ogni** squadra della lega, senza saltarne
   nessuna.

**Formato della pagella — rigido:**

```
**Nome Squadra** — Presidente · **voto**
Due righe. Non tre. La prima riga è il fatto, la seconda è la sentenza.
```

**La scala dei voti fantidiana:**

| Voto | Significato |
|---|---|
| 8+ | Non si assegna. Non è mai successo. Non succederà. |
| 7–7,5 | Vittoria con prova documentale. Serve un numero che la giustifichi. |
| 6,5 | Ha vinto, ma il giornale non è convinto. |
| 6 | **Non esiste.** Il sei politico è abolito per statuto. |
| 5–5,5 | Il minimo sindacale, mancato. |
| 4–4,5 | Disastro con attenuanti generiche. |
| 3 | Disastro senza attenuanti. |
| **SV** | *Senza Vergogna*. Si assegna a chi ha perso e ha pure esultato. |

Il voto **non si spiega: si commina.**

### 6.2 `editoriale` — L'editoriale del Direttore

Firma: **Corrado Fantidiani**, sempre. Lunghezza: 300–450 parole.

Il Direttore usa il plurale maiestatis ("questa testata", "noi"), si indigna
per un fatto minuscolo, evoca la gravità del momento, promette che la verità
verrà a galla e chiude **sempre** con la stessa formula:

> *Noi non ci fermeremo.*

L'editoriale non fa le pagelle e non ripete la cronaca: prende **un solo**
fatto della giornata e lo tratta come una questione morale nazionale.

### 6.3 `rubrica-fissa` — Le rubriche fisse

Un solo file `rubrica-fissa.md` per numero, che ne contiene **due o tre** tra
le seguenti. Lunghezza: 250–450 parole **per rubrica**, non complessive.

**Lo Sconfitto della Settimana** (obbligatorio in ogni numero `post`) — quattro
blocchi, sempre in quest'ordine e sempre etichettati:

```
**Il fatto.**  Che cosa è successo, con i numeri.
**L'aggravante.**  Il dettaglio che rende tutto peggiore.
**La difesa.**  La citazione inventata dell'imputato.
**La sentenza.**  Una riga. Secca.
```

Non vince necessariamente chi ha perso di più: vince chi ha perso **peggio**.
Il verdetto si registra in `albo.json` (vedi §8).

**L'Oroscopo del Fantallenatore** — a cura di **Madame Panchinska**. Tre-quattro
segni per numero, ruotando i fantallenatori. Formato fisso:

```
**Presidente** — *Ascendente: [una cosa del fantacalcio, mai una persona]*
Due righe di previsione, in futuro semplice, formulate come minacce astrali.
*Il consiglio di Madame:* una riga, un consiglio pessimo.
```

**La Posta del Cuore di Zia Fantina** — una lettera + una risposta. La lettera è
firmata con uno pseudonimo trasparente ("Cuore Infranto di Cosenza", "Deluso da
un Modulo"), il testo è disperato e la questione è ridicola. Zia Fantina chiama
tutti "tesoro" e poi li distrugge in tre righe.

### 6.4 `classifiche` — Classifiche e statistiche

Firma: **Aldo Catenaccio**. Lunghezza: 300–500 parole + tabella.

Contiene: la classifica commentata riga per riga (una riga di commento per
squadra, non di più) e il blocco **"Le statistiche della vergogna"** — tre o
quattro statistiche inutili ma vere, ricavate dai dati, con nomi da rubrica
ufficiale: *Indice di Rimpianto Panchinaro*, *Fantamedia del Rimorso*,
*Percentuale di Moduli Cambiati Invano*. Ogni statistica dichiara come è stata
calcolata, in una riga, con la serietà di un istituto di ricerca.

### 6.5 `mercato` — Mercato e formazioni

Firma: **Ornella Malaparte**. Lunghezza: 400–600 parole. È la rubrica del numero
`pre`, si scrive **prima** che si giochi.

Contiene:

- **Le probabili formazioni**, commentate come se fossero mosse di guerra;
- **Voci di corridoio** completamente inventate, attribuite a fonti che non
  esistono ("ambienti vicini alla panchina", "un dirigente che chiede
  l'anonimato e che non è il presidente, anche se ha la sua stessa voce");
- **I consigli della redazione**, deliberatamente pessimi, chiusi sempre dal
  disclaimer fisso:

  > *Il Fatto Fantidiano non risponde delle formazioni schierate seguendo questi
  > consigli, né di quelle schierate ignorandoli.*

Ornella non dice mai "forse": dice "risulta".

Un numero `post` può ospitare `mercato` come teaser del prossimo turno,
oltre alle rubriche già previste per quel tipo in §9: in quel caso **"Le
posizioni"** sostituisce **"Le probabili formazioni"** — il turno appena
giocato è già in classifica, non c'è più nulla da prevedere sullo
schieramento.

### 6.6 `approfondimento` — L'inchiesta

Firma: **Ornella Malaparte** o **Aldo Catenaccio** secondo il taglio (inchiesta
o tattica). Lunghezza: 800–1400 parole. È la rubrica del numero `midweek` e si
nutre solo di storia già committata: dati passati, dossier, numeri precedenti.

Struttura obbligatoria in capitoli numerati:

```
**Capitolo I — Il movente**
**Capitolo II — I fatti**
**Capitolo III — Le omissioni**
**Capitolo IV — La ricostruzione di questa testata**
```

Tagli ricorrenti: la stagione di un fantallenatore riletta come caso
giudiziario; l'intervista esclusiva immaginaria; il retrospettivo *"I grandi
disastri del passato"*; il dossier su un tormentone e sulle sue origini.

---

## 7. Le firme

Le firme sono personaggi, non etichette: ognuna ha un tic riconoscibile e lo
usa **sempre**. Il campo `byline` porta solo il nome; il ruolo compare nel testo
o nella riga di chiusura del pezzo.

| Firma | Ruolo | Rubriche | Tic che non salta mai |
|---|---|---|---|
| **Corrado Fantidiani** | direttore responsabile, per quanto la parola sia forte | `editoriale` | Plurale maiestatis; chiude con *«Noi non ci fermeremo.»* |
| **Gianni Sfotta** | inviato di pessima volontà | `cronaca-pagelle` | Apre con l'orario esatto del disastro; non concede attenuanti |
| **Ornella Malaparte** | caposervizio mercato e inchieste | `mercato`, `approfondimento` | Non dice "forse", dice "risulta"; cita sempre una fonte anonima inesistente |
| **Aldo Catenaccio** | analista tattico, ex nulla | `classifiche`, `approfondimento` | Lessico militare, frecce e lavagna; ogni modulo è "una scelta di campo, in tutti i sensi" |
| **Zia Fantina** | consulente sentimentale della rosa | `rubrica-fissa` (posta del cuore) | Chiama tutti "tesoro" prima di demolirli |
| **Madame Panchinska** | astrologa di provata inattendibilità | `rubrica-fissa` (oroscopo) | Saturno è sempre in panchina; il consiglio finale è sempre sbagliato |

Regola: **una firma per articolo**. I pezzi non firmati non esistono; la
redazione non si nasconde dietro il "noi" tranne nell'editoriale, dove è una
posa deliberata.

---

## 8. L'Albo d'Oro della Vergogna

I premi ricorrenti sono il modo in cui la satira si accumula invece di
resettarsi ogni settimana. Si registrano in `editorial/albo.json`, che è un
array di oggetti:

```json
{
  "award": "La Panchina d'Oro del Disonore",
  "issue": 3,
  "manager": "Ottavio",
  "motivation": "Dodici fantapunti lasciati in panchina, tre punti persi in classifica, zero rimorsi manifestati."
}
```

- `award` — il nome esatto del premio, **copiato dalla tabella qui sotto**;
- `issue` — il numero del numero in cui è stato assegnato;
- `manager` — il nome del presidente come compare in `data/<stagione>/league.json`
  (`teams[].manager`), **non** il nome della squadra;
- `motivation` — una riga sola, in stile motivazione ufficiale: fredda, formale,
  con un numero dentro.

### I premi

| Premio | A chi | Criterio verificabile sui dati |
|---|---|---|
| **La Panchina d'Oro del Disonore** | a chi ha tenuto fuori il migliore | Il fantavoto più alto della panchina supera di **almeno 3** il fantavoto più basso tra i titolari (`lineups.json`). Vince il delta maggiore. |
| **La Mano de Dios del Mercato** | al colpo di mercato più inutile | Il giocatore celebrato come colpo di mercato in un numero precedente di questa testata chiude la giornata con il fantavoto più basso tra i titolari (`content/` per la celebrazione, `lineups.json` per il fantavoto). Il prezzo d'asta **non è un criterio**: non risulta agli atti. Assegnabile **una volta ogni cinque numeri**. |
| **Il Cucchiaio di Legno** *(trofeo itinerante)* | all'ultimo in classifica | Ultima posizione in `standings.json` a fine giornata. Si registra quando **cambia di mano**; se resta allo stesso presidente, si registra ogni tre giornate come "conferma". |
| **L'Ordine del Modulo Impossibile** | all'architetto | Terzo cambio di modulo in tre giornate consecutive, **oppure** un modulo con quattro attaccanti, **oppure** un modulo che non esiste (`lineups.json`, campo `module`). |
| **Il Premio Nostradamus al Contrario** | al profeta | Una previsione, un consiglio o una dichiarazione **pubblicata su questa testata** viene smentita dai fatti. Obbligatorio citare il numero in cui la profezia è uscita. |
| **La Coppa del Vincitore Involontario** | a chi ha vinto senza meritarlo | Punteggio più basso tra tutti i vincitori di giornata (`results.json`). |
| **Lo Sconfitto della Settimana** | al peggior perdente | Verdetto della rubrica fissa (§6.3). Si registra in albo a ogni numero `post`. |

### Regole di assegnazione

- Massimo **tre premi per numero**, Sconfitto della Settimana incluso.
- **Nessun presidente prende due premi nello stesso numero.** L'accanimento è un
  errore editoriale, non una linea.
- Un premio assegnato compare anche nella sezione *Premi vinti* del dossier del
  presidente, nello stesso commit.
- Un premio nuovo si inventa solo se ha un criterio **calcolabile sui dati** e
  viene aggiunto a questa tabella prima di finire in `albo.json`.

---

## 9. Contratti tecnici (il sito ci conta)

Questa sezione è vincolante: il sito valida questi campi in fase di build e
fallisce rumorosamente se non tornano.

### Frontmatter di ogni articolo

Ogni articolo è un file Markdown in `content/<stagione>/issue-NNN/` con questo
frontmatter, **né più né meno**:

```yaml
---
column: cronaca-pagelle
title: "SCANDALO: schiera quattro attaccanti, ne segnano zero"
byline: "Gianni Sfotta"
order: 1
---
```

| Campo | Tipo | Regole |
|---|---|---|
| `column` | enum | Esattamente uno di: `cronaca-pagelle`, `editoriale`, `rubrica-fissa`, `classifiche`, `mercato`, `approfondimento` |
| `title` | string | Il titolo dell'articolo, regole del §5 |
| `byline` | string | Il nome di una firma del §7 |
| `order` | number | Ordine di lettura dentro il numero, a partire da 1, senza buchi e senza ripetizioni |

Non si aggiungono altre chiavi al frontmatter senza aggiornare nello stesso
commit lo schema delle content collection del sito. In particolare **la
giornata non sta nell'articolo**: sta in `issue.json`, che è l'unica fonte di
verità per il legame numero → giornata.

### `issue.json`

Un file per numero, in `content/<stagione>/issue-NNN/issue.json`:

```json
{
  "number": 1,
  "type": "post",
  "date": "2026-09-01",
  "matchday": 1,
  "headline": "SCANDALO: schiera quattro attaccanti, ne segnano zero"
}
```

| Campo | Tipo | Regole |
|---|---|---|
| `number` | number | Progressivo del numero; coincide con `NNN` della cartella (`issue-001` → `1`) |
| `type` | enum | `pre`, `post` o `midweek` |
| `date` | string | `YYYY-MM-DD` |
| `matchday` | number \| null | La giornata di riferimento; **`null`** per i numeri `midweek`. In un numero `pre` è la giornata **in arrivo**, un puntatore editoriale e non una fonte: i dati citati sono quelli della giornata precedente (§4), e il sito non pretende dati per la giornata dichiarata |
| `headline` | string | Titolo di apertura del numero, tipicamente uguale al `title` dell'articolo con `order: 1` |

### Composizione obbligatoria per tipo di numero

| `type` | Rubriche | Cartella dati richiesta |
|---|---|---|
| `pre` | `mercato` + `editoriale` | nessuna per la giornata dichiarata: si cita la giornata precedente, già committata |
| `post` | `cronaca-pagelle` + `classifiche` + `editoriale` + `rubrica-fissa` (+ `mercato` opzionale, come teaser — vedi §6.5) | `data/<stagione>/matchday-NN/` deve esistere |
| `midweek` | `editoriale` + 1–2 `approfondimento` | nessuna: usa solo storia già committata |

Un **numero speciale** — dichiarato come tale nell'occhiello di uno dei suoi
articoli (p.es. `SPECIALE INSEDIAMENTO:`) — può estendere la composizione
`midweek` con `mercato` e `rubrica-fissa`, dove `mercato` segue la variante
teaser del §6.5: non essendoci nulla da schierare, **"Le rose"** sostituiscono
**"Le probabili formazioni"**.

### Nomi dei file

Il nome del file è lo slug della rubrica: `cronaca-pagelle.md`, `editoriale.md`,
`classifiche.md`, `rubrica-fissa.md`, `mercato.md`. Con due approfondimenti:
`approfondimento-1.md`, `approfondimento-2.md`.

Un approfondimento può portare, al posto del numero, un breve slug descrittivo
(`approfondimento-<slug>.md`, p.es. `approfondimento-asta.md`): il nome del file
è il permalink dell'articolo e un permalink che dice di che cosa parla vale più
di un contatore. La rubrica resta comunque dichiarata in `column`.

---

## 10. I tormentoni

Un tormentone (running joke) è una battuta che sopravvive al proprio numero.
Sono la ragione per cui questo giornale è più divertente al decimo numero che al
primo. Si registrano nel dossier del presidente, con il numero di nascita e lo
stato.

**La regola del tre:**

1. Nasce nel numero *N*. Nel dossier: `nato nel numero N`, stato `attivo`.
2. Può tornare nei numeri *N+1* e *N+2* così com'è.
3. Al **quarto** utilizzo consecutivo passa in stato `in osservazione`: torna
   solo se un fatto nuovo lo rinnova (un dato di `data/` che lo conferma o lo
   ribalta).
4. Un tormentone che torna senza fatti nuovi va **pensionato**: stato
   `pensionato`, e gli si dedica un trafiletto di due righe in stile necrologio.
   Un tormentone pensionato può risorgere **una volta sola**, e solo se i dati
   lo resuscitano da soli.

Un tormentone si costruisce su un fatto, mai su un tratto della persona. Se non
puoi indicare la riga di `data/` da cui è nato, non è un tormentone: è una presa
in giro, e va nel cestino.

---

## 11. Checklist prima di consegnare un numero

Si passa questa lista, riga per riga, prima di far leggere il numero al
Direttore in carne e ossa:

- [ ] Ogni articolo ha `column`, `title`, `byline`, `order` — e `order` non ha buchi.
- [ ] `issue.json` è completo e coerente con il tipo di numero (§9).
- [ ] Ogni numero citato nel testo esiste davvero in `data/`.
- [ ] Ogni articolo contiene almeno tre numeri veri.
- [ ] Ogni citazione virgolettata passa il test dell'incredibilità (§4).
- [ ] Nessuna battuta tocca la linea rossa (§3). Test dello striscione superato.
- [ ] Nessun iscritto a `editorial/opt-out.json` è nominato, alluso o premiato.
- [ ] In un numero `post`, tutti i presidenti sono nominati almeno una volta.
- [ ] Il bersaglio principale è diverso da quello del numero precedente.
- [ ] Massimo tre premi, nessun presidente premiato due volte.
- [ ] Il titolo di apertura sta sotto le nove parole e non ha punti esclamativi.
- [ ] Dossier e `albo.json` aggiornati con quello che questo numero ha stabilito.
- [ ] `npm run build` passa.

---

## 12. Come si produce materialmente un numero

Non a mano: con la skill `/nuovo-numero`
(`.claude/skills/nuovo-numero/SKILL.md`), che impone l'ordine delle operazioni —
verifica dei dati, lettura della memoria editoriale, scrittura, aggiornamento
dei dossier, build, anteprima locale e **approvazione umana prima di
qualunque deploy**.

Il Fatto Fantidiano non pubblica mai da solo. È l'unica cosa in cui è affidabile.
