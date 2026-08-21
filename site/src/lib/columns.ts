/**
 * The rubriche of Il Fatto Fantidiano as a technical contract.
 *
 * This DUPLICATES `editorial/style-guide.md` §6 and §9 on purpose: the site
 * never imports from `editorial/` or `scraper/`, so the duplication is the
 * contract boundary and both sides change in the same commit. It lives in a
 * plain module (no `astro:content`) so that the content collection schema, the
 * desk map and the unit tests can all import it.
 */

/** Column slugs, in the order the style guide lists them (§6). */
export const COLUMNS = [
  'cronaca-pagelle',
  'editoriale',
  'rubrica-fissa',
  'classifiche',
  'mercato',
  'approfondimento',
  'bombe',
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
  bombe: 'Le Bombe',
};
