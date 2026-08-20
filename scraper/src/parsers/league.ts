import type { Page } from 'playwright';
import { LeagueSchema, type League } from '../schemas.js';
import { SEL } from '../selectors.js';

export async function parseLeague(page: Page, scrapedAt: string): Promise<League> {
  const raw = await page.evaluate((sel) => {
    const mode = document.querySelector(sel.mode)?.getAttribute(sel.modeAttr) ?? 'unknown';
    const teams = [...document.querySelectorAll(sel.teamRow)].map((row) => ({
      id: row.getAttribute(sel.teamIdAttr) ?? '',
      name: row.querySelector(sel.teamName)?.textContent?.trim() ?? '',
      manager: row.querySelector(sel.manager)?.textContent?.trim() ?? '',
      credits: Number(row.querySelector(sel.credits)?.textContent?.trim() ?? NaN),
    }));
    return { mode, teams };
  }, SEL.league);
  return LeagueSchema.parse({
    season: '2026-27',
    mode: raw.mode,
    scrapedAt,
    teams: raw.teams.map((t) => ({ ...t, credits: Number.isNaN(t.credits) ? null : t.credits })),
  });
}
