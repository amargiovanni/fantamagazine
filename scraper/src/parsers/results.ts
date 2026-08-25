import type { Page } from 'playwright';
import { ResultsSchema, type Results } from '../schemas.js';
import { SEL } from '../selectors.js';

/**
 * Reads one matchday's results off the legacy calendario
 * (`PAGES.results(N)`), calibrated 2026-08-25 against matchday 1.
 *
 * The page renders every matchday of the season as a `.match-frame`; the one
 * asked for is found by its `N° Giornata` title, never by position, because
 * the frames are lazy-loaded and the DOM does not hold all thirty-eight.
 *
 * **It refuses a matchday that has not been calculated.** An uncalculated
 * frame carries `.next-match` and empty score cells; parsing it would yield
 * `0-0` five times over, which is a plausible-looking results file for a
 * matchday nobody has played. `|| NaN` on every cell keeps an empty cell from
 * reading as zero for the same reason.
 */
export async function parseResults(page: Page, matchday: number): Promise<Results> {
  const raw = await page.evaluate(
    ({ sel, matchday, titleRe }) => {
      const text = (node: Element | null | undefined): string => node?.textContent?.trim() ?? '';
      const num = (node: Element | null | undefined): number => Number(text(node).replace(',', '.') || NaN);
      const titleMatchday = new RegExp(titleRe);

      const frame = [...document.querySelectorAll(sel.frame)].find((candidate) => {
        const match = titleMatchday.exec(text(candidate.querySelector(sel.frameTitle)));
        return match !== null && Number(match[1]) === matchday;
      });
      if (!frame) return { ok: false as const, reason: `no "${sel.frame}" titled "${matchday}° Giornata"` };
      if (frame.querySelector(sel.notCalculated)) {
        return { ok: false as const, reason: `matchday ${matchday} has not been calculated yet` };
      }

      const side = (fixture: Element, selector: string) => {
        const el = fixture.querySelector(selector);
        return {
          teamId: el?.getAttribute(sel.teamIdAttr) ?? '',
          fantapoints: num(el?.querySelector(sel.fantapoints)),
          goals: num(el?.querySelector(sel.goals)),
        };
      };

      return {
        ok: true as const,
        fixtures: [...frame.querySelectorAll(sel.fixture)].map((fixture) => ({
          home: side(fixture, sel.home),
          away: side(fixture, sel.away),
        })),
      };
    },
    { sel: SEL.results, matchday, titleRe: SEL.results.frameTitleMatchday.source },
  );

  if (!raw.ok) {
    throw new Error(`Calendario did not yield matchday ${matchday}: ${raw.reason}.`);
  }

  return ResultsSchema.parse({ matchday, fixtures: raw.fixtures });
}
