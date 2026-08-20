import type { Page } from 'playwright';
import { LeagueSchema, type League } from '../schemas.js';
import { SEL } from '../selectors.js';

/**
 * Reads the league roll-call off the competition dashboard.
 *
 * Calibrated 2026-08-20 against the live site. The source is the dashboard's
 * `ui-standings-card`: one `li` per team, each carrying a link to that team's
 * roster. The team id is the last segment of that href
 * (`/fantac-accia/view/rosters/5322780` -> `5322780`), which is the same id the
 * roster and lineup pages key on, so ids in `league.json` join to everything
 * scraped later. Rows without a roster link are skipped: the card renders
 * placeholder `li`s while the SPA is still loading.
 *
 * `mode` is reported as `unknown`, not guessed. Nothing in the dashboard DOM
 * states it — `classic`/`mantra` appear only as CSS custom property names. The
 * roster pages do carry a usable signal (`ui-role > div.game-type-1`), so this
 * is recoverable when we decide to spend a page load on it; inventing
 * `classic` here because today's league happens to be classic would be a value
 * nobody scraped.
 *
 * `credits` is `null` for every team, which `TeamSchema` allows and the site
 * renders. The figure exists, but on the per-team roster page (`266` beside
 * `nz-icon[nztype="fc:credits"]`), i.e. one extra navigation per team. Wiring
 * that up is a deliberate follow-up, not something to smuggle into the league
 * scrape.
 */
export async function parseLeague(page: Page, scrapedAt: string): Promise<League> {
  const teams = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel.teamRow)]
      .map((row) => {
        const link = row.querySelector(sel.rosterLink);
        const href = link?.getAttribute('href') ?? '';
        return {
          id: href.split('/').filter(Boolean).pop() ?? '',
          name: link?.textContent?.trim() ?? '',
          manager: row.querySelector(sel.manager)?.textContent?.trim() ?? '',
          credits: null,
        };
      })
      .filter((team) => team.id !== '');
  }, SEL.league);

  return LeagueSchema.parse({ season: '2026-27', mode: 'unknown', scrapedAt, teams });
}
