import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll } from 'vitest';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures');

let browser: Browser | undefined;

/**
 * Registers `beforeAll`/`afterAll` hooks that launch a single shared chromium
 * instance for the whole test suite. Call once inside a top-level `describe`.
 */
export function setupBrowser(): void {
  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser?.close();
    browser = undefined;
  });
}

/**
 * Loads `html` into a fresh page and runs `fn` against it. The page is closed
 * after `fn` resolves or throws. Use it for the one-off malformed markup a
 * single test needs; a page shape more than one test cares about belongs in
 * `scraper/fixtures/` and goes through `withFixturePage`.
 */
export async function withHtmlPage(html: string, fn: (page: Page) => Promise<void>): Promise<void> {
  if (!browser) {
    throw new Error('Browser not initialized: call setupBrowser() in the test suite first.');
  }
  const page = await browser.newPage();
  try {
    await page.setContent(html);
    await fn(page);
  } finally {
    await page.close();
  }
}

/**
 * Loads `scraper/fixtures/<fixtureFile>` into a fresh page and runs `fn`
 * against it. The page is closed after `fn` resolves or throws.
 */
export async function withFixturePage(fixtureFile: string, fn: (page: Page) => Promise<void>): Promise<void> {
  return withHtmlPage(readFileSync(join(fixturesDir, fixtureFile), 'utf8'), fn);
}
