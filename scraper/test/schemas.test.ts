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
