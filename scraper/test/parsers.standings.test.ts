import { describe, expect, it } from 'vitest';
import { StandingsSchema } from '../src/schemas.js';
import { parseStandings } from '../src/parsers/standings.js';
import { setupBrowser, withFixturePage, withHtmlPage } from './helpers/page.js';

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

  /**
   * `Number('')` is `0`, so an empty cell used to parse as a real zero: eight
   * teams on zero points is a file that looks scraped and is not. The parser
   * coerces an empty cell to NaN so the schema rejects the whole table.
   */
  it('rejects a table with an empty numeric cell instead of reading it as zero', async () => {
    const html = `
      <table>
        <tr class="standings-row" data-team-id="t1">
          <td class="pos">1</td><td class="pts"></td><td class="fpts">195.5</td>
          <td class="w">2</td><td class="d">1</td><td class="l">0</td>
        </tr>
        <tr class="standings-row" data-team-id="t2">
          <td class="pos">2</td><td class="pts">6</td><td class="fpts">190.0</td>
          <td class="w">2</td><td class="d">0</td><td class="l">1</td>
        </tr>
      </table>`;

    await withHtmlPage(html, async (page) => {
      await expect(parseStandings(page, 3)).rejects.toThrow(/points/);
    });
  });
});
