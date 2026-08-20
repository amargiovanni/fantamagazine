import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections for Il Fatto Fantidiano.
 *
 * The schemas below intentionally DUPLICATE the contracts owned by
 * `editorial/style-guide.md` (§9) and `scraper/src/schemas.ts`: the site must
 * never import from `scraper/`, so the duplication is the contract boundary.
 * If a contract changes, both sides change in the same commit.
 */

/** Column slugs are a technical contract (style guide §6). */
export const COLUMNS = [
  'cronaca-pagelle',
  'editoriale',
  'rubrica-fissa',
  'classifiche',
  'mercato',
  'approfondimento',
] as const;

export type Column = (typeof COLUMNS)[number];

/** Human-readable kicker for each column, used by the design system. */
export const COLUMN_LABELS: Record<Column, string> = {
  'cronaca-pagelle': 'Cronaca e pagelle',
  editoriale: 'Editoriale',
  'rubrica-fissa': 'La rubrica',
  classifiche: 'Classifiche',
  mercato: 'Mercato',
  approfondimento: 'Approfondimento',
};

const articles = defineCollection({
  // Entry id looks like `2026-27/issue-000/cronaca-pagelle`.
  loader: glob({ pattern: '*/issue-*/*.md', base: '../content' }),
  schema: z.object({
    column: z.enum(COLUMNS),
    title: z.string().min(1),
    byline: z.string().min(1),
    order: z.number().int().positive(),
  }),
});

const issues = defineCollection({
  // Entry id looks like `2026-27/issue-000/issue`.
  loader: glob({ pattern: '*/issue-*/issue.json', base: '../content' }),
  schema: z.object({
    number: z.number().int().nonnegative(),
    type: z.enum(['pre', 'post', 'midweek']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    matchday: z.number().int().nonnegative().nullable(),
    headline: z.string().min(1),
  }),
});

export const collections = { articles, issues };
