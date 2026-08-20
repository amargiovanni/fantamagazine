# Il Fatto Fantidiano

A satirical magazine for the Fantac-ACCIA league, combining live data from fantacalcio.it, editorial commentary, and a beautifully designed Astro site.

## Architecture

The project is organized into three components:

1. **Scraper** — Captures league data, rosters, standings, lineups, and match results from leghe.fantacalcio.it, validated with zod and written as JSON
2. **Editorial layer** — Style guides, dossiers, and editorial management; exposes a `/nuovo-numero` Claude Code skill
3. **Astro site** — Full-featured magazine site with issue archives, player profiles, standings, and historical charts

## Daily operations

1. **Set up credentials**: Copy `.env.example` to `.env` and fill in your fantacalcio.it username and password
   ```
   cp .env.example .env
   ```

2. **Scrape league data**:
   ```
   npm run scrape -- --league        # teams, managers
   npm run scrape -- --matchday <n>  # NOT YET AVAILABLE — see "Recalibration status"
   ```

3. **Create a new issue** using the editorial skill in Claude Code:
   ```
   /nuovo-numero
   ```

4. **Preview locally** before deploying:
   ```
   npm run dev
   ```

5. **Deploy to Cloudflare**:
   ```
   npm run deploy
   ```

Note: Credentials live only in `.env`, never committed to git.

Live URL: https://fantidiano.soapboxmargio.workers.dev

## Recalibration status

First contact with the live site was made on **2026-08-20**. What follows is
what is calibrated, what is not, and what the site turned out to look like.

### Calibrated (verified against the live site)

- **Login.** There is no login button to click: any league URL requested
  unauthenticated redirects to `/login?next=…`. A **PubTech consent banner**
  may be covering the form — it is dismissed with `#pt-accept-all` on a short
  timeout, and its absence is normal, not an error. The form is Angular
  reactive; its inputs carry `formcontrolname`, no `name` and no `id`. Success
  is "the URL no longer contains `/login`" plus the presence of `ui-main-nav`.
- **`--capture`.** Pulls the real page set with the authenticated session:
  dashboard, standings, rosters, one team's roster, fixtures — and, separately,
  the `legacy=true` documents (see below). Output lands in
  `scraper/fixtures/captured/` (gitignored).
- **`--league`.** Writes `data/<season>/league.json` from the competition
  dashboard: ten teams with id, name and manager.
- **Standings parsing.** Calibrated against the live table. Pre-season it is
  ten rows of honest zeros.

### Two things the live site does that the selectors now account for

1. **Half the site is a legacy app in an iframe.** The Angular routes
   `/view/competition/<id>/standings` and `/view/competition/<id>/fixtures`
   render only a shell containing `iframe#legacy-viewport`. The real tables
   live at `…/classifica?id=<id>&app=true&legacy=true` and
   `…/calendario?id=<id>&app=true&legacy=true`, which `PAGES.*Legacy`
   addresses directly — a parser pointed at the shell sees no table at all.
   The legacy markup is the friendlier of the two: every cell carries a
   `data-key`, and the row's `data-id` is the SAME team id the Angular roster
   URLs use, so standings rows join to `league.json` with no name matching.
2. **The league holds more than one competition.** The magazine covers
   competition **173122**. The "Calendario" nav item leads to competition
   **173163**, which renders the same components under a different id. Nothing
   is hardcoded to assume there is only one; covering the second is a separate
   task, not a constant to flip.

Also note: `networkidle` is unusable here. The ad and consent stack keeps
requests in flight indefinitely, so every navigation settles on
`domcontentloaded` plus an explicit wait for Angular to paint.

### Not calibrated — awaiting matchday 1

Season 2026-27 has not started. The site publishes **no lineups and no
results**, so there is no markup to align those parsers with, and no
per-matchday standings URL to verify. Accordingly:

- `npm run scrape -- --matchday <n>` **refuses to run**, before the browser
  even launches, with a message saying so. It does not guess a URL and it does
  not write a `matchday-NN/` directory parsed out of an error page.
- `SEL.lineups`, `SEL.results`, their fixtures and their tests are untouched
  from the synthetic-fixture era and are explicitly marked as such.

At matchday 1, re-run `npm run scrape -- --capture`, calibrate `PAGES`/`SEL`
against the newly captured HTML, refresh the fixtures in `scraper/fixtures/`,
and get `npm test` green before trusting a matchday scrape.

### Known gaps

- **`mode` is reported as `unknown`.** Nothing in the dashboard DOM states
  whether the league is classic or mantra — the words appear only in CSS
  custom property names. The roster pages do carry a signal
  (`ui-role > div.game-type-1`), so it is recoverable at the cost of one page
  load.
- **`credits` is `null` for every team.** The figure exists, but on the
  per-team roster page (beside `nz-icon[nztype="fc:credits"]`), i.e. one extra
  navigation per team. `TeamSchema` allows `null` and the site renders it.

### Fixtures are synthetic on purpose

`scraper/fixtures/league.html` and `scraper/fixtures/standings.html` mirror the
STRUCTURE of the real pages with INVENTED teams, managers, ids and results.
Real league members' names live in `data/` — which is the product — and never
in a fixture. Recalibration means updating the fixture's shape from the
captured HTML, never pasting the captured HTML in.

## Deploying

The site deploys to Cloudflare Workers static assets via `site/wrangler.jsonc`
(worker name `fantidiano`). Wrangler needs to be authenticated once per
machine:

```
npx wrangler login
```

After that, `npm run deploy` from the repo root builds the site and pushes
it (`astro build && wrangler deploy`, run from `site/`). Once the first
deploy succeeds, set `site` in `site/astro.config.mjs` to the resulting
`*.workers.dev` URL and redeploy so absolute URLs (OG tags, etc.) resolve
correctly, then update the "Live URL" line above.

## Go live with real league data

**Step 0 — purge the demo.** Everything shipped in the repository describes a
fictional league: eight invented managers, one invented matchday, one issue
written about them. None of it may survive the first real scrape. Fictional
managers sitting next to real ones make the archive unreadable — an albo entry
gives no clue which of the two it judges — and the editorial cadences count
issues and awards, so an award already "assigned" to Ottavio makes the newsroom
believe a rotation is in progress that never happened. Before anything else,
delete:

- `content/2026-27/issue-000/` — the demo issue;
- `data/2026-27/matchday-00/` and `data/2026-27/league.json` — the demo dataset;
- the eight dossiers in `editorial/dossier/` (`baldassarre.md`, `clemente.md`,
  `ernesto.md`, `furio.md`, `gastone.md`, `ottavio.md`, `prospero.md`,
  `ulderico.md`) — **keep `_template.md`**, which is the format, not a manager;

and reset `editorial/albo.json` to `[]`, so the award cadences restart from
zero. `editorial/opt-out.json` is not demo data: it is filled in from what the
real league says, before the first issue.

Step 0 is not optional and it is not merely tidy-up: **the demo dataset and a
real `league.json` cannot coexist.** `data/2026-27/matchday-00/` references the
demo team ids `t1`…`t8`, and the real league's ids are numeric. The site's
standings join degrades gracefully rather than failing — `joinTeams` keeps the
raw id when it does not recognise it — so the build stays green while the front
page prints `1 t1 —` where a team and its manager belong. That was verified on
2026-08-20 by scraping the real `league.json` over the demo one and building:
green build, broken page. Purge first, then scrape.

1. Fill in `.env` with real fantacalcio.it credentials. Login, `--capture` and
   `--league` are calibrated (see "Recalibration status"); `--matchday` is not
   and will refuse to run until it has been calibrated at matchday 1.
2. Run `npm run scrape -- --league` once, and produce issues with
   `/nuovo-numero`. Matchday scrapes begin once the season does.
3. `npx wrangler login` (first time only), then `npm run deploy`.