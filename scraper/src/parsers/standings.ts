import type { Page } from 'playwright';
import { StandingsSchema, type Standings } from '../schemas.js';
import { SEL } from '../selectors.js';

/**
 * Reads the league table off the legacy classifica page
 * (`PAGES.standingsLegacy`), calibrated 2026-08-20 against the live site.
 *
 * NOT the Angular `/standings` view: that page is a shell whose only content
 * is an `iframe#legacy-viewport`, so a parser pointed at it sees no table at
 * all. The iframe's document is loaded directly instead.
 *
 * Pre-season this legitimately returns ten rows of zeros — the season has not
 * started, nobody has played — and positions 1..10 in the site's own tie
 * order. That is a real table, not a failed parse: what distinguishes them is
 * the cell being ABSENT rather than reading `0`, which is what the `|| NaN`
 * below is for.
 *
 * `|| NaN` rather than `?? NaN` on every numeric cell, as in the results and
 * lineups parsers: an empty cell yields `''`, and `Number('')` is `0`. A
 * standings table that silently reads ten teams on zero points is a
 * plausible-looking file nobody would question — the NaN makes zod reject it.
 * A cell that really says `0` is the string `'0'`, which is truthy, so a true
 * zero survives.
 */
export async function parseStandings(page: Page, matchday: number): Promise<Standings> {
  const rows = await page.evaluate((sel) => {
    const cell = (row: Element, selector: string): number =>
      Number(row.querySelector(selector)?.textContent?.trim() || NaN);

    return [...document.querySelectorAll(sel.row)].map((row) => ({
      position: cell(row, sel.position),
      teamId: row.getAttribute(sel.teamIdAttr) ?? '',
      points: cell(row, sel.points),
      fantapointsTotal: cell(row, sel.fantapoints),
      wins: cell(row, sel.wins),
      draws: cell(row, sel.draws),
      losses: cell(row, sel.losses),
    }));
  }, SEL.standings);

  return StandingsSchema.parse({ matchday, rows });
}
