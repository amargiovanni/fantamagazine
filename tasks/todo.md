# Tasks

- [x] 1 Repository scaffolding and workspaces
- [x] 2 Scraper package, zod schemas, validated JSON writer
- [x] 3 Parsers for league roster and standings
- [x] 4 Parsers for lineups and results
- [x] 5 Browser session (login, debug dump, capture)
- [x] 6 Scraper CLI
- [x] 7 Editorial layer (style guide, dossiers, albo, nuovo-numero skill)
- [x] 8 Demo dataset and Numero Zero
- [x] 9 Astro site scaffold, collections, design system
- [x] 10 Site pages (front page, issues, archive)
- [x] 11 Site pages (rubriche, albo, classifica charts)
- [x] 12 Cloudflare deploy and verification

## 13 Team rosters (FM-001)

- [x] 13.1 `RosterSchema`/`RostersSchema` in `schemas.ts` (+ shared `LeagueModeSchema`)
- [x] 13.2 `SEL.roster` entries calibrated against the captured roster page
- [x] 13.3 `parseRoster(page, teamId)` — players, credits, league mode
- [x] 13.4 Synthetic `fixtures/roster.html` + parser tests (TDD)
- [x] 13.5 `--league` becomes a two-phase scrape: dashboard + 10 roster pages
- [x] 13.6 `demo-data.test.ts` guards `rosters.json`
- [x] 13.7 Real run against the live site; commit `league.json` + `rosters.json`
- [x] 13.8 README: known gaps closed, daily ops updated

## 14 Rubrica "Le Bombe" (FM-002)

- [x] 14.1 Site: `bombe` in `COLUMNS`/`COLUMN_LABELS`/`DESKS`, guarded by a key-parity test (TDD)
- [x] 14.2 Style guide: §6.7 format, §7 firma Tancredi Soffiata, §9 enum/composition/file name, §11 checklist
- [x] 14.3 `editorial/bombe.json` ledger (empty) + skill `nuovo-numero` reads/updates it
- [x] 14.4 First piece: `content/2026-27/issue-001/bombe.md` (order 6), ≥2 bombe, traceable numbers
- [x] 14.5 Dossier updates + `bombe.json` entries for the bombe launched
- [ ] 14.6 `npm test` + `npm run build` green, preview, wait for editor approval

## 15 Telegram Instant View markup (FM-003, planned)

- [x] 15.0 `IV.md`: template, publishing steps, rhash link usage
- [x] 15.0b `npm run iv-links -- N`: IV link per article of an issue (`site/src/lib/iv.ts` + test)
- [ ] 15.1 `<time datetime>` on the article dateline; `published_date` rule in the template
- [ ] 15.2 `<address class="byline" rel="author">` instead of `<p class="byline">`
- [ ] 15.3 `og:type=article`, `article:published_time`, `article:author`, `og:site_name`
- [ ] 15.4 Build-time test over `dist/` asserting the elements the IV template binds to

## 16 Calibrate `--matchday` on the live season (matchday 1)

- [x] 16.1 `PAGES.lineups(N)` = Angular `round/N`; `PAGES.results` = legacy calendario; drop `NotCalibratedError`
- [x] 16.2 `SEL.results` (legacy `.match-frame`/`li.match`) + `parseResults(page, N)` picking frame N
- [x] 16.3 `SEL.lineups` (round page: match list, showcase, 4 player columns) + `parseRoundMatch` + click driver
- [x] 16.4 Fixtures from the real capture (`round.html`, trimmed `calendar.html`) + tests; retire synthetic ones
- [x] 16.5 `--matchday N` wired: results → lineups → standings; real run writes `data/2026-27/matchday-01/`
- [ ] 16.6 `npm test` green (done 2026-08-25, 66+84 tests); data + issue 3 committed after editor approval
