import type { Page } from 'playwright';
import { RosterSchema, type LeagueMode, type Roster } from '../schemas.js';
import { SEL } from '../selectors.js';

/**
 * What one roster page yields: the team's squad, and the league mode the page
 * happens to state while we are there.
 *
 * The mode is deliberately NOT folded into `Roster`. It is a property of the
 * league, not of the team — every roster page states the same value — so it is
 * returned alongside and reconciled across teams by `resolveMode` rather than
 * repeated ten times in `rosters.json`.
 */
export interface RosterPage {
  roster: Roster;
  mode: LeagueMode;
}

/**
 * Reads one team's roster off `PAGES.roster(teamId)`.
 *
 * Calibrated 2026-08-20 against the captured markup of a real team. The
 * shape of the page and the reason behind every selector is documented on
 * `SEL.roster`; what follows is what the PARSER decides on top of it.
 *
 * **It verifies the page is the team that was asked for.** The roster view is
 * an Angular SPA that also renders a sidebar of every other team, and a
 * client-side route change that did not re-render would leave the previous
 * team's squad on screen. Scraping ten teams in one session and getting the
 * same squad back ten times would produce a `rosters.json` that validates
 * perfectly and is entirely wrong, so the rendered `data-id` is checked
 * against the requested id and a mismatch is a hard failure.
 *
 * **It refuses a paginated table.** The squad must be complete or absent; a
 * page-one-of-two parse is the one failure that looks like success.
 *
 * **`price` and `quotation` are two different columns** of the same row:
 * "Costo", what this manager paid at the auction, and "Qa", what the player is
 * worth today. Both are read, neither is derived from the other, and the gap
 * between them is the overpayment the magazine writes about. A cell that holds
 * no number yields `null` rather than 0 — a player nobody paid for and a
 * player bought for nothing are not the same statement.
 */
export async function parseRoster(page: Page, teamId: string): Promise<RosterPage> {
  const raw = await page.evaluate((sel) => {
    const text = (node: Element | null | undefined): string => node?.textContent?.trim() ?? '';

    /** First integer in `value`, or null. Tolerates the surrounding markup's whitespace. */
    const int = (value: string): number | null => {
      const match = /-?\d+/.exec(value);
      return match ? Number(match[0]) : null;
    };

    const root = document.querySelector(sel.root);
    if (!root) return { ok: false as const, reason: `no "${sel.root}" element on the page` };

    if (root.querySelector(sel.pagination)) {
      return {
        ok: false as const,
        reason:
          `the roster table is paginated (a "${sel.pagination}" is showing), so the rows in the ` +
          'DOM are one page of the squad rather than all of it',
      };
    }

    const header = root.querySelector(sel.header);
    if (!header) return { ok: false as const, reason: `no "${sel.header}" inside "${sel.root}"` };

    const teamCard = header.querySelector(sel.teamCard);
    if (!teamCard) return { ok: false as const, reason: `no "${sel.teamCard}" in the roster header` };

    // The credits figure is a text node beside the icon, inside the icon's
    // parent span; the label ("Crediti") sits in a `small` outside it.
    const creditsIcon = header.querySelector(sel.creditsIcon);
    const credits = creditsIcon ? int(text(creditsIcon.parentElement)) : null;

    const gameTypes: string[] = [];
    const players = [...root.querySelectorAll(sel.row)].flatMap((row) => {
      // `nz-table` renders skeleton rows while loading, which carry no player
      // card. Skipping them keeps a mid-render page from failing the schema.
      const card = row.querySelector(sel.playerCard);
      if (!card) return [];

      const gameType = card.querySelector(sel.roleHost)?.getAttribute(sel.gameTypeAttr);
      if (gameType) gameTypes.push(gameType);

      // The name is the first child of `.player-name`; a loan badge may follow
      // it inside the same element and must not be glued onto the name.
      const nameHolder = card.querySelector(sel.playerName);
      const club = text(card.querySelector(sel.playerClub));

      return [
        {
          name: text(nameHolder?.firstElementChild ?? nameHolder),
          role: [...card.querySelectorAll(sel.roleChip)]
            .map((chip) => chip.getAttribute(sel.roleAttr) ?? '')
            .filter((role) => role !== '')
            .join(';'),
          club: club === '' ? null : club,
          price: int(text(row.querySelector(sel.price))),
          quotation: int(text(row.querySelector(sel.quotation))),
        },
      ];
    });

    return {
      ok: true as const,
      teamId: teamCard.getAttribute(sel.teamIdAttr) ?? '',
      teamName: text(teamCard.querySelector(sel.teamName)),
      credits,
      players,
      gameTypes,
    };
  }, SEL.roster);

  if (!raw.ok) {
    throw new Error(`Roster page for team ${teamId} did not render as expected: ${raw.reason}.`);
  }

  if (raw.teamId !== teamId) {
    throw new Error(
      `Roster page for team ${teamId} is showing team ${raw.teamId || '(none)'} instead. ` +
        'The navigation did not land on the requested team, so the squad on screen belongs to ' +
        'someone else.',
    );
  }

  const roster = RosterSchema.parse({
    teamId,
    teamName: raw.teamName,
    credits: raw.credits,
    players: raw.players,
  });

  return { roster, mode: modeFromGameTypes(raw.gameTypes) };
}

/**
 * Maps the `data-game-type` values found on a roster page to a league mode.
 *
 * Unanimity is required. A page whose player cards disagree is a page we do
 * not understand, and `unknown` is the honest answer — `LeagueSchema` allows
 * it precisely so that nothing has to guess.
 */
function modeFromGameTypes(gameTypes: string[]): LeagueMode {
  const distinct = new Set(gameTypes);
  if (distinct.size !== 1) return 'unknown';

  const [only] = [...distinct];
  if (only === SEL.roster.classicGameType) return 'classic';
  if (only === SEL.roster.mantraGameType) return 'mantra';
  return 'unknown';
}

/**
 * Reduces the modes reported by each team's roster page to the league's mode.
 *
 * Ten pages of one league state one mode; if they do not, something is wrong
 * with either the league or the selector, and the league is reported as
 * `unknown` rather than by majority vote. An empty list is `unknown` too.
 */
export function resolveMode(modes: LeagueMode[]): LeagueMode {
  const distinct = new Set(modes);
  if (distinct.size !== 1) return 'unknown';

  const [only] = [...distinct];
  return only ?? 'unknown';
}
