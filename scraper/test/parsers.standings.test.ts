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

      expect(row1).toEqual({
        position: 1,
        teamId: '9000003',
        points: 7,
        fantapointsTotal: 195.5,
        wins: 2,
        draws: 1,
        losses: 0,
      });
      expect(() => StandingsSchema.parse(standings)).not.toThrow();
    });
  });

  /**
   * The `thead` carries the same `data-key` attributes as the body cells, and
   * the page ships an unrendered Handlebars copy of the whole table. Neither
   * may contribute a row: the header would read as NaN, the template as a row
   * of literal `{{...}}`. Both are present in the fixture, so counting eight
   * rows above already proves it — this pins the reason down to the ids.
   */
  it('ignores the header row and the Handlebars template copy of the table', async () => {
    await withFixturePage('standings.html', async (page) => {
      const standings = await parseStandings(page, 3);

      expect(standings.rows.map((row) => row.teamId)).toEqual([
        '9000003', '9000001', '9000005', '9000008',
        '9000002', '9000004', '9000007', '9000006',
      ]);
    });
  });

  /**
   * Pre-season, the live table really is ten teams on zero. A parser that
   * treated an all-zero table as a failure would refuse to scrape a legitimate
   * state; what must fail is a MISSING cell, not a zero one.
   */
  it('accepts a genuine all-zero pre-season table', async () => {
    const html = `
      <table><tbody>
        <tr data-id="5322780">
          <td data-key="index"><span>1</span></td>
          <td data-key="rank-v"><span>0</span></td><td data-key="rank-n"><span>0</span></td>
          <td data-key="rank-p"><span>0</span></td><td data-key="rank-pt"><span>0</span></td>
          <td data-key="rank-fp"><span>0</span></td>
        </tr>
        <tr data-id="5620165">
          <td data-key="index"><span>2</span></td>
          <td data-key="rank-v"><span>0</span></td><td data-key="rank-n"><span>0</span></td>
          <td data-key="rank-p"><span>0</span></td><td data-key="rank-pt"><span>0</span></td>
          <td data-key="rank-fp"><span>0</span></td>
        </tr>
      </tbody></table>`;

    await withHtmlPage(html, async (page) => {
      const standings = await parseStandings(page, 0);

      expect(standings.rows).toHaveLength(2);
      expect(standings.rows[0]).toMatchObject({ teamId: '5322780', points: 0, fantapointsTotal: 0 });
    });
  });

  /**
   * `Number('')` is `0`, so an empty cell used to parse as a real zero: eight
   * teams on zero points is a file that looks scraped and is not. The parser
   * coerces an empty cell to NaN so the schema rejects the whole table.
   */
  it('rejects a table with an empty numeric cell instead of reading it as zero', async () => {
    const html = `
      <table><tbody>
        <tr data-id="9000001">
          <td data-key="index"><span>1</span></td>
          <td data-key="rank-v"><span>2</span></td><td data-key="rank-n"><span>1</span></td>
          <td data-key="rank-p"><span>0</span></td><td data-key="rank-pt"><span></span></td>
          <td data-key="rank-fp"><span>195.5</span></td>
        </tr>
        <tr data-id="9000002">
          <td data-key="index"><span>2</span></td>
          <td data-key="rank-v"><span>2</span></td><td data-key="rank-n"><span>0</span></td>
          <td data-key="rank-p"><span>1</span></td><td data-key="rank-pt"><span>6</span></td>
          <td data-key="rank-fp"><span>190.0</span></td>
        </tr>
      </tbody></table>`;

    await withHtmlPage(html, async (page) => {
      await expect(parseStandings(page, 3)).rejects.toThrow(/points/);
    });
  });
});
