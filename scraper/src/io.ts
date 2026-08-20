import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';

// Walk up from this module's own directory to find the repo root, identified
// by the root package.json's `workspaces` field. This is deliberately not a
// hardcoded relative path (e.g. `../..`): the number of directories between
// this file and the repo root differs between running the source directly
// (scraper/src/io.ts, via vitest) and running the tsc-compiled output
// (scraper/dist/src/io.js, via `npm run scrape`), so a fixed depth would be
// wrong in one of the two cases.
function findRepoRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { workspaces?: unknown };
        if (Array.isArray(pkg.workspaces)) return dir;
      } catch {
        // Malformed package.json on the way up: keep searching upward.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return startDir; // reached filesystem root; give up and fall back
    dir = parent;
  }
}

const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

export function dataRoot(): string {
  return process.env.DATA_ROOT ?? join(repoRoot, 'data');
}

export function writeData<T>(relPath: string, schema: ZodType<T>, data: unknown): string {
  const parsed = schema.parse(data); // throws before any write
  const abs = join(dataRoot(), relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
  return abs;
}
