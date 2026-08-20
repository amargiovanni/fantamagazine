# Il Fatto Fantidiano — Design Spec

**Date:** 2026-08-20
**Status:** Approved design, pending implementation plan

## Overview

A satirical online magazine ("Il Fatto Fantidiano") covering the private
fantacalcio league **Fantac-ACCIA**, hosted on
`https://leghe.fantacalcio.it/fantac-accia/view/competition/173122/dashboard`.
The magazine mocks the league's managers (fantallenatori) — never real
Serie A players beyond normal sports commentary — through recurring
columns, running jokes, and merciless report cards. It is updated around
each matchday (a pre-matchday issue and a post-matchday issue) and
published as a static website on Cloudflare.

The editorial workflow is human-in-the-loop: content is generated in
Claude Code sessions, previewed locally, and deployed only after the
editor-in-chief (Andrea) approves. Nothing publishes automatically.

## Goals

- A daily-maintainable satirical magazine with persistent running jokes.
- Zero-maintenance hosting: fully static site, no server, no database.
- Full history in git: raw data, editorial memory, every published issue.
- A one-command editorial flow: scrape → write issue → preview → deploy.

## Non-goals

- No automated/unattended publishing (no cron-driven content generation).
- No user accounts, comments, or interactivity on the site.
- No official fantacalcio.it API integration (none exists); no
  redistribution of fantacalcio.it's own editorial content.

## Architecture

Three components, isolated by directory, communicating only through
files committed to the repo:

1. **Scraper** (`scraper/`) — Node.js + TypeScript + Playwright. Logs in
   to leghe.fantacalcio.it with credentials from `.env` and writes
   normalized JSON snapshots to `data/`.
2. **Editorial system** (`editorial/`, `content/`, `.claude/skills/`) —
   Claude Code writes issues as Markdown from the JSON data plus the
   editorial memory. No code; conventions and a project skill.
3. **Site** (`site/`) — Astro static site generator. Builds the magazine
   from `content/` and `data/`, deployed to Cloudflare Workers static
   assets via `wrangler deploy`.

Each component can be understood and changed independently: the scraper
knows nothing about articles; the site knows nothing about
fantacalcio.it; the editorial layer only reads `data/` and writes
`content/`.

## Repository layout

```
fantamagazine/
├── scraper/                  # TS + Playwright, own package.json
│   ├── src/
│   ├── fixtures/             # saved HTML pages for parser tests
│   └── debug/                # gitignored: screenshots/HTML on failure
├── data/
│   └── 2026-27/
│       ├── league.json       # teams, managers, credits, game mode
│       └── matchday-01/
│           ├── lineups.json
│           ├── results.json  # votes, points per team
│           └── standings.json
├── editorial/
│   ├── dossier/              # one file per manager: nicknames,
│   │                         # running jokes, awards, history
│   └── style-guide.md        # tone, recurring columns, tormentoni
├── content/
│   └── 2026-27/
│       └── issue-001/        # one directory per issue
│           ├── issue.json    # issue metadata (date, matchday, type)
│           └── *.md          # one article per file, frontmatter-typed
├── site/                     # Astro project, own package.json
├── docs/superpowers/specs/
└── tasks/                    # todo.md, lessons.md
```

## Scraper

- **Auth:** `FC_USERNAME` / `FC_PASSWORD` read from a repo-root `.env`,
  gitignored from the first commit. Credentials never appear in code,
  logs, or committed files.
- **Interface:** `npm run scrape -- --matchday <n>` (and
  `npm run scrape -- --league` for roster/credits refresh). Output is
  deterministic JSON under `data/2026-27/`.
- **Scope:** league roster and credits, submitted lineups, matchday
  votes and points, standings. The game mode (Classic/Mantra) is read
  from the league dashboard on first run and recorded in `league.json`;
  parsers are validated against saved fixtures of the real league pages
  captured at first scrape.
- **Error handling:** any login or parsing failure saves a screenshot
  and the raw HTML to `scraper/debug/` (gitignored) and exits non-zero
  with a message naming the failed step. JSON output is validated
  against a schema (zod) before being written — partial or malformed
  data is never committed.
- **Resilience expectation:** the site will change and break selectors;
  fixtures + debug dumps make repair a small, test-driven task.
- **Compliance note:** scraping is limited to the user's own private
  league data, at human-triggered frequency (a few requests per issue).
  fantacalcio.it's terms do not provide for automated access; this is a
  personal-use tool, rate-limited by design, and this trade-off was
  accepted explicitly by the owner.

## Editorial system

- **Columns (rubriche):**
  1. *Cronaca + pagelle* — satirical matchday recap and manager report
     cards, with recurring mock awards.
  2. *Editoriale + rubriche fisse* — editor's column, "Lo Sconfitto
     della Settimana", manager horoscope, agony-aunt letters.
  3. *Classifiche e statistiche* — annotated standings and shameful
     stats with build-time SVG charts.
  4. *Mercato e formazioni* — pre-matchday: mocked probable lineups,
     deliberately terrible advice, invented transfer gossip.
- **Issue types:** `pre` (before a matchday: column 4 + editorial) and
  `post` (after: columns 1–3 + editorial). Both produced by the same
  workflow.
- **Editorial memory:** `editorial/dossier/<manager>.md` holds each
  manager's nicknames, running jokes, accumulated awards, and notable
  history. The style guide fixes tone and recurring formats. Both are
  read before writing and updated after each issue, so jokes compound
  across the season instead of resetting.
- **Workflow:** a project skill `.claude/skills/nuovo-numero/` drives
  it: read new JSON → re-read dossiers and recent issues → draft all
  articles as Markdown with frontmatter (column, title, mock byline) →
  update dossiers → local preview (`astro dev`) → explicit human
  approval → deploy. The skill never deploys without approval.
- **Article format:** Markdown + frontmatter
  (`column`, `title`, `byline`, `matchday`, `order`). `issue.json`
  carries issue-level metadata. The site build fails loudly if an
  article references a matchday with no data directory.

## Site

- **Stack:** Astro, static output only, deployed as Cloudflare Workers
  static assets with `wrangler deploy`. No client-side framework;
  charts are SVG generated at build time from `data/`.
- **Pages:** home (latest issue as a scandal-sheet front page), issue
  archive, per-column index, "Albo d'Oro della Vergogna" (cumulative
  mock awards), standings page with charts.
- **Design:** newspaper-parody look developed with the frontend-design
  skill. The masthead is "Il Fatto Fantidiano" with the tagline "Le
  notizie che i fantallenatori vorrebbero insabbiare". The design is an
  original parody: it must not copy the logo, typography lockup, or
  trade dress of Il Fatto Quotidiano or any real newspaper, and the
  footer carries a satire disclaimer stating the site is an unofficial
  parody unaffiliated with any real publication or with fantacalcio.it.
- **Access:** public, deliberately. It names and mocks real league
  members; the league owner announces the magazine in the league group
  so members can object before appearing ("chi non vuole comparire
  parli ora"). Content stays within friendly mockery of league
  performance — no private facts beyond the game.

## Operational flow (one issue)

1. `npm run scrape -- --matchday <n>` (local, seconds).
2. Review the JSON diff (`git diff data/`).
3. Run `/nuovo-numero` in Claude Code → articles drafted, dossiers
   updated, local preview served.
4. Editor reads the issue, requests changes if needed.
5. On approval: commit (data + content + dossiers), `wrangler deploy`.

## Testing

- **Scraper:** Vitest unit tests for every parser against HTML fixtures
  in `scraper/fixtures/`; schema validation tested with malformed
  inputs. This is the highest-value test surface: it is what breaks.
- **Site:** build smoke test (site builds from committed content with
  zero errors) plus the build-time referential checks above.
- **Definition of done for any change:** tests green, output shown, and
  for site changes a local preview actually rendered.

## Error handling summary

| Failure | Behavior |
|---|---|
| Login fails / captcha | Non-zero exit, screenshot + HTML in `scraper/debug/` |
| Page structure changed | Parser test pinpoints it via fixtures; debug dump for the new HTML |
| Malformed scrape output | zod validation rejects; nothing written to `data/` |
| Article → missing data | Astro build fails with a named error |
| Bad issue published | Static site: redeploy previous commit (`git revert` + deploy) |

## Security & privacy

- Credentials only in `.env` (gitignored) — never in chat, code, or CI.
- The scraper runs only from the owner's machine, human-triggered.
- Personal data on the site: league members' names/nicknames and their
  in-game performance, published with the league's informal consent
  (household/personal context; the announcement-and-objection step
  above is the guardrail). No emails, no photos unless a member
  provides one for the joke, no data beyond the game.

## Dependencies (require explicit permission before install)

- `scraper/`: `playwright`, `zod`, `typescript`, `vitest`.
- `site/`: `astro` (+ its Cloudflare adapter if needed for assets
  config), `wrangler` as a dev dependency at repo root or in `site/`.
