import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';
import { LEAGUE_BASE, loadConfig } from './config.js';
import { SEL } from './selectors.js';

// Same repo-root discovery as io.ts/config.ts: walk up from this module's
// own directory until we find the root package.json (identified by its
// `workspaces` field). Duplicated locally rather than imported, matching
// the existing convention of each module owning its own root discovery.
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

export function debugRoot(): string {
  return process.env.DEBUG_ROOT ?? join(repoRoot, 'scraper', 'debug');
}

export function capturedRoot(): string {
  return process.env.CAPTURED_ROOT ?? join(repoRoot, 'scraper', 'fixtures', 'captured');
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Writes a screenshot (`.png`) and the current page content (`.html`) to
 * `DEBUG_ROOT` (default `scraper/debug/`), named `<timestamp>-<step>`.
 * Returns the directory written to. Called from every navigation/parse
 * step's catch block so a failure leaves behind what the page looked like.
 */
export async function dumpDebug(page: Page, step: string): Promise<string> {
  const dir = debugRoot();
  mkdirSync(dir, { recursive: true });

  const base = join(dir, `${timestamp()}-${step}`);
  await page.screenshot({ path: `${base}.png` });
  writeFileSync(`${base}.html`, await page.content(), 'utf8');

  return dir;
}

/**
 * Navigates to `url` and saves the raw page HTML to
 * `CAPTURED_ROOT` (default `scraper/fixtures/captured/`) as `<name>.html`
 * (gitignored). Used by `--capture` to collect real markup for selector
 * recalibration against the live site.
 */
export async function capturePage(page: Page, url: string, name: string): Promise<string> {
  await page.goto(url, { waitUntil: 'networkidle' });

  const dir = capturedRoot();
  mkdirSync(dir, { recursive: true });

  const path = join(dir, `${name}.html`);
  writeFileSync(path, await page.content(), 'utf8');

  return path;
}

/**
 * Launches chromium (headless unless HEADFUL=1, to allow manual captcha
 * rescue), logs into leghe.fantacalcio.it, verifies the login succeeded,
 * then runs `fn` with the authenticated page. The browser is always closed,
 * whether `fn` succeeds, throws, or login itself fails.
 *
 * Never logs the username or password.
 */
export async function withSession(fn: (page: Page) => Promise<void>): Promise<void> {
  const { username, password } = loadConfig();
  const browser = await chromium.launch({ headless: process.env.HEADFUL !== '1' });

  try {
    const page = await browser.newPage();

    await page.goto(LEAGUE_BASE, { waitUntil: 'networkidle' });
    await page.click(SEL.login.open);
    await page.fill(SEL.login.user, username);
    await page.fill(SEL.login.pass, password);
    await page.click(SEL.login.submit);
    await page.waitForLoadState('networkidle');

    const loggedIn = (await page.locator(SEL.login.loggedInMarker).count()) > 0;
    if (!loggedIn) {
      await dumpDebug(page, 'login-failed');
      throw new Error('Login failed: logged-in marker not found after submitting credentials.');
    }

    await fn(page);
  } finally {
    await browser.close();
  }
}
