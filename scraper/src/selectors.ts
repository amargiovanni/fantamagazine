import { COMPETITION_DASHBOARD, LEAGUE_BASE } from './config.js';

// PROVISIONAL page paths, composed from LEAGUE_BASE, and PROVISIONAL
// selectors, designed against our synthetic fixtures. After the first real
// `--capture` run, align both with the captured HTML in
// scraper/fixtures/captured/ and update the fixtures to match. Page paths
// live next to SEL so URL recalibration happens alongside selector
// recalibration.
export const PAGES = {
  dashboard: COMPETITION_DASHBOARD,
  roster: `${LEAGUE_BASE}/rosters`,
  lineups: (matchday: number) => `${LEAGUE_BASE}/formazioni/${matchday}`,
  results: (matchday: number) => `${LEAGUE_BASE}/risultati/${matchday}`,
  standings: (matchday: number) => `${LEAGUE_BASE}/classifica/${matchday}`,
} as const;

export const SEL = {
  league: {
    teamRow: '[data-team-id]',
    teamIdAttr: 'data-team-id',
    teamName: '.team-name',
    manager: '.team-manager',
    credits: '.team-credits',
    mode: '[data-league-mode]',
    modeAttr: 'data-league-mode',
  },
  standings: {
    row: '.standings-row',
    position: '.pos', teamId: 'data-team-id', points: '.pts',
    fantapoints: '.fpts', wins: '.w', draws: '.d', losses: '.l',
  },
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
  login: {
    open: '.login-button',
    user: 'input[name="username"]',
    pass: 'input[name="password"]',
    submit: 'button[type="submit"]',
    loggedInMarker: '.user-menu',
  },
} as const;
