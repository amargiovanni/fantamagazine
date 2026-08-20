import { describe, expect, it } from 'vitest';
import { LineupsSchema } from '../src/schemas.js';
import { parseLineups } from '../src/parsers/lineups.js';
import { setupBrowser, withFixturePage } from './helpers/page.js';

describe('parseLineups', () => {
  setupBrowser();

  it('parses all 8 team lineups', async () => {
    await withFixturePage('lineups.html', async (page) => {
      const lineups = await parseLineups(page, 3);

      expect(lineups.teams).toHaveLength(8);
    });
  });

  it('parses 11 starters and 7 bench players per team, and validates against LineupsSchema', async () => {
    await withFixturePage('lineups.html', async (page) => {
      const lineups = await parseLineups(page, 3);

      for (const team of lineups.teams) {
        expect(team.starters).toHaveLength(11);
        expect(team.bench).toHaveLength(7);
      }
      expect(() => LineupsSchema.parse(lineups)).not.toThrow();
    });
  });

  it('parses a starter with vote and fantavote', async () => {
    await withFixturePage('lineups.html', async (page) => {
      const lineups = await parseLineups(page, 3);
      const t1 = lineups.teams.find((team) => team.teamId === 't1');

      expect(t1?.module).toBe('3-4-3');
      expect(t1?.starters[0]).toEqual({
        name: 'Marco Colombo',
        role: 'P',
        club: 'Inter',
        vote: 5.5,
        fantavote: 5.5,
      });
    });
  });

  it('parses a bench player with null vote and fantavote', async () => {
    await withFixturePage('lineups.html', async (page) => {
      const lineups = await parseLineups(page, 3);
      const t1 = lineups.teams.find((team) => team.teamId === 't1');

      expect(t1?.bench[0]).toEqual({
        name: 'Nicola Vitale',
        role: 'P',
        club: 'Sassuolo',
        vote: null,
        fantavote: null,
      });
    });
  });
});
