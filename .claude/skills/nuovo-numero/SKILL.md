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
- The **number** is the next free one: list `content/<season>/` and take the
  highest `issue-NNN` plus one. `issue-000` is the demo issue and counts.
- Fix the **season** (`2026-27` unless told otherwise) and, for `pre`/`post`,
  the **matchday**.

State type, number, season and matchday back to the user before continuing.

## Step 2 — Verify the data exists (`pre` and `post` only)

For `pre` and `post`, check that `data/<season>/matchday-NN/` exists
(zero-padded) and contains the files the issue needs:

- `post` → `results.json`, `standings.json`, `lineups.json`;
- `pre` → at minimum `lineups.json` (and `data/<season>/league.json`).

**If the directory or the files are missing, STOP.** Do not invent the data and
do not fall back to an older matchday. Tell the user to run the scraper:

```
npm run scrape -- --matchday NN
```

and wait. `midweek` issues skip this step entirely: they run on history that is
already committed.

## Step 3 — Read the editorial memory before writing a single line

Read, in this order, all of it, every time:

1. `editorial/style-guide.md` — voice, red line, column formats, bylines,
   awards, technical contracts. It wins over any idea you have while writing.
2. **Every** file in `editorial/dossier/` (skip `_template.md`) — nicknames,
   active running jokes, awards already won, notable precedents.
3. The **last three issues** in `content/<season>/` — so the issue does not
   repeat a joke, reuse an opening, or hit the same target twice in a row.
4. `editorial/albo.json` — who has already won what, and when.
5. The data files for this issue, plus `data/<season>/league.json` for the exact
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
`classifiche`, `mercato`, `approfondimento`. `byline` is one of the six fixed
bylines in the style guide. `order` starts at 1, no gaps, no duplicates.

Required composition — file name is the column slug:

| `type` | Articles |
|---|---|
| `pre` | `mercato.md` + `editoriale.md` |
| `post` | `cronaca-pagelle.md` + `classifiche.md` + `editoriale.md` + `rubrica-fissa.md` |
| `midweek` | `editoriale.md` + one or two `approfondimento-1.md` / `approfondimento-2.md` |

Follow the style guide's per-column formats (report card layout, the four
blocks of *Lo Sconfitto della Settimana*, the market disclaimer, the numbered
chapters of an inchiesta) — they are what makes the magazine recognisable.

## Step 5 — Traceability check on what you just wrote

Re-read the drafts against the data before moving on:

- **Every factual claim traces to `data/` or to a dossier.** Scores, points,
  positions, modules, benched players, credits: all of them exist in a file. No
  invented results, no rounded-in-your-favour numbers, no matchday that was
  never scraped.
- **Every quotation is invented and must stay unbelievable.** If someone could
  screenshot it and pass it off as real in the league chat, it is too realistic:
  raise the absurdity a notch.
- **The red line holds** (style guide §3): the jokes hit the manager's
  *choices*, never the person. No private life, work, family, appearance.
  Apply the *test dello striscione* to every line.
- **Coverage and rotation:** in a `post` issue every manager appears at least
  once, and the main target differs from the previous issue.

Fix the text, never the data.

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

If approval never arrives, the issue stays in the working tree. That is a
perfectly acceptable outcome; publishing without approval is not.
