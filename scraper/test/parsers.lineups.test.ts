import { describe, expect, it } from 'vitest';
import { TeamLineupSchema } from '../src/schemas.js';
import { listRoundMatches, parseRoundMatch } from '../src/parsers/lineups.js';
import { setupBrowser, withFixturePage, withHtmlPage } from './helpers/page.js';

// fixtures/round.html is the live round view of matchday 1, captured
// 2026-08-25, showing Atletico Piedini (5620502) - J medical (8775659).
describe('listRoundMatches', () => {
  setupBrowser();

  it('lists the 5 matches of the round with their team ids', async () => {
    await withFixturePage('round.html', async (page) => {
      const matches = await listRoundMatches(page);

      expect(matches).toHaveLength(5);
      expect(matches[1]).toEqual({ homeId: '5620502', awayId: '8775659' });
      expect(new Set(matches.flatMap((m) => [m.homeId, m.awayId])).size).toBe(10);
    });
  });
});

describe('parseRoundMatch', () => {
  setupBrowser();

  it('parses both lineups of the match on screen: 11 starters and a bench each', async () => {
    await withFixturePage('round.html', async (page) => {
      const { home, away } = await parseRoundMatch(page);

      expect(home.teamId).toBe('5620502');
      expect(home.module).toBe('3-4-3');
      expect(home.starters).toHaveLength(11);
      expect(home.bench).toHaveLength(14);

      expect(away.teamId).toBe('8775659');
      expect(away.module).toBe('4-3-3');
      expect(away.starters).toHaveLength(11);
      expect(away.bench).toHaveLength(14);

      for (const team of [home, away]) expect(() => TeamLineupSchema.parse(team)).not.toThrow();
    });
  });

  it('reads name, role, vote and fantavote; s.v. and unused bench read null', async () => {
    await withFixturePage('round.html', async (page) => {
      const { home } = await parseRoundMatch(page);

      expect(home.starters[0]).toEqual({ name: 'Corvi', role: 'P', club: null, vote: 5.5, fantavote: 4.5 });
      expect(home.starters.map((p) => p.role).join('')).toBe('PDDDCCCCAAA');

      const withoutVote = home.bench.filter((p) => p.vote === null);
      expect(withoutVote.length).toBeGreaterThan(0);
      expect(home.bench.every((p) => p.name !== '')).toBe(true);
    });
  });

  it('refuses a page whose player columns are not four', async () => {
    const html = `<ui-match-showcase>
        <ui-team-shirt><nz-avatar data-src="/maglietta_2026/1_x.png"></nz-avatar></ui-team-shirt><span>4-4-2</span>
        <ui-team-shirt><nz-avatar data-src="/maglietta_2026/2_x.png"></nz-avatar></ui-team-shirt><span>4-4-2</span>
      </ui-match-showcase>
      <ui-match-players><div><ui-match-player></ui-match-player></div></ui-match-players>`;
    await withHtmlPage(html, async (page) => {
      await expect(parseRoundMatch(page)).rejects.toThrow(/1 player columns, expected 4/);
    });
  });
});
