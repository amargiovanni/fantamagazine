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
 * How long the SPA is given to render after a navigation resolves.
 *
 * `networkidle` is not usable on this site: the ad and consent stack keeps
 * requests in flight indefinitely, so a wait for it either times out or
 * resolves at an arbitrary moment. Every navigation therefore settles on
 * `domcontentloaded` and then waits an explicit beat for Angular to paint.
 */
const SPA_SETTLE_MS = 3000;

/** Navigates to `url` the way this site tolerates: no `networkidle`. */
export async function gotoSettled(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(SPA_SETTLE_MS);
}

/**
 * Navigates to `url` and saves the raw page HTML to
 * `CAPTURED_ROOT` (default `scraper/fixtures/captured/`) as `<name>.html`
 * (gitignored). Used by `--capture` to collect real markup for selector
 * recalibration against the live site.
 */
export async function capturePage(page: Page, url: string, name: string): Promise<string> {
  await gotoSettled(page, url);

  const dir = capturedRoot();
  mkdirSync(dir, { recursive: true });

  const path = join(dir, `${name}.html`);
  writeFileSync(path, await page.content(), 'utf8');

  return path;
}

/**
 * Dismisses the PubTech consent banner if it is showing.
 *
 * The banner is not always rendered (it depends on a cookie the profile may
 * already carry), so its absence is a normal outcome and not an error — hence
 * the short timeout and the swallowed rejection. When it IS showing it covers
 * the login form, and every click below it times out.
 */
async function dismissConsent(page: Page): Promise<void> {
  try {
    await page.click(SEL.login.consentAccept, { timeout: CONSENT_TIMEOUT_MS });
  } catch {
    // No banner on this load: nothing to dismiss.
  }
}

const CONSENT_TIMEOUT_MS = 5000;
const LOGIN_NAV_TIMEOUT_MS = 45_000;

/**
 * Launches chromium (headless unless HEADFUL=1, to allow manual captcha
 * rescue), logs into leghe.fantacalcio.it, verifies the login succeeded,
 * then runs `fn` with the authenticated page. The browser is always closed,
 * whether `fn` succeeds, throws, or login itself fails.
 *
 * There is no login button to click: requesting a league URL while
 * unauthenticated redirects to `/login?next=...`, so the flow is
 * navigate -> consent -> fill -> submit -> wait for the URL to stop being a
 * login URL -> confirm the logged-in marker.
 *
 * THE WHOLE SEQUENCE is wrapped, not just the marker check. The first version
 * only dumped on a failed marker, so the failure that actually happened — a
 * click timing out against a consent banner — escaped with a Playwright stack
 * and no evidence of what the page looked like. Every step that can time out
 * is inside the `try`, and `fn` is wrapped too so a mid-scrape failure leaves
 * the same trail.
 *
 * Never logs the username or password.
 */
export async function withSession(fn: (page: Page) => Promise<void>): Promise<void> {
  const { username, password } = loadConfig();
  const browser = await chromium.launch({ headless: process.env.HEADFUL !== '1' });

  try {
    const page = await browser.newPage();

    try {
      await gotoSettled(page, LEAGUE_BASE);
      await dismissConsent(page);

      await page.fill(SEL.login.user, username);
      await page.fill(SEL.login.pass, password);
      await page.click(SEL.login.submit);

      // The redirect target is a competition dashboard whose id we do not
      // want to hardcode into the login step: "no longer on /login" is the
      // real success condition, and it survives the site changing where it
      // sends us next.
      await page.waitForURL((url) => !url.pathname.includes('/login'), {
        timeout: LOGIN_NAV_TIMEOUT_MS,
      });
      await page.waitForTimeout(SPA_SETTLE_MS);

      const loggedIn = (await page.locator(SEL.login.loggedInMarker).count()) > 0;
      if (!loggedIn) {
        throw new Error(
          `Login failed: logged-in marker "${SEL.login.loggedInMarker}" not found after submitting credentials.`,
        );
      }
    } catch (err) {
      await dumpDebug(page, 'login-failed');
      throw err;
    }

    try {
      await fn(page);
    } catch (err) {
      await dumpDebug(page, 'session-failed');
      throw err;
    }
  } finally {
    await browser.close();
  }
}
