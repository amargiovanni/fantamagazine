/**
 * The numbers the charts plot.
 *
 * Everything here is a pure function over already-parsed standings, so the
 * ordering rules — which matchday is "the latest", which season a trend belongs
 * to, what a team's series looks like when it is missing from a matchday — are
 * unit-testable without a repository full of fixtures. The only impure export
 * is `getAllStandings()`, which resolves the repository's files through
 * `import.meta.glob` at build time exactly as `data.ts` does; the site never
 * imports from `scraper/`.
 *
 * Parsing and validation are NOT duplicated here: `data.ts` owns the shape
 * checks and this module reuses them.
 */
import { locate, parseStandings, type StandingsRow } from './data';

/** One scraped `standings.json`, with the season and matchday it came from. */
export interface MatchdayStandings {
  season: string;
  matchday: number;
  rows: StandingsRow[];
}

/**
 * A team's league points across the matchdays of the current season.
 *
 * `series` is aligned with `matchdaysOf(data)` — one entry per matchday, in
 * matchday order. `null` means the team is absent from that matchday's file,
 * which is a real state (a team joining late, a half-scraped matchday) and is
 * drawn as a gap in the line rather than invented as a zero. This widens the
 * `number[]` of the original task brief on purpose: a chart that plots a
 * missing value as 0 lies about the data.
 */
export interface TeamSeries {
  teamId: string;
  series: (number | null)[];
}

const STANDINGS_FILES = import.meta.glob('../../../data/*/matchday-*/standings.json', {
  eager: true,
});

/** JSON modules come through Vite as `{ default: parsed }`. */
function payload(module: unknown): unknown {
  return (module as { default: unknown }).default;
}

/**
 * Newest first: most recent season, then highest matchday. Same rule as
 * `data.ts`'s `latestStandingsPath`, applied to parsed records instead of file
 * paths — seasons are compared as strings (`2026-27` > `2025-26`), which holds
 * for as long as the season directories keep the `YYYY-YY` naming.
 */
function newestFirst(a: MatchdayStandings, b: MatchdayStandings): number {
  return a.season === b.season ? b.matchday - a.matchday : b.season.localeCompare(a.season);
}

/**
 * The standings to show: the highest matchday of the most recent season.
 * `null` when nothing has been scraped yet — a legitimate state before the
 * season starts, not an error.
 */
export function latestStandings(data: readonly MatchdayStandings[]): MatchdayStandings | null {
  return data.length === 0 ? null : [...data].sort(newestFirst)[0]!;
}

/**
 * The matchdays of the most recent season present in `data`, ascending.
 * A trend never mixes two seasons: the x axis of a chart that did would be a
 * lie about time.
 */
export function matchdaysOf(data: readonly MatchdayStandings[]): number[] {
  const latest = latestStandings(data);
  if (!latest) return [];

  return [
    ...new Set(
      data.filter((entry) => entry.season === latest.season).map((entry) => entry.matchday),
    ),
  ].sort((a, b) => a - b);
}

/**
 * League points per team across the current season's matchdays.
 *
 * Teams come out in the order of the most recent matchday's classifica
 * (position 1 first), so the trend's small multiples read in the same order as
 * the table beside them. A team that has since disappeared from the standings
 * is appended, ordered by id, rather than dropped.
 */
export function pointsByTeamAcrossMatchdays(data: readonly MatchdayStandings[]): TeamSeries[] {
  const latest = latestStandings(data);
  if (!latest) return [];

  const matchdays = matchdaysOf(data);
  const bySeason = data.filter((entry) => entry.season === latest.season);

  /** matchday → (teamId → points), so a lookup per cell stays O(1). */
  const grid = new Map<number, Map<string, number>>(
    matchdays.map((matchday) => [
      matchday,
      new Map(
        bySeason
          .filter((entry) => entry.matchday === matchday)
          .flatMap((entry) => entry.rows)
          .map((row) => [row.teamId, row.points] as const),
      ),
    ]),
  );

  const ranked = [...latest.rows]
    .sort((a, b) => a.position - b.position)
    .map((row) => row.teamId);
  const stragglers = [
    ...new Set(bySeason.flatMap((entry) => entry.rows).map((row) => row.teamId)),
  ]
    .filter((teamId) => !ranked.includes(teamId))
    .sort();

  return [...ranked, ...stragglers].map((teamId) => ({
    teamId,
    series: matchdays.map((matchday) => grid.get(matchday)?.get(teamId) ?? null),
  }));
}

/**
 * Axis ticks from zero to a round number at or above `max`, at a step a reader
 * recognises (1, 2, 2.5, 5 or 10 times a power of ten).
 *
 * The charts scale their marks against the LAST tick, not against `max`, so the
 * axis and the bars can never disagree — the classic build-time chart bug where
 * the longest bar overshoots the last gridline.
 */
export function axisTicks(max: number, targetSteps = 4): number[] {
  if (!Number.isFinite(max) || max <= 0 || targetSteps < 1) return [0, 1];

  const magnitude = 10 ** Math.floor(Math.log10(max / targetSteps));
  const step =
    [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= max / targetSteps) ??
    magnitude * 10;

  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  // Accumulating `value += step` drifts on non-integer steps (0.1 + 0.2); the
  // tick index does not.
  for (let index = 0; index * step <= top + step / 1e6; index += 1) {
    ticks.push(Number((index * step).toFixed(6)));
  }
  return ticks;
}

/**
 * Every `standings.json` committed to the repository, parsed and validated by
 * `data.ts`. Resolved by Vite at build time: no filesystem access at runtime.
 */
export function getAllStandings(): MatchdayStandings[] {
  return Object.entries(STANDINGS_FILES)
    .map(([path]) => ({ path, at: locate(path) }))
    .filter((file): file is { path: string; at: { season: string; matchday: number } } =>
      file.at !== null,
    )
    .map(({ path, at }) => ({
      season: at.season,
      matchday: at.matchday,
      rows: parseStandings(payload(STANDINGS_FILES[path]), path).rows,
    }));
}
