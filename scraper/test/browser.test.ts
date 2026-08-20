import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { dumpDebug } from '../src/browser.js';
import { setupBrowser, withFixturePage } from './helpers/page.js';

describe('dumpDebug', () => {
  setupBrowser();

  let tempRoot: string;
  let previousDebugRoot: string | undefined;

  beforeEach(() => {
    previousDebugRoot = process.env.DEBUG_ROOT;
    tempRoot = mkdtempSync(join(tmpdir(), 'fantamagazine-debug-test-'));
    process.env.DEBUG_ROOT = tempRoot;
  });

  afterEach(() => {
    if (previousDebugRoot === undefined) delete process.env.DEBUG_ROOT;
    else process.env.DEBUG_ROOT = previousDebugRoot;
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('writes a screenshot and an HTML dump to DEBUG_ROOT', async () => {
    await withFixturePage('league.html', async (page) => {
      const dir = await dumpDebug(page, 'unit');

      expect(dir).toBe(tempRoot);
      const files = readdirSync(tempRoot);
      expect(files.some((f) => f.endsWith('-unit.png'))).toBe(true);
      expect(files.some((f) => f.endsWith('-unit.html'))).toBe(true);
    });
  });
});
