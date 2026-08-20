import type { Page } from 'playwright';
import { ResultsSchema, type Results } from '../schemas.js';
import { SEL } from '../selectors.js';

export async function parseResults(page: Page, matchday: number): Promise<Results> {
  const raw = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel.fixtureRow)].map((row) => ({
      homeId: row.getAttribute(sel.homeId) ?? '',
      awayId: row.getAttribute(sel.awayId) ?? '',
      homePoints: Number(row.querySelector(sel.homePoints)?.textContent?.trim() || NaN),
      awayPoints: Number(row.querySelector(sel.awayPoints)?.textContent?.trim() || NaN),
      homeGoals: Number(row.querySelector(sel.homeGoals)?.textContent?.trim() || NaN),
      awayGoals: Number(row.querySelector(sel.awayGoals)?.textContent?.trim() || NaN),
    }));
  }, SEL.results);

  return ResultsSchema.parse({
    matchday,
    fixtures: raw.map((fixture) => ({
      home: {
        teamId: fixture.homeId,
        fantapoints: Number.isNaN(fixture.homePoints) ? null : fixture.homePoints,
        goals: Number.isNaN(fixture.homeGoals) ? null : fixture.homeGoals,
      },
      away: {
        teamId: fixture.awayId,
        fantapoints: Number.isNaN(fixture.awayPoints) ? null : fixture.awayPoints,
        goals: Number.isNaN(fixture.awayGoals) ? null : fixture.awayGoals,
      },
    })),
  });
}
