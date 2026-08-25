import type { Page } from 'playwright';
import { LineupsSchema, TeamLineupSchema, type Lineups } from '../schemas.js';
import { SEL } from '../selectors.js';

type TeamLineup = Lineups['teams'][number];

/** The two team ids of every match row in the round view's side box, in page order. */
export async function listRoundMatches(page: Page): Promise<Array<{ homeId: string; awayId: string }>> {
  const rows = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel.matchRow)].map((row) =>
      [...row.querySelectorAll(sel.matchTeamCard)].map((card) => card.getAttribute(sel.teamIdAttr) ?? ''),
    );
  }, SEL.lineups);

  return rows
    .filter((ids) => ids.length === 2)
    .map(([homeId, awayId]) => ({ homeId: homeId!, awayId: awayId! }));
}

/**
 * Parses the match currently shown in the round view (`PAGES.lineups(N)`)
 * into its two lineups. Calibrated 2026-08-25 against matchday 1.
 *
 * The four player columns — home starters, away starters, home bench, away
 * bench — are found structurally, as the elements whose direct children are
 * `ui-match-player`s, in DOM order. Anything other than four is a page we do
 * not understand and a hard failure, because a lineup silently missing its
 * bench would still validate.
 *
 * `vote`/`fantavote` are `null` for `s.v.` and for a bench player who never
 * entered (the cell is absent). `club` is not rendered on this page and is
 * `null`; `rosters.json` carries it.
 */
export async function parseRoundMatch(page: Page): Promise<{ home: TeamLineup; away: TeamLineup }> {
  const raw = await page.evaluate(
    ({ sel, shirtRe, moduleRe }) => {
      const text = (node: Element | null | undefined): string => node?.textContent?.trim() ?? '';
      const grade = (node: Element | null | undefined): number | null => {
        const value = text(node).replace(',', '.');
        return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : null;
      };

      const showcase = document.querySelector(sel.showcase);
      if (!showcase) return { ok: false as const, reason: `no "${sel.showcase}" on the page` };

      const sides = [...showcase.querySelectorAll(sel.showcaseShirt)].map((shirt) => {
        const src = shirt.getAttribute(sel.shirtSrcAttr) ?? '';
        const teamId = new RegExp(shirtRe).exec(src)?.[1] ?? '';
        // The module is a text in the same block as the shirt: the shirt's
        // parent holds shirt + name + manager + module.
        const block = shirt.closest('ui-team-shirt')?.parentElement;
        const module = new RegExp(moduleRe).exec(text(block))?.[1] ?? '';
        return { teamId, module };
      });
      if (sides.length !== 2) return { ok: false as const, reason: `${sides.length} team shirts in the showcase, expected 2` };

      const players = document.querySelector(sel.players);
      if (!players) return { ok: false as const, reason: `no "${sel.players}" on the page` };

      const columns = [...players.querySelectorAll('*')].filter((el) =>
        [...el.children].some((child) => child.matches(sel.player)),
      );
      if (columns.length !== 4) {
        return { ok: false as const, reason: `${columns.length} player columns, expected 4 (starters ×2, bench ×2)` };
      }

      const parseColumn = (column: Element) =>
        [...column.children]
          .filter((child) => child.matches(sel.player))
          .map((player) => {
            const card = player.querySelector(sel.playerCard);
            const nameHolder = card?.querySelector(sel.playerName);
            return {
              name: text(nameHolder?.firstElementChild ?? nameHolder),
              role: [...(card?.querySelectorAll(sel.roleChip) ?? [])]
                .map((chip) => chip.getAttribute(sel.roleAttr) ?? '')
                .filter((role) => role !== '')
                .join(';'),
              club: null,
              vote: grade(player.querySelector(sel.vote)),
              fantavote: grade(player.querySelector(sel.fantavote)),
            };
          });

      const [homeStarters, awayStarters, homeBench, awayBench] = columns.map(parseColumn);
      return {
        ok: true as const,
        home: { teamId: sides[0]!.teamId, module: sides[0]!.module, starters: homeStarters, bench: homeBench },
        away: { teamId: sides[1]!.teamId, module: sides[1]!.module, starters: awayStarters, bench: awayBench },
      };
    },
    { sel: SEL.lineups, shirtRe: SEL.lineups.shirtTeamId.source, moduleRe: SEL.lineups.module.source },
  );

  if (!raw.ok) throw new Error(`Round view did not render as expected: ${raw.reason}.`);

  return { home: TeamLineupSchema.parse(raw.home), away: TeamLineupSchema.parse(raw.away) };
}

/** How long the round view is given to swap the shown match after a row click. */
const MATCH_SWITCH_MS = 2500;

/**
 * Walks every match of the round view already open on `page` — clicking each
 * row in the side box, waiting for the showcase to show that match — and
 * returns the matchday's lineups.
 *
 * Every parsed match is checked against the row that was clicked: the
 * showcase must show exactly the two teams of that row, or the click did not
 * take and the previous match is still on screen. Ten identical lineups
 * would validate; this refuses them.
 */
export async function scrapeRoundLineups(page: Page, matchday: number): Promise<Lineups> {
  const matches = await listRoundMatches(page);
  if (matches.length === 0) throw new Error(`Round view for matchday ${matchday} lists no matches.`);

  const teams: TeamLineup[] = [];
  for (const [index, expected] of matches.entries()) {
    await page.locator(SEL.lineups.matchRow).nth(index).click();
    await page.waitForFunction(
      ({ sel, shirtRe, homeId }) => {
        const shirt = document.querySelector(`${sel.showcase} ${sel.showcaseShirt}`);
        const src = shirt?.getAttribute(sel.shirtSrcAttr) ?? '';
        return new RegExp(shirtRe).exec(src)?.[1] === homeId;
      },
      { sel: SEL.lineups, shirtRe: SEL.lineups.shirtTeamId.source, homeId: expected.homeId },
      { timeout: MATCH_SWITCH_MS },
    );

    const { home, away } = await parseRoundMatch(page);
    if (home.teamId !== expected.homeId || away.teamId !== expected.awayId) {
      throw new Error(
        `Match ${index + 1} of matchday ${matchday}: clicked ${expected.homeId}-${expected.awayId} but the ` +
          `showcase shows ${home.teamId}-${away.teamId}.`,
      );
    }
    teams.push(home, away);
  }

  return LineupsSchema.parse({ matchday, teams });
}
