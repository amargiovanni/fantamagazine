import type { Page } from 'playwright';
import { StandingsSchema, type Standings } from '../schemas.js';
import { SEL } from '../selectors.js';

/**
 * `|| NaN` rather than `?? NaN` on every numeric cell, as in the results and
 * lineups parsers: an empty cell yields `''`, and `Number('')` is `0`. A
 * standings table that silently reads eight teams on zero points is a
 * plausible-looking file nobody would question — the NaN makes zod reject it.
 */
export async function parseStandings(page: Page, matchday: number): Promise<Standings> {
  const rows = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel.row)].map((row) => ({
      position: Number(row.querySelector(sel.position)?.textContent?.trim() || NaN),
      teamId: row.getAttribute(sel.teamId) ?? '',
      points: Number(row.querySelector(sel.points)?.textContent?.trim() || NaN),
      fantapointsTotal: Number(row.querySelector(sel.fantapoints)?.textContent?.trim() || NaN),
      wins: Number(row.querySelector(sel.wins)?.textContent?.trim() || NaN),
      draws: Number(row.querySelector(sel.draws)?.textContent?.trim() || NaN),
      losses: Number(row.querySelector(sel.losses)?.textContent?.trim() || NaN),
    }));
  }, SEL.standings);
  return StandingsSchema.parse({ matchday, rows });
}
