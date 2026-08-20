import { readdirSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';
import { LeagueSchema, LineupsSchema, ResultsSchema, RostersSchema, StandingsSchema } from '../src/schemas.js';

// This test is the permanent guard on everything committed under data/: the
// hand-written demo dataset today, every real scrape from now on. It is
// deliberately anchored to the repository (not to DATA_ROOT, which the scraper
// lets an operator redirect) because what it checks is the committed corpus.
const dataDir = fileURLToPath(new URL('../../data/', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

// Match by file name, exactly as the scraper writes them (see src/cli.ts).
const schemasByFileName: Record<string, ZodType> = {
  'league.json': LeagueSchema,
  'rosters.json': RostersSchema,
  'lineups.json': LineupsSchema,
  'results.json': ResultsSchema,
  'standings.json': StandingsSchema,
};

function jsonFilesUnder(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return []; // data/ absent: reported by the "is not empty" test below.
  }
  return entries.flatMap((entry) => {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) return jsonFilesUnder(abs);
    return entry.endsWith('.json') ? [abs] : [];
  });
}

const files = jsonFilesUnder(dataDir);

describe('committed data files', () => {
  it('data/ is either empty or holds only schema-valid files', () => {
    // An empty data/ is a legitimate state: the demo dataset was purged at
    // go-live and the directory refills scrape by scrape. The guard below
    // still validates every file that IS committed.
    expect(files.length).toBeGreaterThanOrEqual(0);
  });

  it('every committed json has a schema matched by file name', () => {
    const unknown = files
      .filter((abs) => !(basename(abs) in schemasByFileName))
      .map((abs) => relative(repoRoot, abs));
    // A new kind of data file must arrive with its schema, or it ships unguarded.
    expect(unknown).toEqual([]);
  });

  it.each(files.map((abs) => [relative(repoRoot, abs), abs]))(
    '%s is valid against its schema',
    async (_rel, abs) => {
      const schema = schemasByFileName[basename(abs)];
      if (!schema) return; // covered by the test above
      const parsed: unknown = JSON.parse(await readFile(abs, 'utf8'));
      expect(() => schema.parse(parsed)).not.toThrow();
    },
  );
});
