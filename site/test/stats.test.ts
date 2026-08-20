import { describe, expect, it } from 'vitest';
import {
  axisTicks,
  latestStandings,
  matchdaysOf,
  pointsByTeamAcrossMatchdays,
  type MatchdayStandings,
} from '../src/lib/stats';
import type { StandingsRow } from '../src/lib/data';

/**
 * The charts are built at build time from these functions, so a mistake here
 * ships as a plausible-looking chart of the wrong numbers — the failure mode a
 * visual check is worst at catching. Hence: fixtures with more than one season,
 * a gap, and a single matchday.
 */

/** A standings row with only the fields a given test cares about spelled out. */
function row(
  position: number,
  teamId: string,
  points: number,
  fantapointsTotal = 60,
): StandingsRow {
  return { position, teamId, points, fantapointsTotal, wins: 0, draws: 0, losses: 0 };
}

const MATCHDAY_0: MatchdayStandings = {
  season: '2026-27',
  matchday: 0,
  rows: [row(1, 't1', 3, 78.5), row(2, 't2', 1, 66), row(3, 't3', 0, 58)],
};

const MATCHDAY_1: MatchdayStandings = {
  season: '2026-27',
  matchday: 1,
  rows: [row(1, 't3', 3, 130), row(2, 't1', 3, 140), row(3, 't2', 1, 120)],
};

const MATCHDAY_2: MatchdayStandings = {
  season: '2026-27',
  matchday: 2,
  rows: [row(1, 't1', 6, 210), row(2, 't3', 4, 195), row(3, 't2', 1, 180)],
};

const LAST_SEASON: MatchdayStandings = {
  season: '2025-26',
  matchday: 37,
  rows: [row(1, 't9', 88, 2400)],
};

describe('latestStandings', () => {
  it('picks the highest matchday when only one season is present', () => {
    expect(latestStandings([MATCHDAY_0, MATCHDAY_2, MATCHDAY_1])).toBe(MATCHDAY_2);
  });

  it('prefers the newer season even when it has fewer matchdays played', () => {
    expect(latestStandings([LAST_SEASON, MATCHDAY_0])).toBe(MATCHDAY_0);
  });

  it('compares matchdays as numbers, not as strings', () => {
    const ninth = { ...MATCHDAY_0, matchday: 9 };
    const tenth = { ...MATCHDAY_0, matchday: 10 };
    expect(latestStandings([tenth, ninth])!.matchday).toBe(10);
  });

  it('returns null when nothing has been scraped yet', () => {
    expect(latestStandings([])).toBeNull();
  });

  it('does not mutate the list it was given', () => {
    const data = [MATCHDAY_0, MATCHDAY_2, MATCHDAY_1];
    latestStandings(data);
    expect(data).toEqual([MATCHDAY_0, MATCHDAY_2, MATCHDAY_1]);
  });
});

describe('matchdaysOf', () => {
  it('lists the current season ascending', () => {
    expect(matchdaysOf([MATCHDAY_2, MATCHDAY_0, MATCHDAY_1])).toEqual([0, 1, 2]);
  });

  it('ignores previous seasons, so a trend never mixes two of them', () => {
    expect(matchdaysOf([LAST_SEASON, MATCHDAY_0, MATCHDAY_1])).toEqual([0, 1]);
  });

  it('is empty when there is no data at all', () => {
    expect(matchdaysOf([])).toEqual([]);
  });
});

describe('pointsByTeamAcrossMatchdays', () => {
  it('returns one series per team, in matchday order', () => {
    expect(pointsByTeamAcrossMatchdays([MATCHDAY_2, MATCHDAY_0, MATCHDAY_1])).toEqual([
      { teamId: 't1', series: [3, 3, 6] },
      { teamId: 't3', series: [0, 3, 4] },
      { teamId: 't2', series: [1, 1, 1] },
    ]);
  });

  it('orders the teams by the latest classifica, not by id', () => {
    const series = pointsByTeamAcrossMatchdays([MATCHDAY_0, MATCHDAY_1]);
    expect(series.map((team) => team.teamId)).toEqual(['t3', 't1', 't2']);
  });

  it('leaves a gap — never a zero — where a team is missing from a matchday', () => {
    const partial: MatchdayStandings = {
      season: '2026-27',
      matchday: 1,
      rows: [row(1, 't1', 3), row(2, 't2', 1)],
    };
    const series = pointsByTeamAcrossMatchdays([MATCHDAY_0, partial, MATCHDAY_2]);
    expect(series.find((team) => team.teamId === 't3')!.series).toEqual([0, null, 4]);
  });

  it('keeps a team that has dropped out of the latest matchday, after the ranked ones', () => {
    const shrunk: MatchdayStandings = {
      season: '2026-27',
      matchday: 1,
      rows: [row(1, 't1', 3), row(2, 't2', 1)],
    };
    const series = pointsByTeamAcrossMatchdays([MATCHDAY_0, shrunk]);
    expect(series.map((team) => team.teamId)).toEqual(['t1', 't2', 't3']);
    expect(series.at(-1)!.series).toEqual([0, null]);
  });

  it('ignores previous seasons', () => {
    const series = pointsByTeamAcrossMatchdays([LAST_SEASON, MATCHDAY_0]);
    expect(series.map((team) => team.teamId)).toEqual(['t1', 't2', 't3']);
    expect(series[0]!.series).toHaveLength(1);
  });

  it('renders a single matchday as a one-point series, which the chart refuses to draw', () => {
    const series = pointsByTeamAcrossMatchdays([MATCHDAY_0]);
    expect(series).toEqual([
      { teamId: 't1', series: [3] },
      { teamId: 't2', series: [1] },
      { teamId: 't3', series: [0] },
    ]);
  });

  it('is empty when there is no data at all', () => {
    expect(pointsByTeamAcrossMatchdays([])).toEqual([]);
  });
});

describe('axisTicks', () => {
  it('rounds the fantapoints of a real matchday up to a readable axis', () => {
    expect(axisTicks(78.5)).toEqual([0, 20, 40, 60, 80]);
  });

  it('always ends at or above the value being plotted', () => {
    for (const max of [1, 3, 7, 12, 45, 99, 100, 101, 638, 2400]) {
      expect(axisTicks(max).at(-1)).toBeGreaterThanOrEqual(max);
    }
  });

  it('starts at zero, so bar length stays proportional to the value', () => {
    expect(axisTicks(638)[0]).toBe(0);
  });

  it('keeps the steps even and free of floating-point dust', () => {
    expect(axisTicks(0.9)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(axisTicks(6)).toEqual([0, 2, 4, 6]);
  });

  it('falls back to a 0–1 axis when there is nothing to plot', () => {
    expect(axisTicks(0)).toEqual([0, 1]);
    expect(axisTicks(Number.NaN)).toEqual([0, 1]);
  });
});
