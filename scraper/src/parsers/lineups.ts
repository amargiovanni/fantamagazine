import type { Page } from 'playwright';
import { LineupsSchema, type Lineups } from '../schemas.js';
import { SEL } from '../selectors.js';

export async function parseLineups(page: Page, matchday: number): Promise<Lineups> {
  const raw = await page.evaluate((sel) => {
    const parsePlayer = (el: Element) => ({
      name: el.querySelector(sel.playerName)?.textContent?.trim() ?? '',
      role: el.querySelector(sel.playerRole)?.textContent?.trim() ?? '',
      club: el.querySelector(sel.playerClub)?.textContent?.trim() || null,
      vote: Number(el.querySelector(sel.playerVote)?.textContent?.trim() || NaN),
      fantavote: Number(el.querySelector(sel.playerFantavote)?.textContent?.trim() || NaN),
    });
    return [...document.querySelectorAll(sel.teamBlock)].map((block) => ({
      teamId: block.getAttribute(sel.teamAttr) ?? '',
      module: block.querySelector(sel.module)?.textContent?.trim() ?? '',
      starters: [...block.querySelectorAll(sel.starterRow)].map(parsePlayer),
      bench: [...block.querySelectorAll(sel.benchRow)].map(parsePlayer),
    }));
  }, SEL.lineups);

  const coercePlayer = (player: (typeof raw)[number]['starters'][number]) => ({
    ...player,
    vote: Number.isNaN(player.vote) ? null : player.vote,
    fantavote: Number.isNaN(player.fantavote) ? null : player.fantavote,
  });

  return LineupsSchema.parse({
    matchday,
    teams: raw.map((team) => ({
      ...team,
      starters: team.starters.map(coercePlayer),
      bench: team.bench.map(coercePlayer),
    })),
  });
}
