import { z } from 'zod';

export const TeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  manager: z.string().min(1),
  credits: z.number().int().nullable(),
});

export const LeagueSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{2}$/),
  mode: z.enum(['classic', 'mantra', 'unknown']),
  scrapedAt: z.string(),
  teams: z.array(TeamSchema).min(2),
});
export type League = z.infer<typeof LeagueSchema>;

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
