/**
 * Read-only access to the scraped league data (`data/`) and to the editorial
 * memory (`editorial/albo.json`).
 *
 * The site NEVER imports from `scraper/`: the shapes below are a deliberate
 * duplication of the scraper's contract, and the checks make the duplication
 * self-verifying — a data file that drifts fails the build with a message that
 * names the file and the field, instead of rendering `undefined` on the front
 * page. The validation is hand-rolled rather than zod-based because zod is the
 * scraper's dependency, not the site's, and this project does not add one to
 * save twenty lines.
 *
 * Everything is resolved by `import.meta.glob(..., { eager: true })`, i.e. at
 * build time by Vite: no filesystem access at runtime, so it keeps working on
 * any deploy target.
 */

export interface Team {
  id: string;
  name: string;
  manager: string;
  /**
   * Residual credits. `null` when the roster page did not show them — the
   * scraper's `TeamSchema` already allows it, and a team is still a team
   * without a budget figure.
   */
  credits: number | null;
}

export interface StandingsRow {
  position: number;
  teamId: string;
  points: number;
  fantapointsTotal: number;
  wins: number;
  draws: number;
  losses: number;
}

/** A standings row joined with the team it belongs to. */
export interface StandingsEntry extends StandingsRow {
  teamName: string;
  manager: string;
}

export interface Standings {
  season: string;
  matchday: number;
  entries: StandingsEntry[];
}

export interface Award {
  award: string;
  issue: number;
  manager: string;
  motivation: string;
}

const LEAGUE_FILES = import.meta.glob('../../../data/*/league.json', { eager: true });
const STANDINGS_FILES = import.meta.glob('../../../data/*/matchday-*/standings.json', {
  eager: true,
});
const ALBO_FILE = import.meta.glob('../../../editorial/albo.json', { eager: true });

/* ------------------------------------------------------------- checking */

function fail(path: string, detail: string): never {
  throw new Error(
    `${path} does not match the shape the site expects (${detail}). ` +
      'Re-scrape the file, or update site/src/lib/data.ts — the site duplicates ' +
      "the scraper's contract on purpose, so both sides change in the same commit.",
  );
}

function record(value: unknown, path: string, where: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, `${where} is not an object`);
  }
  return value as Record<string, unknown>;
}

function list(value: unknown, path: string, where: string): unknown[] {
  if (!Array.isArray(value)) fail(path, `${where} is not an array`);
  return value;
}

function text(source: Record<string, unknown>, key: string, path: string, where: string): string {
  const value = source[key];
  if (typeof value !== 'string' || value.length === 0) {
    fail(path, `${where}.${key} is not a non-empty string`);
  }
  return value;
}

function num(source: Record<string, unknown>, key: string, path: string, where: string): number {
  const value = source[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, `${where}.${key} is not a number`);
  }
  return value;
}

/** A number the scraper is allowed to leave out, written as an explicit `null`. */
function numOrNull(
  source: Record<string, unknown>,
  key: string,
  path: string,
  where: string,
): number | null {
  return source[key] === null ? null : num(source, key, path, where);
}

/** JSON modules come through Vite as `{ default: parsed }`. */
function payload(module: unknown): unknown {
  return (module as { default: unknown }).default;
}

/* --------------------------------------------------------------- reading */

/**
 * The three parsers below take already-decoded JSON, not a module, so they can
 * be exercised directly by the unit tests with malformed input — the files in
 * the repository are valid, and a validator nobody can feed bad data to is a
 * validator nobody has tested.
 */
export function parseTeams(value: unknown, path: string): Team[] {
  const league = record(value, path, 'league.json');
  return list(league.teams, path, 'teams').map((raw, index) => {
    const team = record(raw, path, `teams[${index}]`);
    return {
      id: text(team, 'id', path, `teams[${index}]`),
      name: text(team, 'name', path, `teams[${index}]`),
      manager: text(team, 'manager', path, `teams[${index}]`),
      credits: numOrNull(team, 'credits', path, `teams[${index}]`),
    };
  });
}

export function parseStandings(
  value: unknown,
  path: string,
): { matchday: number; rows: StandingsRow[] } {
  const standings = record(value, path, 'standings.json');
  return {
    matchday: num(standings, 'matchday', path, 'standings.json'),
    rows: list(standings.rows, path, 'rows').map((raw, index) => {
      const row = record(raw, path, `rows[${index}]`);
      const where = `rows[${index}]`;
      return {
        position: num(row, 'position', path, where),
        teamId: text(row, 'teamId', path, where),
        points: num(row, 'points', path, where),
        fantapointsTotal: num(row, 'fantapointsTotal', path, where),
        wins: num(row, 'wins', path, where),
        draws: num(row, 'draws', path, where),
        losses: num(row, 'losses', path, where),
      };
    }),
  };
}

/** `../../../data/2026-27/matchday-00/standings.json` → `2026-27` / `0`. */
export function locate(path: string): { season: string; matchday: number } | null {
  const match = /\/([^/]+)\/matchday-(\d+)\/standings\.json$/.exec(path);
  return match ? { season: match[1]!, matchday: Number(match[2]) } : null;
}

/* ----------------------------------------------------------------- API */

/**
 * The standings file to show: the highest matchday of the most recent season.
 * Split out of `getLatestStandings` so the ordering rule — season first, then
 * matchday — is testable without a repository full of fixtures.
 */
export function latestStandingsPath(
  paths: readonly string[],
): { path: string; season: string; matchday: number } | null {
  const located = paths
    .map((path) => ({ path, at: locate(path) }))
    .filter((item): item is { path: string; at: { season: string; matchday: number } } =>
      item.at !== null,
    )
    .sort((a, b) =>
      a.at.season === b.at.season
        ? b.at.matchday - a.at.matchday
        : b.at.season.localeCompare(a.at.season),
    );

  const latest = located[0];
  return latest ? { path: latest.path, ...latest.at } : null;
}

/**
 * Standings rows joined with their teams, sorted by position. A row whose
 * `teamId` is unknown keeps the id as its name rather than rendering
 * `undefined` — the league file and the matchday file are scraped separately
 * and can legitimately disagree for one build.
 */
export function joinTeams(
  rows: readonly StandingsRow[],
  teams: ReadonlyMap<string, Team>,
): StandingsEntry[] {
  return rows
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((row) => ({
      ...row,
      teamName: teams.get(row.teamId)?.name ?? row.teamId,
      manager: teams.get(row.teamId)?.manager ?? '—',
    }));
}

/** Teams of a season, by id. Empty when the season has no `league.json`. */
export function getTeams(season: string): ReadonlyMap<string, Team> {
  const entry = Object.entries(LEAGUE_FILES).find((pair) =>
    pair[0].endsWith(`/${season}/league.json`),
  );
  if (!entry) return new Map();

  return new Map(parseTeams(payload(entry[1]), entry[0]).map((team) => [team.id, team]));
}

/**
 * The most recent standings committed to the repository — the highest matchday
 * of the most recent season — with team names and managers joined in.
 *
 * Returns `null` when no matchday has been scraped yet, which is a legitimate
 * state before the season starts, not an error.
 */
export function getLatestStandings(): Standings | null {
  const latest = latestStandingsPath(Object.keys(STANDINGS_FILES));
  if (!latest) return null;

  const standings = parseStandings(payload(STANDINGS_FILES[latest.path]), latest.path);

  return {
    season: latest.season,
    matchday: latest.matchday,
    entries: joinTeams(standings.rows, getTeams(latest.season)),
  };
}

export function parseAwards(value: unknown, path: string): Award[] {
  return list(value, path, 'albo.json')
    .map((raw, index) => {
      const award = record(raw, path, `[${index}]`);
      return {
        award: text(award, 'award', path, `[${index}]`),
        issue: num(award, 'issue', path, `[${index}]`),
        manager: text(award, 'manager', path, `[${index}]`),
        motivation: text(award, 'motivation', path, `[${index}]`),
      };
    })
    .sort((a, b) => b.issue - a.issue);
}

/** The Albo d'Oro della Vergogna, most recent issue first. */
export function getAwards(): Award[] {
  const entry = Object.entries(ALBO_FILE)[0];
  if (!entry) return [];

  return parseAwards(payload(entry[1]), entry[0]);
}

/** The award to shout about on the front page, or `null` before there is one. */
export function getLatestAward(): Award | null {
  return getAwards()[0] ?? null;
}
