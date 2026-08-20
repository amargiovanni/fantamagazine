# Il Fatto Fantidiano Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full pipeline for a satirical fantacalcio magazine: Playwright scraper for leghe.fantacalcio.it → versioned JSON data → Claude-driven editorial workflow → professional, fully responsive Astro static site deployed on Cloudflare.

**Architecture:** Three isolated components communicating only through committed files. `scraper/` (TS + Playwright) writes zod-validated JSON to `data/2026-27/`. The editorial layer (`editorial/`, `content/`, a `/nuovo-numero` project skill) turns data into Markdown issues. `site/` (Astro 5, static output) renders `content/` + `data/` and deploys as Cloudflare Workers static assets.

**Tech Stack:** Node 22+, TypeScript, Playwright, zod, Vitest, Astro 5, wrangler. No other runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-08-20-fantamagazine-design.md`

## Global Constraints

- Everything committed to the repo is English (code, identifiers, comments, commit messages) — EXCEPT product content (`content/`, `editorial/`), which is Italian: it IS the magazine.
- Commits: `type(scope): imperative subject`, ≤72 chars. One commit, one logical change.
- Allowed dependencies (already approved in the spec — install nothing else): `playwright`, `zod`, `typescript`, `vitest` (scraper); `astro` (site); `wrangler` (site, devDependency). Transitive/init-generated deps of `npm create astro` are fine.
- `.env` (credentials `FC_USERNAME`, `FC_PASSWORD`) and `scraper/debug/` are gitignored from Task 1 onward. Credentials never appear in code, logs, fixtures, or commits.
- League URL constant: `https://leghe.fantacalcio.it/fantac-accia` (competition dashboard: `/view/competition/173122/dashboard`).
- Masthead: **"Il Fatto Fantidiano"**, tagline **"Le notizie che i fantallenatori vorrebbero insabbiare"**. Original parody branding only — never copy the logo/typography lockup of Il Fatto Quotidiano or any real newspaper. Footer satire disclaimer required.
- Every task ships with its tests, run and shown green, before its commit.
- Selectors for fantacalcio.it are PROVISIONAL: no real HTML is available at build time. Parsers are developed against synthetic fixtures that we control; a `--capture` mode saves real pages for recalibration at first authenticated run. This is by design, not a shortcut — see Task 5.

---

### Task 1: Repository scaffolding and workspaces

**Files:**
- Create: `package.json` (root, npm workspaces)
- Create: `.gitignore`
- Create: `.env.example`
- Create: `tasks/todo.md`, `tasks/lessons.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: workspaces `scraper` and `site`; root scripts `scrape`, `dev`, `build`, `deploy`, `test` that later tasks rely on.

- [ ] **Step 1: Root package.json**

```json
{
  "name": "fantamagazine",
  "private": true,
  "type": "module",
  "workspaces": ["scraper", "site"],
  "scripts": {
    "scrape": "npm run scrape -w scraper --",
    "test": "npm run test -w scraper && npm run build -w site",
    "dev": "npm run dev -w site",
    "build": "npm run build -w site",
    "deploy": "npm run deploy -w site"
  }
}
```

- [ ] **Step 2: .gitignore**

```
node_modules/
.env
scraper/debug/
scraper/fixtures/captured/
site/dist/
site/.astro/
.DS_Store
```

- [ ] **Step 3: .env.example**

```
# Credentials for leghe.fantacalcio.it — copy to .env (gitignored) and fill in.
FC_USERNAME=
FC_PASSWORD=
```

- [ ] **Step 4: tasks/todo.md** — copy the task list of this plan as checkboxes. `tasks/lessons.md` starts with just the header `# Lessons`.

- [ ] **Step 5: README.md** — replace with: project name, one-paragraph description (satirical magazine for the Fantac-ACCIA league), the three-component architecture, and a "Daily operations" section documenting: `cp .env.example .env` (fill credentials), `npm run scrape -- --matchday <n>`, `/nuovo-numero` in Claude Code, `npm run dev` preview, `npm run deploy`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold repo with workspaces and task tracking"
```

---

### Task 2: Scraper package, zod schemas, validated JSON writer

**Files:**
- Create: `scraper/package.json`, `scraper/tsconfig.json`, `scraper/vitest.config.ts`
- Create: `scraper/src/schemas.ts`
- Create: `scraper/src/io.ts`
- Test: `scraper/test/schemas.test.ts`, `scraper/test/io.test.ts`

**Interfaces:**
- Consumes: root workspaces from Task 1.
- Produces (used by Tasks 3–6 and by the site's data imports):
  - `schemas.ts`: `LeagueSchema`, `LineupsSchema`, `ResultsSchema`, `StandingsSchema` and inferred types `League`, `Lineups`, `Results`, `Standings`.
  - `io.ts`: `writeData<T>(relPath: string, schema: ZodType<T>, data: unknown): string` — validates, pretty-prints JSON to `<repo-root>/data/<relPath>`, creates directories, returns the absolute path written. Throws `ZodError` on invalid data without writing anything.

- [ ] **Step 1: Package setup.** `scraper/package.json`:

```json
{
  "name": "scraper",
  "private": true,
  "type": "module",
  "scripts": {
    "scrape": "npx tsx src/cli.ts",
    "test": "vitest run"
  }
}
```

Install (approved set only): `npm install -w scraper -D typescript vitest tsx && npm install -w scraper playwright zod`. Note: `tsx` is the standard TS runner bundled workflow for `typescript` projects; if strict interpretation of the approved list is preferred, compile with `tsc` and run `node dist/cli.js` instead — implementer's choice, document it in the README. Run `npx playwright install chromium`. `tsconfig.json`: `"strict": true`, `"module": "NodeNext"`, `"target": "ES2022"`.

- [ ] **Step 2: Write failing schema tests** — `scraper/test/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LeagueSchema, ResultsSchema } from '../src/schemas.js';

describe('LeagueSchema', () => {
  it('accepts a valid league', () => {
    const league = {
      season: '2026-27', mode: 'classic', scrapedAt: '2026-08-20T10:00:00Z',
      teams: [
        { id: 't1', name: 'Real Sarcasmo', manager: 'Andrea', credits: 12 },
        { id: 't2', name: 'Sconforto Cosenza', manager: 'Luca', credits: 0 },
      ],
    };
    expect(LeagueSchema.parse(league).teams).toHaveLength(2);
  });
  it('rejects a league with fewer than 2 teams', () => {
    expect(() => LeagueSchema.parse({ season: '2026-27', mode: 'classic', scrapedAt: 'x', teams: [] })).toThrow();
  });
});

describe('ResultsSchema', () => {
  it('rejects a fixture missing fantapoints', () => {
    expect(() => ResultsSchema.parse({
      matchday: 1,
      fixtures: [{ home: { teamId: 't1', goals: 2 }, away: { teamId: 't2', fantapoints: 61, goals: 0 } }],
    })).toThrow();
  });
});
```

- [ ] **Step 3: Run tests, verify FAIL** (`npm run test -w scraper`) — module not found.

- [ ] **Step 4: Implement `scraper/src/schemas.ts`:**

```ts
import { z } from 'zod';

export const TeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  manager: z.string().min(1),
  credits: z.number().int().nullable(),
});

export const LeagueSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{2}$/),
  mode: z.enum(['classic', 'mantra', 'unknown']),
  scrapedAt: z.string(),
  teams: z.array(TeamSchema).min(2),
});
export type League = z.infer<typeof LeagueSchema>;

export const PlayerSlotSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),          // P/D/C/A (classic) or Mantra role string
  club: z.string().nullable(),      // Serie A club, if shown
  vote: z.number().nullable(),      // newspaper vote, null before votes are out
  fantavote: z.number().nullable(), // vote + bonus/malus
});

export const TeamLineupSchema = z.object({
  teamId: z.string().min(1),
  module: z.string().min(1),        // e.g. "3-4-3"
  starters: z.array(PlayerSlotSchema).min(1),
  bench: z.array(PlayerSlotSchema),
});

export const LineupsSchema = z.object({
  matchday: z.number().int().nonnegative(), // 0 is the demo matchday
  teams: z.array(TeamLineupSchema).min(2),
});
export type Lineups = z.infer<typeof LineupsSchema>;

export const FixtureSideSchema = z.object({
  teamId: z.string().min(1),
  fantapoints: z.number(),
  goals: z.number().int().nonnegative(),
});

export const ResultsSchema = z.object({
  matchday: z.number().int().nonnegative(),
  fixtures: z.array(z.object({ home: FixtureSideSchema, away: FixtureSideSchema })).min(1),
});
export type Results = z.infer<typeof ResultsSchema>;

export const StandingRowSchema = z.object({
  position: z.number().int().positive(),
  teamId: z.string().min(1),
  points: z.number(),
  fantapointsTotal: z.number(),
  wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
});

export const StandingsSchema = z.object({
  matchday: z.number().int().nonnegative(),
  rows: z.array(StandingRowSchema).min(2),
});
export type Standings = z.infer<typeof StandingsSchema>;
```

- [ ] **Step 5: Write failing io tests** — `scraper/test/io.test.ts`: `writeData` writes valid data to a temp `DATA_ROOT` (io reads `process.env.DATA_ROOT ?? <repo-root>/data`) and returns the path; invalid data throws and leaves no file behind. Use `fs.mkdtempSync` for the temp root.

- [ ] **Step 6: Implement `scraper/src/io.ts`:**

```ts
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function dataRoot(): string {
  return process.env.DATA_ROOT ?? join(repoRoot, 'data');
}

export function writeData<T>(relPath: string, schema: ZodType<T>, data: unknown): string {
  const parsed = schema.parse(data); // throws before any write
  const abs = join(dataRoot(), relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
  return abs;
}
```

- [ ] **Step 7: Run tests, verify PASS.**
- [ ] **Step 8: Commit** — `feat(scraper): add zod schemas and validated data writer`

---

### Task 3: Parsers for league roster and standings (+ synthetic fixtures)

**Files:**
- Create: `scraper/src/selectors.ts`
- Create: `scraper/src/parsers/league.ts`, `scraper/src/parsers/standings.ts`
- Create: `scraper/fixtures/league.html`, `scraper/fixtures/standings.html`
- Test: `scraper/test/parsers.league.test.ts`, `scraper/test/parsers.standings.test.ts`
- Create: `scraper/test/helpers/page.ts`

**Interfaces:**
- Consumes: `LeagueSchema`, `StandingsSchema` from Task 2.
- Produces:
  - `selectors.ts`: exported const object `SEL` — ALL CSS selectors live here and only here, so recalibration after the first real capture touches one file.
  - `parseLeague(page: Page, scrapedAt: string): Promise<League>`
  - `parseStandings(page: Page, matchday: number): Promise<Standings>`
  - Test helper `withFixturePage(fixtureFile: string, fn: (page: Page) => Promise<void>)` — launches shared chromium, `page.setContent(fixtureHtml)`, runs `fn`. Reused by Task 4 tests.

- [ ] **Step 1: `scraper/src/selectors.ts`** — single source of selector truth:

```ts
// PROVISIONAL selectors, designed against our synthetic fixtures.
// After the first real `--capture` run, align these with the captured
// HTML in scraper/fixtures/captured/ and update the fixtures to match.
export const SEL = {
  league: {
    teamRow: '[data-team-id]',
    teamName: '.team-name',
    manager: '.team-manager',
    credits: '.team-credits',
    mode: '[data-league-mode]',
  },
  standings: {
    row: '.standings-row',
    position: '.pos', teamId: 'data-team-id', points: '.pts',
    fantapoints: '.fpts', wins: '.w', draws: '.d', losses: '.l',
  },
  lineups: {
    teamBlock: '[data-lineup-team]',
    module: '.module',
    starterRow: '.starters [data-player]',
    benchRow: '.bench [data-player]',
    playerName: '.p-name', playerRole: '.p-role', playerClub: '.p-club',
    playerVote: '.p-vote', playerFantavote: '.p-fvote',
  },
  results: {
    fixtureRow: '[data-fixture]',
    homeId: 'data-home-id', awayId: 'data-away-id',
    homePoints: '.home-fpts', awayPoints: '.away-fpts',
    homeGoals: '.home-goals', awayGoals: '.away-goals',
  },
} as const;
```

- [ ] **Step 2: Synthetic fixtures.** Write `league.html` and `standings.html` as minimal but realistic pages (8 teams, Italian team names with comic potential — e.g. Real Sarcasmo, Sconforto Cosenza, Atletico Malinconia, Palla Lunga e Pedalare FC) whose markup matches `SEL` exactly. Fixture data must be internally consistent (same 8 team ids everywhere: `t1`…`t8`).

- [ ] **Step 3: Test helper** `scraper/test/helpers/page.ts` — chromium launched once per suite (`beforeAll`/`afterAll` exported as `setupBrowser()`), `withFixturePage(file, fn)` reads `scraper/fixtures/<file>`, `page.setContent(html)`, calls `fn(page)`, closes page.

- [ ] **Step 4: Write failing tests.** `parsers.league.test.ts`: parses 8 teams; team `t1` has the expected name/manager/credits; mode is read from `[data-league-mode]`. `parsers.standings.test.ts`: 8 rows, ordered by position; row 1 has expected points/fantapoints; result validates against `StandingsSchema`.

- [ ] **Step 5: Run tests, verify FAIL.**

- [ ] **Step 6: Implement parsers.** Pattern (league shown; standings analogous):

```ts
import type { Page } from 'playwright';
import { LeagueSchema, type League } from '../schemas.js';
import { SEL } from '../selectors.js';

export async function parseLeague(page: Page, scrapedAt: string): Promise<League> {
  const raw = await page.evaluate((sel) => {
    const mode = document.querySelector(sel.mode)?.getAttribute('data-league-mode') ?? 'unknown';
    const teams = [...document.querySelectorAll(sel.teamRow)].map((row) => ({
      id: row.getAttribute('data-team-id') ?? '',
      name: row.querySelector(sel.teamName)?.textContent?.trim() ?? '',
      manager: row.querySelector(sel.manager)?.textContent?.trim() ?? '',
      credits: Number(row.querySelector(sel.credits)?.textContent?.trim() ?? NaN),
    }));
    return { mode, teams };
  }, SEL.league);
  return LeagueSchema.parse({
    season: '2026-27',
    mode: raw.mode,
    scrapedAt,
    teams: raw.teams.map((t) => ({ ...t, credits: Number.isNaN(t.credits) ? null : t.credits })),
  });
}
```

Every parser ends in `Schema.parse(...)` — parsers, not callers, own validation.

- [ ] **Step 7: Run tests, verify PASS.**
- [ ] **Step 8: Commit** — `feat(scraper): parse league roster and standings from fixtures`

---

### Task 4: Parsers for lineups and results

**Files:**
- Create: `scraper/src/parsers/lineups.ts`, `scraper/src/parsers/results.ts`
- Create: `scraper/fixtures/lineups.html`, `scraper/fixtures/results.html`
- Test: `scraper/test/parsers.lineups.test.ts`, `scraper/test/parsers.results.test.ts`

**Interfaces:**
- Consumes: `SEL`, `withFixturePage`, schemas from Tasks 2–3.
- Produces: `parseLineups(page: Page, matchday: number): Promise<Lineups>`, `parseResults(page: Page, matchday: number): Promise<Results>`.

- [ ] **Step 1: Fixtures.** `lineups.html`: all 8 teams (`t1`…`t8`), each with module, 11 starters, 7 bench players; players carry name/role/club and vote/fantavote cells (empty string = null, to exercise the null path). `results.html`: 4 fixtures covering all 8 teams with fantapoints (decimals, e.g. `66.5`) and goals. Same team ids as Task 3.
- [ ] **Step 2: Write failing tests** — counts, one exact player spot-check per section (a starter with vote+fantavote, a bench player with null votes), schema round-trip, and: `parseResults` on a fixture page with a missing fantapoints cell throws ZodError (add a `results-broken.html` fixture with one cell removed).
- [ ] **Step 3: Verify FAIL. Step 4: Implement** following the exact Task 3 pattern (`page.evaluate` with `SEL.lineups` / `SEL.results`, `Number()`/NaN→null coercion outside evaluate, terminal `Schema.parse`).
- [ ] **Step 5: Verify PASS. Step 6: Commit** — `feat(scraper): parse lineups and matchday results`

---

### Task 5: Browser session — login, navigation, debug dump, capture mode

**Files:**
- Create: `scraper/src/browser.ts`
- Create: `scraper/src/config.ts`
- Test: `scraper/test/browser.test.ts` (dump logic only — no live site in tests)

**Interfaces:**
- Consumes: nothing from parsers (deliberately independent).
- Produces:
  - `config.ts`: `loadConfig(): { username: string; password: string }` (reads `.env` via `process.env` after a tiny hand-rolled dotenv loader — 10 lines, no dependency; throws a clear error listing which var is missing), plus exported consts `LEAGUE_BASE = 'https://leghe.fantacalcio.it/fantac-accia'` and `COMPETITION_DASHBOARD = LEAGUE_BASE + '/view/competition/173122/dashboard'`.
  - `browser.ts`:
    - `withSession(fn: (page: Page) => Promise<void>): Promise<void>` — launches chromium (headless, but `HEADFUL=1` env flips it for manual captcha rescue), navigates to the fantacalcio.it login, authenticates, verifies login succeeded (presence of a logged-in marker; on failure dump + throw), runs `fn`, always closes the browser.
    - `dumpDebug(page: Page, step: string): Promise<string>` — writes `scraper/debug/<timestamp>-<step>.png` (screenshot) and `.html` (content), returns the directory; every navigation/parse step in the CLI wraps calls with `try/catch { await dumpDebug(page, step); throw }`.
    - `capturePage(page: Page, url: string, name: string): Promise<string>` — navigates and saves raw HTML to `scraper/fixtures/captured/<name>.html` (gitignored). Used by `--capture` to collect real markup for selector recalibration.
- Login flow: navigate to `LEAGUE_BASE`, click the login entry point, fill username/password, submit, wait for network idle. Selectors for the login form live in `SEL.login` (add to `selectors.ts`: `{ open: '.login-button', user: 'input[name="username"]', pass: 'input[name="password"]', submit: 'button[type="submit"]', loggedInMarker: '.user-menu' }`) — provisional like all others.
- **Never log the password.** `loadConfig` result is never printed; errors mention variable names only.

- [ ] **Step 1: Failing test for `dumpDebug`** — with a fixture page loaded via `withFixturePage`, `dumpDebug(page, 'unit')` creates both files in a temp debug dir (`DEBUG_ROOT` env override, same pattern as `DATA_ROOT`).
- [ ] **Step 2: Failing test for `loadConfig`** — with `FC_USERNAME` set and `FC_PASSWORD` unset, throws an error whose message contains `FC_PASSWORD` and NOT the value of `FC_USERNAME`.
- [ ] **Step 3: Verify FAIL. Step 4: Implement. Step 5: Verify PASS.**
- [ ] **Step 6: Commit** — `feat(scraper): add authenticated session, debug dumps and capture mode`

---

### Task 6: Scraper CLI

**Files:**
- Create: `scraper/src/cli.ts`
- Test: `scraper/test/cli.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–5.
- Produces: the commands documented in the README:
  - `npm run scrape -- --league` → login, open competition dashboard + roster pages, write `2026-27/league.json`.
  - `npm run scrape -- --matchday 3` → write `2026-27/matchday-03/lineups.json`, `results.json`, `standings.json` (zero-padded dir).
  - `npm run scrape -- --capture` → save the real HTML of every page we parse into `scraper/fixtures/captured/`.
  - Exported pure function `parseCliArgs(argv: string[]): { command: 'league' | 'matchday' | 'capture'; matchday?: number }` using `node:util` `parseArgs` — throws usage error on missing/invalid input (matchday must be 1–38).

- [ ] **Step 1: Failing tests for `parseCliArgs`** — `['--matchday','3']` → `{ command:'matchday', matchday:3 }`; `['--matchday','0']` throws; `[]` throws with usage text; `['--league']` and `['--capture']` map correctly.
- [ ] **Step 2: Verify FAIL. Step 3: Implement** `parseCliArgs` + a `main()` that wires `withSession` → navigate to each page (URLs composed from `LEAGUE_BASE`; page paths listed as constants next to `SEL` so they're recalibrated together) → parser → `writeData`. Each step wrapped with `dumpDebug` on failure; exit code 1, message names the failed step. `main()` runs only when invoked as a script (`import.meta.url` check) so tests can import `parseCliArgs` safely.
- [ ] **Step 4: Verify PASS** (unit tests; live commands can't run without credentials — that's expected and documented).
- [ ] **Step 5: Commit** — `feat(scraper): add CLI for league, matchday and capture scrapes`

---

### Task 7: Editorial layer — style guide, dossier system, albo, /nuovo-numero skill

**Files:**
- Create: `editorial/style-guide.md`
- Create: `editorial/dossier/_template.md`
- Create: `editorial/albo.json`
- Create: `.claude/skills/nuovo-numero/SKILL.md`

**Interfaces:**
- Consumes: data layout from Task 2, content layout consumed by Task 9.
- Produces:
  - Article frontmatter contract (site depends on it): `column: 'cronaca-pagelle' | 'editoriale' | 'rubrica-fissa' | 'classifiche' | 'mercato' | 'approfondimento'`, `title: string`, `byline: string` (fake author name), `order: number`.
  - Issue metadata contract `content/2026-27/issue-NNN/issue.json`: `{ "number": 1, "type": "pre" | "post" | "midweek", "date": "YYYY-MM-DD", "matchday": number | null, "headline": string }`.
  - `editorial/albo.json`: array of `{ "award": string, "issue": number, "manager": string, "motivation": string }`.

- [ ] **Step 1: `editorial/style-guide.md`** (Italian — it's product content). Must define: the magazine's voice (finto-serio, giornalismo d'inchiesta applicato a disastri da 61 punti; colpisce le SCELTE dei fantallenatori, mai la persona; niente riferimenti a vita privata, lavoro, famiglia — solo fantacalcio); the fixed columns with format rules (pagelle: voto + due righe al vetriolo; "Lo Sconfitto della Settimana"; oroscopo del fantallenatore; posta del cuore); the fake bylines roster (e.g. "Gianni Sfotta, inviato di pessima volontà", invent 4–6); recurring awards ("Panchina d'Oro del Disonore", "Mano de Dios del Mercato", invent 4–6 with assignment criteria); the rule that every joke about a manager must trace to a fact in `data/` or `editorial/dossier/`; headline style (tabloid, nove colonne).
- [ ] **Step 2: `editorial/dossier/_template.md`** — sections: Anagrafica fantacalcistica (team, manager name, motto), Soprannomi (with origin), Running joke attivi (each with "nato nel numero N" and status), Premi vinti, Precedenti notevoli (facts with matchday refs), Materiale inutilizzato.
- [ ] **Step 3: `editorial/albo.json`** — `[]` (empty array; populated by issues).
- [ ] **Step 4: `.claude/skills/nuovo-numero/SKILL.md`** — frontmatter `name: nuovo-numero`, `description:` "Produce a new issue (pre/post/midweek) of Il Fatto Fantidiano: reads league data and editorial memory, writes the articles, updates dossiers, previews locally. Use when the user asks for a new issue, numero, pre-giornata, post-giornata or approfondimento." Body (checklist the skill enforces, in order): (1) determine issue type and number (next `issue-NNN`); (2) for pre/post: verify `data/2026-27/matchday-NN/` exists — if missing, stop and ask to run the scraper; (3) read `editorial/style-guide.md`, ALL dossiers, the last 3 issues, `albo.json`; (4) write `issue.json` + one `.md` per article with the Task 7 frontmatter contract (pre → mercato + editoriale; post → cronaca-pagelle + classifiche + editoriale + rubrica-fissa; midweek → editoriale + 1-2 approfondimento); (5) every claim traceable to data/dossier — no invented results, invented QUOTES are fine and must be absurd enough that nobody could believe them real; (6) update dossiers and `albo.json` with what the new issue established; (7) run `npm run build` — must pass; (8) start `npm run dev`, hand the URL to the editor, STOP for approval; (9) only after approval: commit `content: numero N — <headline>` and run `npm run deploy`.
- [ ] **Step 5: Commit** — `feat(editorial): add style guide, dossier system and nuovo-numero skill`

---

### Task 8: Demo dataset and Numero Zero

**Files:**
- Create: `data/2026-27/league.json`, `data/2026-27/matchday-00/{lineups,results,standings}.json`
- Create: `content/2026-27/issue-000/issue.json` + 5 articles
- Create: `editorial/dossier/` one file per demo manager (8)
- Modify: `editorial/albo.json` (first two awards)

**Interfaces:**
- Consumes: schemas (Task 2), editorial contracts (Task 7).
- Produces: enough committed content for the site (Tasks 9–11) to build, style and be previewed against. THE DEMO RULE: all demo data uses the 8 fictional teams from the Task 3 fixtures (Real Sarcasmo, Sconforto Cosenza, Atletico Malinconia, Palla Lunga e Pedalare FC + 4 more invented) with fictional manager first names — NO real league members, since real names arrive only with the first real scrape. Issue 000 is visibly labeled "Numero Zero di collaudo" in its headline.

- [ ] **Step 1: Demo data.** Write the JSON files by hand, then validate: add `scraper/test/demo-data.test.ts` that reads every file under `data/2026-27/` and parses it with the matching schema (league→LeagueSchema, etc. — match by filename). This test permanently guards ALL committed data, including future real scrapes.
- [ ] **Step 2: Verify the new test passes** against the demo files (fix data, not the test).
- [ ] **Step 3: Numero Zero.** Following the style guide as if `/nuovo-numero` had run for a `post` issue on matchday-00: `issue.json` (`number: 0, type: "post", matchday: 0`), articles: one `cronaca-pagelle` (with pagelle for all 8), one `classifiche`, one `editoriale` (the direttore introduces the testata), one `rubrica-fissa` (Lo Sconfitto della Settimana), one `mercato` teaser. Full-length, actually funny, Italian — this is the writing-quality benchmark, not lorem ipsum. Create the 8 dossiers from the template and register 2 awards in `albo.json`.
- [ ] **Step 4: Commit** — `content: add demo dataset and numero zero`

---

### Task 9: Astro site — scaffold, content collections, design system

**Files:**
- Create: `site/` (Astro project: `package.json`, `astro.config.mjs`, `tsconfig.json`)
- Create: `site/src/content.config.ts`
- Create: `site/src/layouts/Base.astro`, `site/src/styles/global.css`
- Create: `site/src/components/{Masthead,Footer,ArticleCard}.astro`
- Test: build passes (`npm run build -w site`) — this is the site's smoke test per spec.

**Interfaces:**
- Consumes: `content/` and `editorial/albo.json` contracts (Task 7), demo content (Task 8).
- Produces (Tasks 10–11 rely on these exact names):
  - Collections: `articles` (glob md under `../content`, id like `2026-27/issue-000/cronaca`), `issues` (glob `issue.json` files). Frontmatter/entry schemas mirror Task 7 contracts (duplicate the zod schemas here — the site must not import from `scraper/`).
  - `Base.astro` props: `{ title: string; description?: string }`. Renders masthead, `<slot/>`, footer with the satire disclaimer: "Il Fatto Fantidiano è una testata satirica non registrata e non affiliata ad alcuna testata reale né a fantacalcio.it. Ogni citazione è inventata, ogni sfottò è affettuoso, ogni classifica purtroppo è vera."
  - Helper module `site/src/lib/issues.ts`: `getIssuesSorted(): Promise<IssueEntry[]>` (desc by number), `getArticlesForIssue(issueNumber: number): Promise<ArticleEntry[]>` (asc by `order`), `issueSlug(n: number): string` (`numero-0` → path `/numeri/numero-0/`).

- [ ] **Step 1: Scaffold.** `npm create astro@latest site -- --template minimal --no-install --no-git`, then `npm install -w site` and `npm install -w site -D wrangler`. `astro.config.mjs`: `output: 'static'` (default), `site` left unset until deploy URL known (set in Task 12).
- [ ] **Step 2: Content collections** with `glob` loaders (`base: '../content'`); verify `npm run build -w site` fails informatively when an article's frontmatter violates the schema (temporarily break one demo file to see it, then restore). Add the spec's referential check in `lib/issues.ts`: `assertIssueData(issue)` throws at build time when an issue has `matchday !== null` but `data/2026-27/matchday-NN/` (zero-padded, discovered via `import.meta.glob`) has no `results.json`; call it from `getIssuesSorted()` so every page build enforces it.
- [ ] **Step 3: Design system.** REQUIRED SUB-SKILL for this step: `frontend-design`. Direction: early-1900s Italian broadsheet meets modern tabloid — masthead in a strong serif display face loaded via a Google Fonts `<link>` in `Base.astro` (no npm dependency; pick one display serif + one text serif, e.g. "Playfair Display" + "Source Serif 4", with full system-serif fallback stacks), column rules, drop caps for lead paragraphs, halftone-style borders; palette: aged newsprint (`#faf6ee`) + ink (`#1a1814`) + one scandal-red accent (`#a3172a`); dark mode via `prefers-color-scheme` (ink paper inverted, same red). Fully responsive: single column <640px, front-page grid ≥1024px, fluid type via `clamp()`. All CSS in `global.css` + component styles; no client-side JS.
- [ ] **Step 4: Build green** with demo content rendering through a throwaway index page listing article titles (replaced in Task 10).
- [ ] **Step 5: Commit** — `feat(site): scaffold Astro with content collections and design system`

---

### Task 10: Site pages — front page, issue pages, archive

**Files:**
- Create: `site/src/pages/index.astro`
- Create: `site/src/pages/numeri/index.astro`
- Create: `site/src/pages/numeri/[slug].astro`
- Create: `site/src/pages/numeri/[slug]/[article].astro`
- Create: `site/src/components/{FrontPage,PagelleTable,IssueNav}.astro`

**Interfaces:**
- Consumes: collections + `lib/issues.ts` (Task 9).
- Produces: routes `/`, `/numeri/`, `/numeri/numero-N/`, `/numeri/numero-N/<article-id>/`.

- [ ] **Step 1: Front page** (`index.astro` + `FrontPage.astro`): latest issue as a scandal front page — giant headline (issue `headline`), lead article (lowest `order`) with drop cap and "continua a pagina..." link, secondary articles in a broadsheet grid, sidebar with current standings top 3 + link, strillo band for the latest award from `albo.json`.
- [ ] **Step 2: Issue page** (`[slug].astro` via `getStaticPaths` from `getIssuesSorted`): issue header (number, date, type label — "Edizione del Lunedì" for post, "Edizione del Mercato" for pre, "L'Inchiesta del Mercoledì" for midweek), full articles in `order`, `IssueNav` prev/next.
- [ ] **Step 3: Article permalink page** and **archive** (`numeri/index.astro`: reverse-chron list styled as a newspaper stack).
- [ ] **Step 4: Responsive pass** — verify at 360px, 768px, 1280px via `npm run dev` + browser tools or Astro build + screenshots; no horizontal scroll anywhere.
- [ ] **Step 5: Build green. Step 6: Commit** — `feat(site): front page, issue pages and archive`

---

### Task 11: Site pages — rubriche, albo d'oro, classifica with charts

**Files:**
- Create: `site/src/pages/rubriche/[column].astro`
- Create: `site/src/pages/albo-doro.astro`
- Create: `site/src/pages/classifica.astro`
- Create: `site/src/components/charts/{StandingsBars,PointsTrend}.astro`
- Create: `site/src/lib/stats.ts`
- Test: `site/` has no test runner — charts logic goes in `lib/stats.ts` as pure functions; validated by build + visual check. Keep functions trivial enough that the build-time type check + rendered output review suffices.

**Interfaces:**
- Consumes: collections; `data/2026-27/**` imported directly (`import.meta.glob('../../../data/2026-27/**/*.json')`).
- Produces: routes `/rubriche/<column>/`, `/albo-doro/`, `/classifica/`; `stats.ts`: `latestStandings(data): Standings`, `pointsByTeamAcrossMatchdays(data): { teamId: string; series: number[] }[]`.

- [ ] **Step 1: Rubriche index pages** — `getStaticPaths` over the 6 column values; each page lists that column's articles reverse-chron with the column's fake byline presented as a rubrica header.
- [ ] **Step 2: Albo d'Oro della Vergogna** — awards from `albo.json` grouped by award, trophy-cabinet styling, each with motivation and issue link.
- [ ] **Step 3: Classifica** — REQUIRED SUB-SKILL for chart design: `dataviz` (read before writing chart code). Build-time SVG only: horizontal bar chart of current standings (fantapoints), line/slope chart of points across matchdays once ≥2 matchdays exist (with demo data: renders the single-matchday state gracefully — bars only, trend hidden with an editorial-voice empty state, e.g. "Troppo presto per illudersi."). Charts must be theme-aware and readable at 360px (scroll container if needed).
- [ ] **Step 4: Build green, responsive check. Step 5: Commit** — `feat(site): rubriche, albo d'oro and standings charts`

---

### Task 12: Cloudflare deploy, full verification, ops docs

**Files:**
- Create: `site/wrangler.jsonc`
- Modify: `site/package.json` (add `deploy` script), root `README.md`, `tasks/todo.md`

**Interfaces:**
- Consumes: built site from Tasks 9–11.
- Produces: `npm run deploy` from repo root → live site.

- [ ] **Step 1: `site/wrangler.jsonc`:**

```jsonc
{
  "name": "fantidiano",
  "compatibility_date": "2026-08-20",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" }
}
```

Add `site/src/pages/404.astro` (editorial-voice 404: "Pagina non trovata. Come i punti della tua panchina."). `site/package.json` scripts: `"deploy": "astro build && wrangler deploy"`.

- [ ] **Step 2: Deploy.** `npm run deploy`. If wrangler is not authenticated, run `npx wrangler login` — if interactive auth is impossible in this session, STOP and record the exact command the user must run; do not fake success. On success set `site` in `astro.config.mjs` to the `*.workers.dev` URL and rebuild+redeploy.
- [ ] **Step 3: Full verification (Done means):** `npm test` from root (scraper suite + site build) — output shown; live URL fetched at least once with the response shown (front page HTML contains the masthead). Update README ops section with the live URL and the recalibration procedure (first real run: `--capture`, align `selectors.ts`, refresh fixtures, tests green, then `--league` and `--matchday`).
- [ ] **Step 4: Commit** — `feat(site): deploy to Cloudflare Workers static assets`

---

## Post-plan notes for the executor

- The user approved autonomous execution ("non disturbarmi finché non hai finito"). The only legitimate hard stops are: wrangler authentication requiring interactive login, and anything destructive. Everything else: decide, note it, proceed.
- The first REAL scrape cannot happen in this build (credentials live only in the user's `.env`, which does not exist yet). The deliverable is: pipeline fully working end-to-end on the demo dataset, deployed, with the recalibration path documented and tested-by-design.
- Final report to the user must include: live URL, what runs on demo data, the exact 3 steps to go live with real league data.
