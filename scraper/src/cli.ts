import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright';
import { capturePage, dumpDebug, gotoSettled, withSession } from './browser.js';
import { NotCalibratedError, PAGES } from './selectors.js';
import { parseLeague } from './parsers/league.js';
import { parseRoster, resolveMode } from './parsers/roster.js';
import { parseStandings } from './parsers/standings.js';
import { writeData } from './io.js';
import { LeagueSchema, RostersSchema, StandingsSchema, type LeagueMode, type Roster } from './schemas.js';

/**
 * `--league` is a two-phase scrape, not just the dashboard: it writes both
 * `league.json` and `rosters.json`, because `credits` and the league `mode`
 * exist only on the per-team roster pages. See `runLeague`.
 */
export const USAGE =
  'Usage: npm run scrape -- --league | --matchday <1-38> | --capture\n' +
  '  --league   teams, managers, credits, league mode and every squad ' +
  '(league.json + rosters.json)';

const MIN_MATCHDAY = 1;
const MAX_MATCHDAY = 38;

export type CliCommand = 'league' | 'matchday' | 'capture';

export interface CliArgs {
  command: CliCommand;
  matchday?: number;
}

/**
 * Parses argv into a CliArgs. Pure: no I/O, no process.exit. Throws a plain
 * Error (message starts with USAGE) on missing, invalid, unrecognized, or
 * ambiguous (more than one command flag) input.
 */
export function parseCliArgs(argv: string[]): CliArgs {
  let values: { league?: boolean; matchday?: string; capture?: boolean };
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        league: { type: 'boolean' },
        matchday: { type: 'string' },
        capture: { type: 'boolean' },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${USAGE}\n${message}`);
  }

  const flagsSet = [values.league === true, values.matchday !== undefined, values.capture === true].filter(
    Boolean,
  ).length;

  if (flagsSet !== 1) {
    throw new Error(USAGE);
  }

  if (values.matchday !== undefined) {
    const matchday = Number(values.matchday);
    if (!Number.isInteger(matchday) || matchday < MIN_MATCHDAY || matchday > MAX_MATCHDAY) {
      throw new Error(
        `${USAGE}\nInvalid --matchday "${values.matchday}": must be an integer between ${MIN_MATCHDAY} and ${MAX_MATCHDAY}.`,
      );
    }
    return { command: 'matchday', matchday };
  }

  return { command: values.league ? 'league' : 'capture' };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Runs `fn`. On failure, dumps the current page state via `dumpDebug` (named
 * after this step) before rethrowing an error whose message names the step.
 */
async function step<T>(page: Page, name: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    await dumpDebug(page, name);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Step "${name}" failed: ${message}`);
  }
}

/**
 * Writes `data/<season>/league.json` and `data/<season>/rosters.json` from the
 * live site, in two phases and one authenticated session.
 *
 * **Phase 1** loads the competition dashboard and reads the roll-call off its
 * standings card: every team's id, name and manager.
 *
 * **Phase 2** visits each of those teams' roster pages in turn, for the squad
 * — and for the two things the dashboard cannot state. `credits` is only ever
 * rendered on a roster page, and so is the league `mode`; `parseLeague`
 * therefore returns `null` and `unknown`, and this is where both get their
 * real values. That is why the two files are written by ONE command rather
 * than a `--league` that leaves holes and a `--rosters` that fills them: a
 * `league.json` on disk with `mode: unknown` beside a `rosters.json` that
 * knows the mode is a contradiction nobody would notice.
 *
 * The cost is a page load per team (ten today), all on the same session. A
 * team that fails takes the run down with it rather than writing nine teams
 * into a file that claims to be the league — the failing team's id is in the
 * step name, so `scraper/debug/` says which one and what its page looked like.
 */
async function runLeague(page: Page): Promise<void> {
  const scrapedAt = new Date().toISOString();

  await step(page, 'navigate:dashboard', () => gotoSettled(page, PAGES.dashboard));
  const league = await step(page, 'parse:league', () => parseLeague(page, scrapedAt));

  const rosters: Roster[] = [];
  const modes: LeagueMode[] = [];

  for (const team of league.teams) {
    // Sequential on purpose: one page, one session, one navigation at a time.
    await step(page, `navigate:roster:${team.id}`, () => gotoSettled(page, PAGES.roster(team.id)));
    const parsed = await step(page, `parse:roster:${team.id}`, () => parseRoster(page, team.id));
    rosters.push(parsed.roster);
    modes.push(parsed.mode);
  }

  const mode = resolveMode(modes);
  const creditsByTeam = new Map(rosters.map((roster) => [roster.teamId, roster.credits]));
  const teams = league.teams.map((team) => ({ ...team, credits: creditsByTeam.get(team.id) ?? null }));

  await step(page, 'write:league', async () =>
    writeData('2026-27/league.json', LeagueSchema, { ...league, mode, teams }),
  );
  await step(page, 'write:rosters', async () =>
    writeData('2026-27/rosters.json', RostersSchema, {
      season: league.season,
      mode,
      scrapedAt,
      teams: rosters,
    }),
  );
}

/**
 * Captures the real page set for selector recalibration.
 *
 * Both halves of the split site are taken: the Angular shells (which is what
 * an operator sees in the address bar) and the `legacy=true` documents their
 * iframes actually render, because only the latter contain the standings and
 * calendar tables. One team's roster is captured too — the id is read off the
 * dashboard rather than hardcoded, so this keeps working when the league's
 * membership changes.
 */
async function runCapture(page: Page): Promise<void> {
  await step(page, 'capture:dashboard', () => capturePage(page, PAGES.dashboard, 'dashboard'));

  const league = await step(page, 'parse:league', () => parseLeague(page, new Date().toISOString()));
  const firstTeamId = league.teams[0]!.id;

  await step(page, 'capture:standings', () => capturePage(page, PAGES.standings, 'standings'));
  await step(page, 'capture:standings-legacy', () =>
    capturePage(page, PAGES.standingsLegacy, 'standings-legacy'),
  );
  await step(page, 'capture:rosters', () => capturePage(page, PAGES.rosters, 'rosters'));
  await step(page, 'capture:roster-one-team', () =>
    capturePage(page, PAGES.roster(firstTeamId), 'roster-one-team'),
  );
  await step(page, 'capture:fixtures', () => capturePage(page, PAGES.fixtures, 'fixtures'));
  await step(page, 'capture:fixtures-legacy', () =>
    capturePage(page, PAGES.fixturesLegacy, 'fixtures-legacy'),
  );
}

/**
 * Writes the season-to-date standings from the legacy classifica table.
 *
 * Not wired to a command yet: `--matchday` is refused until matchday 1 (see
 * `main`), and there is no per-matchday standings URL to point this at. It is
 * exercised by the parser tests against `fixtures/standings.html` and will
 * become `--matchday`'s standings step once that URL is verified.
 */
export async function runStandings(page: Page, matchday: number): Promise<void> {
  await step(page, 'navigate:standings', () => gotoSettled(page, PAGES.standingsLegacy));
  const standings = await step(page, 'parse:standings', () => parseStandings(page, matchday));
  await step(page, 'write:standings', async () =>
    writeData(`2026-27/matchday-${pad2(matchday)}/standings.json`, StandingsSchema, standings),
  );
}

export async function main(): Promise<void> {
  let args: CliArgs;
  try {
    args = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }

  // Refused BEFORE the browser launches, not inside the session: there is
  // nothing to log in for. Season 2026-27 has not started, the site publishes
  // no lineups and no results, and the selectors for both are still the
  // synthetic-fixture ones. Running anyway would either 404 or, worse, parse
  // an empty page into a file that looks scraped.
  if (args.command === 'matchday') {
    console.error(new NotCalibratedError('--matchday').message);
    process.exitCode = 1;
    return;
  }

  try {
    await withSession(async (page) => {
      if (args.command === 'league') {
        await runLeague(page);
      } else {
        await runCapture(page);
      }
    });
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

// Only run when invoked as a script (`node dist/src/cli.js ...`), never on
// import, so tests can import `parseCliArgs` without side effects.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
