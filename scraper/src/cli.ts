import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright';
import { capturePage, dumpDebug, withSession } from './browser.js';
import { PAGES } from './selectors.js';
import { parseLeague } from './parsers/league.js';
import { parseLineups } from './parsers/lineups.js';
import { parseResults } from './parsers/results.js';
import { parseStandings } from './parsers/standings.js';
import { writeData } from './io.js';
import { LeagueSchema, LineupsSchema, ResultsSchema, StandingsSchema } from './schemas.js';

export const USAGE = 'Usage: npm run scrape -- --league | --matchday <1-38> | --capture';

const MIN_MATCHDAY = 1;
const MAX_MATCHDAY = 38;

// --capture doesn't take a --matchday of its own; matchday-specific pages
// (lineups/results/standings) are captured for this representative
// matchday. Provisional, like the page paths themselves.
const CAPTURE_MATCHDAY = 1;

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

async function runLeague(page: Page): Promise<void> {
  const scrapedAt = new Date().toISOString();

  await step(page, 'navigate:dashboard', () => page.goto(PAGES.dashboard, { waitUntil: 'networkidle' }));
  await step(page, 'navigate:roster', () => page.goto(PAGES.roster, { waitUntil: 'networkidle' }));
  const league = await step(page, 'parse:league', () => parseLeague(page, scrapedAt));
  await step(page, 'write:league', async () => writeData('2026-27/league.json', LeagueSchema, league));
}

/**
 * All three pages are navigated and parsed BEFORE anything is written.
 *
 * A matchday directory holding `lineups.json` but no `results.json` is worse
 * than one that does not exist: the site's referential check keys on
 * `results.json`, and the newsroom reads whatever files it finds. The failure
 * is not hypothetical — run before kickoff, the results and standings pages
 * have nothing to parse, which is exactly when a half-populated directory
 * would be left behind.
 */
async function runMatchday(page: Page, matchday: number): Promise<void> {
  const dir = `2026-27/matchday-${pad2(matchday)}`;

  await step(page, 'navigate:lineups', () => page.goto(PAGES.lineups(matchday), { waitUntil: 'networkidle' }));
  const lineups = await step(page, 'parse:lineups', () => parseLineups(page, matchday));

  await step(page, 'navigate:results', () => page.goto(PAGES.results(matchday), { waitUntil: 'networkidle' }));
  const results = await step(page, 'parse:results', () => parseResults(page, matchday));

  await step(page, 'navigate:standings', () => page.goto(PAGES.standings(matchday), { waitUntil: 'networkidle' }));
  const standings = await step(page, 'parse:standings', () => parseStandings(page, matchday));

  await step(page, 'write:lineups', async () => writeData(`${dir}/lineups.json`, LineupsSchema, lineups));
  await step(page, 'write:results', async () => writeData(`${dir}/results.json`, ResultsSchema, results));
  await step(page, 'write:standings', async () => writeData(`${dir}/standings.json`, StandingsSchema, standings));
}

async function runCapture(page: Page): Promise<void> {
  await step(page, 'capture:dashboard', () => capturePage(page, PAGES.dashboard, 'dashboard'));
  await step(page, 'capture:roster', () => capturePage(page, PAGES.roster, 'roster'));
  await step(page, 'capture:lineups', () =>
    capturePage(page, PAGES.lineups(CAPTURE_MATCHDAY), 'lineups'),
  );
  await step(page, 'capture:results', () =>
    capturePage(page, PAGES.results(CAPTURE_MATCHDAY), 'results'),
  );
  await step(page, 'capture:standings', () =>
    capturePage(page, PAGES.standings(CAPTURE_MATCHDAY), 'standings'),
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

  try {
    await withSession(async (page) => {
      if (args.command === 'league') {
        await runLeague(page);
      } else if (args.command === 'matchday') {
        if (args.matchday === undefined) {
          throw new Error('Internal error: "matchday" command resolved without a matchday number.');
        }
        await runMatchday(page, args.matchday);
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
