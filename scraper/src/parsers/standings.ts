import type { Page } from 'playwright';
import { StandingsSchema, type Standings } from '../schemas.js';
import { SEL } from '../selectors.js';

export async function parseStandings(page: Page, matchday: number): Promise<Standings> {
  const rows = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel.row)].map((row) => ({
      position: Number(row.querySelector(sel.position)?.textContent?.trim() ?? NaN),
      teamId: row.getAttribute(sel.teamId) ?? '',
      points: Number(row.querySelector(sel.points)?.textContent?.trim() ?? NaN),
      fantapointsTotal: Number(row.querySelector(sel.fantapoints)?.textContent?.trim() ?? NaN),
      wins: Number(row.querySelector(sel.wins)?.textContent?.trim() ?? NaN),
      draws: Number(row.querySelector(sel.draws)?.textContent?.trim() ?? NaN),
      losses: Number(row.querySelector(sel.losses)?.textContent?.trim() ?? NaN),
    }));
  }, SEL.standings);
  return StandingsSchema.parse({ matchday, rows });
}
