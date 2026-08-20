import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Same repo-root discovery as io.ts: walk up from this module's own
// directory until we find the root package.json (identified by its
// `workspaces` field). Duplicated rather than imported to keep this file
// independent of io.ts, per the "consumes nothing from parsers" boundary.
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

// Path to the .env file the hand-rolled loader below reads. Overridable via
// ENV_FILE (same env-overridable pattern as DATA_ROOT/DEBUG_ROOT) so tests
// never read a real developer .env with real credentials.
function envFilePath(): string {
  return process.env.ENV_FILE ?? join(repoRoot, '.env');
}

// Tiny hand-rolled dotenv loader: reads KEY=VALUE lines from .env and sets
// process.env[KEY] for any key not already present in the environment, so
// real environment variables always take precedence over the file. No
// dotenv dependency.
function loadDotEnv(): void {
  const path = envFilePath();
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export const LEAGUE_BASE = 'https://leghe.fantacalcio.it/fantac-accia';
export const COMPETITION_DASHBOARD = `${LEAGUE_BASE}/view/competition/173122/dashboard`;

/**
 * Reads FC_USERNAME/FC_PASSWORD from the environment, after loading .env
 * (if present) for any variable not already set. Throws a clear error
 * naming which variable(s) are missing; never logs or includes their
 * values, and the returned credentials must never be logged by callers.
 */
export function loadConfig(): { username: string; password: string } {
  loadDotEnv();

  const missing: string[] = [];
  if (!process.env.FC_USERNAME) missing.push('FC_USERNAME');
  if (!process.env.FC_PASSWORD) missing.push('FC_PASSWORD');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}. Set them in .env or the environment.`);
  }

  return { username: process.env.FC_USERNAME as string, password: process.env.FC_PASSWORD as string };
}
