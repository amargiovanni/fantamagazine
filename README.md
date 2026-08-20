# Il Fatto Fantidiano

A satirical magazine for the Fantac-ACCIA league, combining live data from fantacalcio.it, editorial commentary, and a beautifully designed Astro site.

## Architecture

The project is organized into three components:

1. **Scraper** — Captures league data, rosters, standings, lineups, and match results from leghe.fantacalcio.it, validated with zod and written as JSON
2. **Editorial layer** — Style guides, dossiers, and editorial management; exposes a `/nuovo-numero` Claude Code skill
3. **Astro site** — Full-featured magazine site with issue archives, player profiles, standings, and historical charts

## Daily operations

1. **Set up credentials**: Copy `.env.example` to `.env` and fill in your fantacalcio.it username and password
   ```
   cp .env.example .env
   ```

2. **Scrape league data** for a specific matchday:
   ```
   npm run scrape -- --matchday <n>
   ```

3. **Create a new issue** using the editorial skill in Claude Code:
   ```
   /nuovo-numero
   ```

4. **Preview locally** before deploying:
   ```
   npm run dev
   ```

5. **Deploy to Cloudflare**:
   ```
   npm run deploy
   ```

Note: Credentials live only in `.env`, never committed to git.