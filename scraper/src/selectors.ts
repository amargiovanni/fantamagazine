import { COMPETITION_DASHBOARD, COMPETITION_ID, LEAGUE_BASE } from './config.js';

/**
 * Raised by the page builders that have not been calibrated against the live
 * site yet, so a caller gets a sentence naming the reason instead of a scrape
 * of an error page. Thrown at build time, before any navigation happens.
 */
export class NotCalibratedError extends Error {
  constructor(what: string) {
    super(
      `${what} is not yet calibrated for the live season. Season 2026-27 has not started: ` +
        'the site publishes no lineups and no results, so there is no markup to align the ' +
        'parser with. Re-run --capture at matchday 1 and calibrate PAGES/SEL against the ' +
        'captured HTML before scraping a matchday.',
    );
    this.name = 'NotCalibratedError';
  }
}

/**
 * Page URLs, calibrated 2026-08-20 against the live league.
 *
 * The site is an Angular SPA with a legacy tail: some views are native
 * components (dashboard, rosters) and others are a shell whose real content
 * lives in an `iframe#legacy-viewport` pointing at the old server-rendered
 * app. `page.content()` on a shell URL returns the shell, NOT the table — so
 * the standings and fixtures views have a `*Legacy` sibling that addresses the
 * iframe's document directly, which is what the parsers are pointed at.
 */
export const PAGES = {
  /** Native Angular. Carries the full team list (see `SEL.league`). */
  dashboard: COMPETITION_DASHBOARD,

  /** Native Angular. The all-teams roster index. */
  rosters: `${LEAGUE_BASE}/view/rosters`,

  /** Native Angular. One team's roster; ids come from the dashboard's roster hrefs. */
  roster: (teamId: string) => `${LEAGUE_BASE}/view/rosters/${teamId}`,

  /** Shell only — an iframe around `standingsLegacy`. Kept for --capture. */
  standings: `${LEAGUE_BASE}/view/competition/${COMPETITION_ID}/standings`,

  /** The standings table itself, as loaded into `iframe#legacy-viewport`. */
  standingsLegacy: `${LEAGUE_BASE}/classifica?id=${COMPETITION_ID}&app=true&legacy=true`,

  /** Shell only — an iframe around `fixturesLegacy`. Kept for --capture. */
  fixtures: `${LEAGUE_BASE}/view/competition/${COMPETITION_ID}/fixtures`,

  /** The fixtures/calendar table itself, as loaded into `iframe#legacy-viewport`. */
  fixturesLegacy: `${LEAGUE_BASE}/calendario?id=${COMPETITION_ID}&app=true&legacy=true`,

  /**
   * NOT CALIBRATED. Season 2026-27 has not started, so no matchday has
   * lineups or results and there is no markup to design a URL against. Both
   * almost certainly hang off the same legacy competition pattern as
   * `fixturesLegacy` (`/formazioni`, `/risultati`, with `id` and a matchday
   * parameter whose NAME IS UNVERIFIED), which is why the shape is recorded
   * here rather than guessed silently. Re-verify at matchday 1.
   */
  lineups: (_matchday: number): string => {
    throw new NotCalibratedError('--matchday (lineups)');
  },
  results: (_matchday: number): string => {
    throw new NotCalibratedError('--matchday (results)');
  },
  /**
   * NOT CALIBRATED. The live standings page shows the season total only; how
   * a per-matchday standings URL is addressed is unverified until matchday 1.
   * `standingsLegacy` above is the calibrated season-to-date table.
   */
  standingsAt: (_matchday: number): string => {
    throw new NotCalibratedError('--matchday (standings)');
  },
} as const;

export const SEL = {
  /**
   * The dashboard's `ui-standings-card` is the league roll-call: one `li` per
   * team, carrying the roster link (which holds the team id), the team name,
   * the manager and the running points. It is preferred over the standings
   * view because that view is an iframe shell, and over the team cards because
   * `nz-card[data-id]` only ever renders the ONE team you are looking at.
   *
   * Anchored on the `ui-*` element names and the `href` shape, never on the
   * generated `ng-tns-*`/`_ngcontent-*` attributes, which change on every
   * Angular build.
   */
  league: {
    teamRow: 'ui-standings-card li',
    rosterLink: 'a[href*="/view/rosters/"]',
    manager: 'small',
    /**
     * No mode marker exists anywhere in the dashboard DOM — `classic`/`mantra`
     * appear only inside CSS custom properties. The roster pages do carry one
     * (`ui-role > div.game-type-1`), so the mode is recoverable, but only by
     * loading a team's roster; until that is a deliberate decision the parser
     * reports `unknown`, which `LeagueSchema` allows.
     */
    modeUnavailable: true,
  },

  /**
   * The legacy classifica table (`PAGES.standingsLegacy`), calibrated
   * 2026-08-20. Every cell is addressed by the server-rendered `data-key`
   * the old app already puts on it, and the team id is the row's `data-id` —
   * the SAME id the Angular roster URLs use, so standings rows join to
   * `league.json` without a name match.
   *
   * `tbody tr[data-id]` matters twice over: the `thead` carries the same
   * `data-key` attributes on its `th`s, and the page also ships an unrendered
   * Handlebars copy of the whole table. The template lives inside
   * `<script type="text/x-handlebars-template">`, so the browser never parses
   * it into elements and `querySelectorAll` cannot see it — but requiring
   * `data-id` keeps that true even if the site stops wrapping it in a script.
   */
  standings: {
    row: 'tbody tr[data-id]',
    teamIdAttr: 'data-id',
    position: 'td[data-key="index"]',
    points: 'td[data-key="rank-pt"]',
    fantapoints: 'td[data-key="rank-fp"]',
    wins: 'td[data-key="rank-v"]',
    draws: 'td[data-key="rank-n"]',
    losses: 'td[data-key="rank-p"]',
  },

  // ---------------------------------------------------------------------
  // NOT CALIBRATED — designed against the synthetic fixtures and untouched
  // by the 2026-08-20 recalibration. Season 2026-27 has not started, so the
  // live site renders neither lineups nor results. These, their fixtures and
  // their tests are all awaiting matchday 1.
  // ---------------------------------------------------------------------
  lineups: {
    teamBlock: '[data-lineup-team]',
    teamAttr: 'data-lineup-team',
    module: '.module',
    starterRow: '.starters [data-player]',
    benchRow: '.bench [data-player]',
    playerName: '.p-name', playerRole: '.p-role', playerClub: '.p-club',
    playerVote: '.p-vote', playerFantavote: '.p-fvote',
  },
  results: {
    fixtureRow: '[data-fixture]',
    homeId: 'data-home-id', awayId: 'data-away-id',
    homePoints: '.home-fpts', awayPoints: '.away-fpts',
    homeGoals: '.home-goals', awayGoals: '.away-goals',
  },

  /**
   * Login, calibrated 2026-08-20.
   *
   * There is no login BUTTON to open: requesting any league URL while
   * unauthenticated redirects straight to `/login?next=...`. A PubTech consent
   * banner may cover the form and is dismissed first; it is not always shown,
   * so its absence is tolerated.
   *
   * The form is Angular reactive (NG-Zorro): the inputs carry no `name` and no
   * `id`, but they do carry `formcontrolname`, which is a binding the app
   * authors chose rather than markup the framework generated. The submit
   * button starts `disabled` and enables once the form validates — Playwright's
   * click auto-waits for that. "LOGIN" is matched by text because the two
   * buttons in the form are distinguished by nothing else; the other reads
   * "REGISTRATI" and does not contain it.
   */
  login: {
    consentAccept: '#pt-accept-all',
    user: 'input[formcontrolname="username"]',
    pass: 'input[formcontrolname="password"]',
    submit: 'button:has-text("LOGIN")',
    /**
     * The main navigation bar. Verified present in every captured
     * authenticated page (dashboard, standings, rosters, calendario) and
     * absent from the login page.
     */
    loggedInMarker: 'ui-main-nav',
  },
} as const;
