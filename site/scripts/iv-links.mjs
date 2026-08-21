#!/usr/bin/env node
/**
 * Print the Telegram Instant View link of every article of an issue.
 *
 *   npm run iv-links -- 1            # issue 1, season 2026-27
 *   npm run iv-links -- 1 2027-28
 *
 * Reads IV_RHASH from site/.env (see IV.md). Runs on Node's native TypeScript
 * support (Node >= 22.18), no build step.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { issueArticleLinks } from '../src/lib/iv.ts';

const SITE_ORIGIN = 'https://fantamagazine.margiovanni.it';
const here = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(here, '..');

const [numberArg, season = '2026-27'] = process.argv.slice(2);
const issueNumber = Number(numberArg);
if (!Number.isInteger(issueNumber) || issueNumber < 1) {
  console.error('usage: npm run iv-links -- <issue number> [season]');
  process.exit(1);
}

const envFile = resolve(siteDir, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);
const rhash = process.env.IV_RHASH ?? '';

const issueDir = resolve(siteDir, '..', 'content', season, `issue-${String(issueNumber).padStart(3, '0')}`);
if (!existsSync(issueDir)) {
  console.error(`no such issue: ${issueDir}`);
  process.exit(1);
}

const files = readdirSync(issueDir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => ({ slug: name.replace(/\.md$/, ''), source: readFileSync(resolve(issueDir, name), 'utf8') }));

for (const link of issueArticleLinks(SITE_ORIGIN, issueNumber, files, rhash)) {
  console.log(`${link.order}. ${link.title}\n   ${link.iv}\n`);
}
