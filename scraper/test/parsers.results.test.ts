import { describe, expect, it } from 'vitest';
import { ResultsSchema } from '../src/schemas.js';
import { parseResults } from '../src/parsers/results.js';
import { setupBrowser, withFixturePage } from './helpers/page.js';

// fixtures/calendar.html is the live legacy calendario captured 2026-08-25,
// trimmed to two frames: matchday 1 (calculated) and matchday 2 (not yet).
describe('parseResults', () => {
  setupBrowser();

  it('parses the 5 fixtures of matchday 1 covering all 10 teams', async () => {
    await withFixturePage('calendar.html', async (page) => {
      const results = await parseResults(page, 1);

      expect(results.matchday).toBe(1);
      expect(results.fixtures).toHaveLength(5);
      const teamIds = results.fixtures.flatMap((fixture) => [fixture.home.teamId, fixture.away.teamId]);
      expect(new Set(teamIds).size).toBe(10);
      expect(() => ResultsSchema.parse(results)).not.toThrow();
    });
  });

  it('reads goals and fantapoints per side', async () => {
    await withFixturePage('calendar.html', async (page) => {
      const results = await parseResults(page, 1);

      expect(results.fixtures).toContainEqual({
        home: { teamId: '5620165', fantapoints: 77, goals: 2 },
        away: { teamId: '7231597', fantapoints: 91, goals: 6 },
      });
    });
  });

  it('refuses a matchday that has not been calculated', async () => {
    await withFixturePage('calendar.html', async (page) => {
      await expect(parseResults(page, 2)).rejects.toThrow(/not been calculated/);
    });
  });

  it('refuses a matchday whose frame is not on the page', async () => {
    await withFixturePage('calendar.html', async (page) => {
      await expect(parseResults(page, 30)).rejects.toThrow(/30° Giornata/);
    });
  });
});
