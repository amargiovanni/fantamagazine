import { describe, expect, it } from 'vitest';
import { StandingsSchema } from '../src/schemas.js';
import { parseStandings } from '../src/parsers/standings.js';
import { setupBrowser, withFixturePage } from './helpers/page.js';

describe('parseStandings', () => {
  setupBrowser();

  it('parses 8 rows ordered by position', async () => {
    await withFixturePage('standings.html', async (page) => {
      const standings = await parseStandings(page, 3);

      expect(standings.rows).toHaveLength(8);
      expect(standings.rows.map((row) => row.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  it('row 1 has the expected points and fantapoints, and validates against StandingsSchema', async () => {
    await withFixturePage('standings.html', async (page) => {
      const standings = await parseStandings(page, 3);
      const row1 = standings.rows[0];

      expect(row1).toMatchObject({ teamId: 't3', points: 7, fantapointsTotal: 195.5 });
      expect(() => StandingsSchema.parse(standings)).not.toThrow();
    });
  });
});
