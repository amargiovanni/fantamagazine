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

2. **Scrape league data** for a specific matchday:
   ```
   npm run scrape -- --matchday <n>
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

Live URL: (set after first deploy)

## Recalibration (before the first real scrape)

The scraper was built and tested against captured fixtures, not a live
session — `scraper/src/selectors.ts` (`SEL` and `PAGES`) is provisional until
it has been checked against the real site. Before trusting any scraped data:

1. Capture the live markup once real credentials exist in `.env`:
   ```
   npm run scrape -- --capture
   ```
   This dumps the pages the scraper depends on to `scraper/debug/` without
   parsing anything.
2. Diff the captured HTML against `scraper/src/selectors.ts` and update `SEL`
   (element selectors) and `PAGES` (URL paths) wherever the real markup
   disagrees with the provisional ones.
3. Refresh the scraper's fixtures from the newly captured HTML and run
   `npm test` from the repo root until it's green again — the parsers are
   tested against fixtures, so a selector change is only trusted once the
   suite reflects it.
4. Only then run the real scrapes:
   ```
   npm run scrape -- --league
   npm run scrape -- --matchday <n>
   ```

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

1. Fill in `.env` with real fantacalcio.it credentials, then run the
   recalibration procedure above (`--capture`, align `selectors.ts`, refresh
   fixtures, green tests) — the pipeline was only ever exercised against the
   demo dataset until this step.
2. Run `npm run scrape -- --league` once, then `npm run scrape -- --matchday <n>`
   for each matchday to publish, and produce issues with `/nuovo-numero`.
3. `npx wrangler login` (first time only), then `npm run deploy`.