import { describe, expect, it } from 'vitest';
import { parseLeague } from '../src/parsers/league.js';
import { setupBrowser, withFixturePage, withHtmlPage } from './helpers/page.js';

describe('parseLeague', () => {
  setupBrowser();

  it('parses all 8 teams and the scrapedAt timestamp', async () => {
    await withFixturePage('league.html', async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');

      expect(league.scrapedAt).toBe('2026-08-20T10:00:00Z');
      expect(league.teams).toHaveLength(8);
    });
  });

  it('takes each team id from the last segment of its roster href', async () => {
    await withFixturePage('league.html', async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');

      expect(league.teams.map((team) => team.id)).toEqual([
        '9000001', '9000002', '9000003', '9000004',
        '9000005', '9000006', '9000007', '9000008',
      ]);
    });
  });

  it('parses one team name and manager, trimmed, with credits left null', async () => {
    await withFixturePage('league.html', async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');
      const team = league.teams.find((candidate) => candidate.id === '9000001');

      // The live markup wraps both in whitespace (` Real Sarcasmo `), which
      // the fixture reproduces; a schema that only demanded non-empty strings
      // would happily accept the untrimmed version.
      expect(team).toEqual({
        id: '9000001',
        name: 'Real Sarcasmo',
        manager: 'Furio',
        credits: null,
      });
    });
  });

  /**
   * Nothing in the dashboard DOM states the mode, so the parser must say so
   * rather than pick the mode this league happens to use. See the note in
   * `parsers/league.ts`.
   */
  it('reports the league mode as unknown rather than guessing it', async () => {
    await withFixturePage('league.html', async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');

      expect(league.mode).toBe('unknown');
    });
  });

  /**
   * `ui-standings-card` renders placeholder rows while the SPA loads. One that
   * survived into `league.json` would be a team with an empty id, which the
   * schema rejects — taking the other nine real teams down with it.
   */
  it('skips a placeholder row that carries no roster link', async () => {
    const html = `
      <ui-standings-card>
        <ul>
          <li><span>1°</span><span class="skeleton"></span></li>
          <li>
            <span>2°</span>
            <span><a href="/fantac-accia/view/rosters/4242"> Squadra Vera </a><small> Presidente </small></span>
          </li>
          <li>
            <span>3°</span>
            <span><a href="/fantac-accia/view/rosters/4243"> Altra Squadra </a><small> Altro </small></span>
          </li>
        </ul>
      </ui-standings-card>`;

    await withHtmlPage(html, async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');

      expect(league.teams).toHaveLength(2);
      expect(league.teams[0]).toMatchObject({ id: '4242', name: 'Squadra Vera' });
    });
  });
});
