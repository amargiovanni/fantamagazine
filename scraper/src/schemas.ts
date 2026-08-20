import { z } from 'zod';

/**
 * How the league scores its players. `unknown` is a real, reportable state,
 * not a placeholder: the mode is only stated by the roster pages
 * (`ui-player-role[data-game-type]`), so anything scraped without visiting one
 * must say it does not know rather than assume the mode this league happens
 * to use.
 */
export const LeagueModeSchema = z.enum(['classic', 'mantra', 'unknown']);
export type LeagueMode = z.infer<typeof LeagueModeSchema>;

export const TeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  manager: z.string().min(1),
  credits: z.number().int().nullable(),
});

export const LeagueSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{2}$/),
  mode: LeagueModeSchema,
  scrapedAt: z.string(),
  teams: z.array(TeamSchema).min(2),
});
export type League = z.infer<typeof LeagueSchema>;

/**
 * One player on a team's roster, as the roster table renders them.
 *
 * `price` is the AUCTION price (the table's "Costo" column, `data-key="cost"`)
 * — what this manager paid, not the player's current quotation, which is a
 * separate column. It is nullable because a league that never ran an auction
 * renders the column empty; in this league it is always a number.
 *
 * `role` is whatever the page states, verbatim: `P`/`D`/`C`/`A` in classic. A
 * mantra player holds several roles, which the markup renders as several
 * `[data-role]` chips, and they are joined with `;` (`Dc;Ds`) rather than
 * collapsed to one.
 */
export const RosterPlayerSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  club: z.string().nullable(),      // Serie A club, if shown
  price: z.number().int().nonnegative().nullable(),
});

/**
 * `credits` is the team's REMAINING budget, the figure beside the credits
 * icon in the roster header — not the sum of what it spent. The two add up to
 * the league budget (945 + 55 = 1000 for the first team scraped on
 * 2026-08-20), which is the sanity check to run on a fresh scrape.
 *
 * `players` is `min(1)` on purpose: an empty roster is never a legitimate
 * result here, it is a page that did not finish rendering, and it must fail
 * loudly rather than be written out as a team with no squad.
 */
export const RosterSchema = z.object({
  teamId: z.string().min(1),
  teamName: z.string().min(1),
  credits: z.number().int().nullable(),
  players: z.array(RosterPlayerSchema).min(1),
});
export type Roster = z.infer<typeof RosterSchema>;

export const RostersSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{2}$/),
  mode: LeagueModeSchema,
  scrapedAt: z.string(),
  teams: z.array(RosterSchema).min(2),
});
export type Rosters = z.infer<typeof RostersSchema>;

export const PlayerSlotSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),          // P/D/C/A (classic) or Mantra role string
  club: z.string().nullable(),      // Serie A club, if shown
  vote: z.number().nullable(),      // newspaper vote, null before votes are out
  fantavote: z.number().nullable(), // vote + bonus/malus
});

export const TeamLineupSchema = z.object({
  teamId: z.string().min(1),
  module: z.string().min(1),        // e.g. "3-4-3"
  starters: z.array(PlayerSlotSchema).min(1),
  bench: z.array(PlayerSlotSchema),
});

export const LineupsSchema = z.object({
  matchday: z.number().int().nonnegative(), // 0 is the demo matchday
  teams: z.array(TeamLineupSchema).min(2),
});
export type Lineups = z.infer<typeof LineupsSchema>;

export const FixtureSideSchema = z.object({
  teamId: z.string().min(1),
  fantapoints: z.number(),
  goals: z.number().int().nonnegative(),
});

export const ResultsSchema = z.object({
  matchday: z.number().int().nonnegative(),
  fixtures: z.array(z.object({ home: FixtureSideSchema, away: FixtureSideSchema })).min(1),
});
export type Results = z.infer<typeof ResultsSchema>;

export const StandingRowSchema = z.object({
  position: z.number().int().positive(),
  teamId: z.string().min(1),
  points: z.number(),
  fantapointsTotal: z.number(),
  wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
});

export const StandingsSchema = z.object({
  matchday: z.number().int().nonnegative(),
  rows: z.array(StandingRowSchema).min(2),
});
export type Standings = z.infer<typeof StandingsSchema>;
