import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { ResultsSchema } from '../src/schemas.js';
import { parseResults } from '../src/parsers/results.js';
import { setupBrowser, withFixturePage } from './helpers/page.js';

describe('parseResults', () => {
  setupBrowser();

  it('parses 4 fixtures covering all 8 teams', async () => {
    await withFixturePage('results.html', async (page) => {
      const results = await parseResults(page, 3);

      expect(results.fixtures).toHaveLength(4);
      const teamIds = results.fixtures.flatMap((fixture) => [fixture.home.teamId, fixture.away.teamId]);
      expect(new Set(teamIds).size).toBe(8);
    });
  });

  it('parses the first fixture fantapoints and goals, and validates against ResultsSchema', async () => {
    await withFixturePage('results.html', async (page) => {
      const results = await parseResults(page, 3);

      expect(results.fixtures[0]).toEqual({
        home: { teamId: 't1', fantapoints: 66.5, goals: 2 },
        away: { teamId: 't2', fantapoints: 58.0, goals: 1 },
      });
      expect(() => ResultsSchema.parse(results)).not.toThrow();
    });
  });

  it('throws ZodError when a fantapoints cell is missing', async () => {
    await withFixturePage('results-broken.html', async (page) => {
      await expect(parseResults(page, 3)).rejects.toBeInstanceOf(ZodError);
    });
  });
});
