---
name: nuovo-numero
description: Produce a new issue (pre/post/midweek) of Il Fatto Fantidiano: reads league data and editorial memory, writes the articles, updates dossiers, previews locally. Use when the user asks for a new issue, numero, pre-giornata, post-giornata or approfondimento.
---

# Nuovo numero — Il Fatto Fantidiano

Produce one issue of the satirical magazine *Il Fatto Fantidiano* from the
league data in `data/` and the editorial memory in `editorial/`.

The articles are **product content and are written in Italian**. This checklist
is tooling and stays in English.

**Two rules that override everything else in this file:**

1. **Never invent a result.** Every number in the magazine comes from `data/`.
   Invented *quotes* are required and encouraged — invented *facts* are a defect.
2. **Never deploy without the editor's explicit approval.** The skill stops at
   step 8 and waits. There is no "obviously fine, I'll ship it" branch.

Work through the steps in order. Do not skip ahead: step 3 exists precisely
because the jokes have to compound across issues instead of resetting.

---

## Step 1 — Determine issue type and number

- Ask the user (or infer from the request) which **type** the issue is:
  - `pre` — before a matchday: market gossip and probable lineups;
  - `post` — after a matchday: match report, report cards, standings;
  - `midweek` — Wednesday/Thursday long-form, no fresh data needed.
- The **number** is the next free one, and numbering is **continuous across
  seasons**: take the highest `issue-NNN` found anywhere under `content/` — every
  season, not only this one — and add one. Numbers are never reused, so the
  archive and the URLs stay unambiguous when a second season starts.
  When `content/` holds no issues at all the number is **1**: the demo-era
  "numero 0 di collaudo" was purged at go-live and its number retires with it.
- Fix the **season** (`2026-27` unless told otherwise) and, for `pre`/`post`,
  the **matchday**.

State type, number, season and matchday back to the user before continuing.

## Step 2 — Verify the data exists (`pre` and `post` only)

For `post`, check that `data/<season>/matchday-NN/` exists (zero-padded) and
contains `results.json`, `standings.json` and `lineups.json`.

For `pre`, the declared matchday is the giornata **about to be played**: no data
for it exists yet and none is expected. Check the **previous** matchday instead
— `data/<season>/matchday-(NN-1)/` with its `results.json` — plus
`data/<season>/league.json`. That is where a `pre` issue's numbers come from
(style guide §4). When NN is the first matchday of the season there is no
previous one: skip the check and run on `league.json` alone.

**If a required directory or file is missing, STOP.** Do not invent the data and
do not fall back to an older matchday. Tell the user to run the scraper on the
matchday that is missing — the declared one for `post`, the previous one for
`pre`:

```
npm run scrape -- --matchday NN
```

and wait. `midweek` issues skip this step entirely: they run on history that is
already committed.

`data/<season>/rosters.json` is a legal source for every issue type, `midweek`
included: it carries each squad's players with the `price` paid at the auction
and the current listino `quotation`. Both are agli atti and may be quoted.

**They are different scales.** Restating style guide §4, because it is the
easiest rule in this repository to get wrong: an overpayment claim compares
`price` against `quotation` multiplied by the **league coefficient** — total
league spend divided by total quotation bought — never `price` minus
`quotation`. Compute the coefficient from the data before writing the claim;
subtracting a quotation from a price is a bluff and reads as one.

## Step 3 — Read the editorial memory before writing a single line

Read, in this order, all of it, every time:

1. `editorial/style-guide.md` — voice, red line, column formats, bylines,
   awards, technical contracts. It wins over any idea you have while writing.
2. **Every** file in `editorial/dossier/` (skip `_template.md`) — nicknames,
   active running jokes, awards already won, notable precedents.
3. The **last three issues** in `content/<season>/` — so the issue does not
   repeat a joke, reuse an opening, or hit the same target twice in a row.
4. `editorial/albo.json` — who has already won what, and when.
   `editorial/bombe.json` — every bomba Tancredi Soffiata has launched, with
   its `status`; the career tally printed at the top of `bombe.md` is computed
   from this file (style guide §6.7).
5. `editorial/opt-out.json` — the managers who asked not to appear. They are
   never named, never nicknamed, never awarded; see style guide §3.
6. The data files for this issue, plus `data/<season>/league.json` for the exact
   team and manager names.

Then note explicitly, before drafting: which running jokes are `attivo`, who was
the main target of the previous issue (they cannot be the main target again),
and which awards are due.

## Step 4 — Write the issue

Create `content/<season>/issue-NNN/` containing `issue.json` and one Markdown
file per article.

`issue.json`:

```json
{
  "number": 1,
  "type": "post",
  "date": "2026-09-01",
  "matchday": 1,
  "headline": "SCANDALO: schiera quattro attaccanti, ne segnano zero"
}
```

`type` is `pre` | `post` | `midweek`; `date` is `YYYY-MM-DD`; `matchday` is a
number for `pre`/`post` and **`null`** for `midweek`; `headline` is the front
page headline (normally the `title` of the article with `order: 1`).

Every article carries exactly this frontmatter — no extra keys:

```yaml
---
column: cronaca-pagelle
title: "SCANDALO: schiera quattro attaccanti, ne segnano zero"
byline: "Gianni Sfotta"
order: 1
---
```

`column` is one of `cronaca-pagelle`, `editoriale`, `rubrica-fissa`,
`classifiche`, `mercato`, `approfondimento`, `bombe`. `byline` is one of the
seven fixed bylines in the style guide. `order` starts at 1, no gaps, no duplicates.

Required composition — file name is the column slug:

| `type` | Articles |
|---|---|
| `pre` | `mercato.md` + `editoriale.md` |
| `post` | `cronaca-pagelle.md` + `classifiche.md` + `editoriale.md` + `rubrica-fissa.md` (+ `mercato.md` optional teaser: "Le posizioni" replaces "Le probabili formazioni", per style guide §6.5) |
| `midweek` | `editoriale.md` + one or two `approfondimento-1.md` / `approfondimento-2.md`, or `approfondimento-<slug>.md` with a short descriptive slug (style guide §9) |

A **numero speciale**, declared as such in the occhiello of one of its articles
(e.g. `SPECIALE INSEDIAMENTO:`), may extend the `midweek` composition with
`mercato.md` and `rubrica-fissa.md`, with `mercato` following the §6.5 teaser
variant: "Le rose" replace "Le probabili formazioni" (style guide §9).

`bombe.md` (style guide §6.7) may be added to **any** composition and is never
required. Three to five bombe; every player name, price, quotation and credit
balance comes from `rosters.json`/`league.json`, the swap itself is invented.
A `pre` issue is its natural home, but it runs whenever the editor asks.

In that teaser variant `mercato` may also carry **le pagelle delle rose** — one
entry per squad in the rigid §6.1 pagella format, on the fantidiana scale, in
addition to the usual consigli della redazione. As in §6.1, the pagelle block
does not count towards the column's 400-600 words (style guide §6.5).

Follow the style guide's per-column formats (report card layout, the four
blocks of *Lo Sconfitto della Settimana*, the market disclaimer, the numbered
chapters of an inchiesta) — they are what makes the magazine recognisable.

## Step 5 — Traceability check on what you just wrote

Re-read the drafts against the data before moving on, and **run the checklist
in style guide §11 line by line** — it is the authoritative list, not a summary
of it. Do not paraphrase it from memory: open §11 and tick each item against the
text you actually wrote.

Two items are worth restating here because they are the ones that end the job
if they fail:

- **No invented facts.** Every score, position, module and benched player exists
  in a file under `data/`. Invented *quotes* are required; invented *results*
  are a defect. Fix the text, never the data.
- **The opt-out list is absolute.** Cross-check every article against
  `editorial/opt-out.json`: nobody on that list may be named, nicknamed,
  alluded to recognisably, or awarded, and their results appear only inside
  aggregate tables. A doubt about identifiability resolves in favour of the
  opt-out.

## Step 6 — Update the editorial memory

In the same working tree, before building:

- Update `editorial/dossier/<manager>.md` for every manager the issue touched:
  new nicknames with their origin, running jokes born in this issue
  (`nato nel numero N`, status `attivo`), status changes for existing jokes,
  awards won, new notable precedents with their matchday, leftovers in
  *Materiale inutilizzato*.
- Append the awards assigned to `editorial/albo.json`, one object per award:
  `{ "award": ..., "issue": ..., "manager": ..., "motivation": ... }`, with
  `award` copied verbatim from the style guide's table and `manager` matching
  `league.json`. Maximum three awards per issue; no manager twice in one issue.
- Create a dossier from `editorial/dossier/_template.md` for any manager who
  does not have one yet.
- If the issue has `bombe.md`, append one object per bomba to
  `editorial/bombe.json`: `{ "issue": N, "player": ..., "from": ..., "to": ...,
  "status": "lanciata" }`, with team names matching `league.json`. Check earlier
  entries against the committed data: a swap that actually happened becomes
  `confermata`, one the data rules out becomes `smentita`. The tally at the top
  of `bombe.md` must equal the file's counts.

An issue that ships without its dossier update is incomplete work.

## Step 7 — Build

```
npm run build
```

**It must pass.** The site validates the frontmatter and the issue metadata at
build time and fails loudly on a bad `column`, a missing field, or an issue that
points at a matchday with no data. If it fails, fix the content and build again
— do not relax the site's schema to make the content fit.

## Step 8 — Preview and STOP for approval

```
npm run dev
```

Start it **in the background** — it is a long-running server and blocks the
session otherwise — then read back the local URL it prints.

Hand the local URL to the editor and **stop**. Report which articles were
written, which awards were assigned, which running jokes were born, changed
status or retired.

Then wait for the editor to read the issue. Apply any requested change and, if
the content changed, run step 7 again. Keep waiting until approval is explicit.

**Do not commit and do not deploy in this step.** Silence is not approval.

## Step 9 — Only after approval: commit and deploy

Once the editor has approved, in this order:

1. Commit the issue, the dossier updates and `albo.json` together, plus the
   data files if this issue is the first to use them:

   ```
   feat(content): publish issue N
   ```

   The subject line is English and stays under 72 characters, per the commit
   conventions in `CLAUDE.md`. The Italian headline belongs in the commit body,
   never in the subject.

2. Deploy:

   ```
   npm run deploy
   ```

3. Report the commit hash and the deployed URL.

4. Print the Telegram Instant View links for the channel post (see `IV.md`):

   ```
   cd site && npm run iv-links -- N
   ```

If approval never arrives, the issue stays in the working tree. That is a
perfectly acceptable outcome; publishing without approval is not.
