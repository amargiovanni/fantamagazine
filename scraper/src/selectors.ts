// PROVISIONAL selectors, designed against our synthetic fixtures.
// After the first real `--capture` run, align these with the captured
// HTML in scraper/fixtures/captured/ and update the fixtures to match.
export const SEL = {
  league: {
    teamRow: '[data-team-id]',
    teamName: '.team-name',
    manager: '.team-manager',
    credits: '.team-credits',
    mode: '[data-league-mode]',
  },
  standings: {
    row: '.standings-row',
    position: '.pos', teamId: 'data-team-id', points: '.pts',
    fantapoints: '.fpts', wins: '.w', draws: '.d', losses: '.l',
  },
  lineups: {
    teamBlock: '[data-lineup-team]',
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
} as const;
