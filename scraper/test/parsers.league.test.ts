import { describe, expect, it } from 'vitest';
import { parseLeague } from '../src/parsers/league.js';
import { setupBrowser, withFixturePage } from './helpers/page.js';

describe('parseLeague', () => {
  setupBrowser();

  it('parses all 8 teams, the league mode and the scrapedAt timestamp', async () => {
    await withFixturePage('league.html', async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');

      expect(league.mode).toBe('classic');
      expect(league.scrapedAt).toBe('2026-08-20T10:00:00Z');
      expect(league.teams).toHaveLength(8);
    });
  });

  it('parses team t1 name, manager and credits', async () => {
    await withFixturePage('league.html', async (page) => {
      const league = await parseLeague(page, '2026-08-20T10:00:00Z');
      const t1 = league.teams.find((team) => team.id === 't1');

      expect(t1).toEqual({ id: 't1', name: 'Real Sarcasmo', manager: 'Furio', credits: 245 });
    });
  });
});
