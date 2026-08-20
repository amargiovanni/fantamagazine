import { describe, expect, it } from 'vitest';
import {
  joinTeams,
  latestStandingsPath,
  parseAwards,
  parseStandings,
  parseTeams,
  type StandingsRow,
  type Team,
} from '../src/lib/data';

/**
 * `data.ts` duplicates the scraper's contract on purpose (the site never
 * imports from `scraper/`). These tests are what keeps the duplication honest:
 * a data file that drifts must fail the build with a message naming the file
 * and the field, not render `undefined` on the front page.
 */

const PATH = '../../../data/2026-27/matchday-00/standings.json';

const STANDINGS = {
  matchday: 0,
  rows: [
    { position: 2, teamId: 't5', points: 3, fantapointsTotal: 74, wins: 1, draws: 0, losses: 0 },
    { position: 1, teamId: 't1', points: 3, fantapointsTotal: 78.5, wins: 1, draws: 0, losses: 0 },
  ],
};

const LEAGUE = {
  season: '2026-27',
  mode: 'classic',
  teams: [
    { id: 't1', name: 'Real Sarcasmo', manager: 'Furio', credits: 245 },
    { id: 't5', name: 'Dinamo Rimpianto', manager: 'Ernesto', credits: 225 },
  ],
};

const ALBO = [
  { award: 'La Panchina d’Oro del Disonore', issue: 0, manager: 'Ottavio', motivation: 'Tredici e mezzo in panchina.' },
  { award: 'Lo Sconfitto della Settimana', issue: 2, manager: 'Prospero', motivation: 'Perde per mezzo punto.' },
];

/** Deep-clone so a test that corrupts a fixture cannot leak into the next one. */
function broken<T>(fixture: T, mutate: (copy: any) => void): unknown {
  const copy = structuredClone(fixture);
  mutate(copy);
  return copy;
}

describe('parseStandings', () => {
  it('returns typed rows for a valid file', () => {
    const result = parseStandings(STANDINGS, PATH);
    expect(result.matchday).toBe(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({
      position: 2,
      teamId: 't5',
      points: 3,
      fantapointsTotal: 74,
      wins: 1,
      draws: 0,
      losses: 0,
    });
    expect(typeof result.rows[1]!.fantapointsTotal).toBe('number');
  });

  it('names the file and the field when a row loses a number', () => {
    const input = broken(STANDINGS, (copy) => delete copy.rows[0].fantapointsTotal);
    expect(() => parseStandings(input, PATH)).toThrowError(
      /data\/2026-27\/matchday-00\/standings\.json .*rows\[0\]\.fantapointsTotal is not a number/,
    );
  });

  it('names the field when a number arrives as a string', () => {
    const input = broken(STANDINGS, (copy) => {
      copy.rows[1].points = '3';
    });
    expect(() => parseStandings(input, PATH)).toThrowError(/rows\[1\]\.points is not a number/);
  });

  it('rejects a missing teamId by name', () => {
    const input = broken(STANDINGS, (copy) => {
      copy.rows[0].teamId = '';
    });
    expect(() => parseStandings(input, PATH)).toThrowError(
      /rows\[0\]\.teamId is not a non-empty string/,
    );
  });

  it('rejects rows that are not an array, and a file that is not an object', () => {
    expect(() => parseStandings({ matchday: 0, rows: {} }, PATH)).toThrowError(
      /rows is not an array/,
    );
    expect(() => parseStandings([], PATH)).toThrowError(/standings\.json is not an object/);
    expect(() => parseStandings(null, PATH)).toThrowError(/standings\.json is not an object/);
  });

  it('tells the reader how to fix it, not just what is wrong', () => {
    expect(() => parseStandings(null, PATH)).toThrowError(/site\/src\/lib\/data\.ts/);
  });
});

describe('parseTeams', () => {
  it('returns every team with its manager and credits', () => {
    const teams = parseTeams(LEAGUE, '../../../data/2026-27/league.json');
    expect(teams).toHaveLength(2);
    expect(teams[0]).toEqual({ id: 't1', name: 'Real Sarcasmo', manager: 'Furio', credits: 245 });
  });

  it('names the offending team when a manager is blank', () => {
    const input = broken(LEAGUE, (copy) => {
      copy.teams[1].manager = '';
    });
    expect(() => parseTeams(input, '../../../data/2026-27/league.json')).toThrowError(
      /league\.json .*teams\[1\]\.manager is not a non-empty string/,
    );
  });

  it('rejects a teams field that is not an array', () => {
    const input = broken(LEAGUE, (copy) => {
      copy.teams = 'otto squadre';
    });
    expect(() => parseTeams(input, '../../../data/2026-27/league.json')).toThrowError(
      /teams is not an array/,
    );
  });
});

describe('parseAwards', () => {
  const path = '../../../editorial/albo.json';

  it('returns the awards most recent issue first', () => {
    const awards = parseAwards(ALBO, path);
    expect(awards.map((a) => a.issue)).toEqual([2, 0]);
    expect(awards[0]!.manager).toBe('Prospero');
    expect(awards[1]!.award).toBe('La Panchina d’Oro del Disonore');
  });

  it('names the entry and the field when a motivation is missing', () => {
    const input = broken(ALBO, (copy) => delete copy[0].motivation);
    expect(() => parseAwards(input, path)).toThrowError(
      /albo\.json .*\[0\]\.motivation is not a non-empty string/,
    );
  });

  it('rejects a file that is not an array', () => {
    expect(() => parseAwards({ awards: [] }, path)).toThrowError(/albo\.json is not an array/);
  });
});

describe('latestStandingsPath', () => {
  const paths = [
    '../../../data/2025-26/matchday-38/standings.json',
    '../../../data/2026-27/matchday-00/standings.json',
    '../../../data/2026-27/matchday-09/standings.json',
    '../../../data/2026-27/matchday-10/standings.json',
  ];

  it('picks the highest matchday of the most recent season', () => {
    expect(latestStandingsPath(paths)).toEqual({
      path: '../../../data/2026-27/matchday-10/standings.json',
      season: '2026-27',
      matchday: 10,
    });
  });

  it('compares matchdays as numbers, not as zero-padded strings', () => {
    const twoDigits = [
      '../../../data/2026-27/matchday-09/standings.json',
      '../../../data/2026-27/matchday-10/standings.json',
    ];
    expect(latestStandingsPath(twoDigits)!.matchday).toBe(10);
  });

  it('prefers the newer season even when it has fewer matchdays played', () => {
    expect(
      latestStandingsPath([
        '../../../data/2025-26/matchday-38/standings.json',
        '../../../data/2026-27/matchday-00/standings.json',
      ])!.season,
    ).toBe('2026-27');
  });

  it('ignores paths that are not matchday standings, and returns null for none', () => {
    expect(latestStandingsPath(['../../../data/2026-27/league.json'])).toBeNull();
    expect(latestStandingsPath([])).toBeNull();
  });
});

describe('joinTeams', () => {
  const teams: ReadonlyMap<string, Team> = new Map(
    LEAGUE.teams.map((team) => [team.id, team as Team]),
  );

  it('sorts by position and joins the team name and manager', () => {
    const entries = joinTeams(STANDINGS.rows as StandingsRow[], teams);
    expect(entries.map((e) => e.position)).toEqual([1, 2]);
    expect(entries[0]!.teamName).toBe('Real Sarcasmo');
    expect(entries[0]!.manager).toBe('Furio');
    expect(entries[1]!.teamName).toBe('Dinamo Rimpianto');
  });

  it('does not mutate the rows it was given', () => {
    const rows = structuredClone(STANDINGS.rows) as StandingsRow[];
    joinTeams(rows, teams);
    expect(rows[0]!.position).toBe(2);
  });

  it('falls back to the id when league.json and the matchday file disagree', () => {
    const orphan: StandingsRow[] = [
      { position: 1, teamId: 't99', points: 0, fantapointsTotal: 0, wins: 0, draws: 0, losses: 1 },
    ];
    const [entry] = joinTeams(orphan, teams);
    expect(entry!.teamName).toBe('t99');
    expect(entry!.manager).toBe('—');
  });
});
