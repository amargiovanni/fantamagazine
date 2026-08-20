import { describe, expect, it } from 'vitest';
import { LeagueSchema, ResultsSchema, RostersSchema } from '../src/schemas.js';

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

describe('RostersSchema', () => {
  const roster = (teamId: string) => ({
    teamId,
    teamName: 'Real Sarcasmo',
    credits: 42,
    players: [{ name: 'Amilcare Buffagni', role: 'P', club: 'Vigevano', price: 31, quotation: 12 }],
  });

  it('accepts rosters with a nullable club, a nullable price and null credits', () => {
    const rosters = {
      season: '2026-27', mode: 'classic', scrapedAt: '2026-08-20T10:00:00Z',
      teams: [
        roster('9000001'),
        { ...roster('9000002'), credits: null, players: [
          { name: 'Ombretta Falconi', role: 'Dc;Ds', club: null, price: null, quotation: null },
        ] },
      ],
    };
    expect(RostersSchema.parse(rosters).teams).toHaveLength(2);
  });

  it('rejects a team with an empty squad', () => {
    expect(() => RostersSchema.parse({
      season: '2026-27', mode: 'classic', scrapedAt: 'x',
      teams: [{ ...roster('9000001'), players: [] }, roster('9000002')],
    })).toThrow();
  });

  it('rejects a fractional price, which would mean the cost column was misread', () => {
    expect(() => RostersSchema.parse({
      season: '2026-27', mode: 'classic', scrapedAt: 'x',
      teams: [
        { ...roster('9000001'), players: [
          { name: 'X', role: 'P', club: null, price: 3.5, quotation: 1 },
        ] },
        roster('9000002'),
      ],
    })).toThrow();
  });

  it('rejects a player missing the quotation field outright', () => {
    expect(() => RostersSchema.parse({
      season: '2026-27', mode: 'classic', scrapedAt: 'x',
      teams: [
        { ...roster('9000001'), players: [{ name: 'X', role: 'P', club: null, price: 1 }] },
        roster('9000002'),
      ],
    })).toThrow();
  });
});
