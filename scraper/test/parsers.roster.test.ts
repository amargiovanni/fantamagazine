import { describe, expect, it } from 'vitest';
import { parseRoster, resolveMode } from '../src/parsers/roster.js';
import { setupBrowser, withFixturePage, withHtmlPage } from './helpers/page.js';

const TEAM_ID = '9000001';

/**
 * Wraps `inner` in the minimum structure `parseRoster` needs, so a test about
 * one detail does not restate a whole roster page. `header` and `tbody` are
 * both present because the parser refuses a page missing either.
 */
function rosterPage(inner: string, teamId = TEAM_ID): string {
  return `
    <ui-team-roster>
      <header>
        <ui-team-card><nz-card data-id="${teamId}">
          <div class="ant-card-meta-detail"><div class="ant-card-meta-title">Real Sarcasmo</div></div>
        </nz-card></ui-team-card>
      </header>
      <table><tbody>${inner}</tbody></table>
    </ui-team-roster>`;
}

/**
 * One table row around `card`: the auction price cell, then the quotation
 * cell. `quotationKey` defaults to the MANTRA-suffixed key on purpose — the
 * live classic page keys it `…current.classic`, the fixture covers that, and
 * these inline cases prove the prefix match works for the other mode too.
 */
function playerRow(
  card: string,
  cost = '1',
  quotation = '1',
  quotationKey = 'stats.quotation.current.mantra',
): string {
  return (
    `<tr><td colspan="2">${card}</td>` +
    `<td data-key="cost"> ${cost} </td>` +
    `<td data-key="${quotationKey}"> ${quotation} </td></tr>`
  );
}

describe('parseRoster', () => {
  setupBrowser();

  it('parses the team identity and every player of the squad', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      expect(roster.teamId).toBe(TEAM_ID);
      // The live markup wraps the name in whitespace, which the fixture keeps.
      expect(roster.teamName).toBe('Real Sarcasmo');
      expect(roster.players).toHaveLength(5);
      expect(roster.players.map((player) => player.name)).toEqual([
        'Amilcare Buffagni',
        'Ombretta Falconi',
        'Casimiro Ventura',
        'Pellegrino Sbarra',
        'Genoveffa Tortelli',
      ]);
    });
  });

  it('reads one player in full, auction price included', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      expect(roster.players[0]).toEqual({
        name: 'Amilcare Buffagni',
        role: 'P',
        club: 'Vigevano',
        price: 31,
        quotation: 12,
      });
      // The most expensive signing is what the newsroom actually wants.
      expect(roster.players[4]).toMatchObject({ name: 'Genoveffa Tortelli', role: 'A', price: 214 });
    });
  });

  /**
   * The price and the quotation are two different columns of the same row, and
   * the gap between them is the story: 214 paid for a player worth 18. Reading
   * one column for both — or deriving one from the other — would erase exactly
   * the number the piece is about.
   */
  it('reads the auction price and the current quotation as separate columns', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      expect(roster.players.map((player) => [player.price, player.quotation])).toEqual([
        [31, 12],
        [8, 7],
        [null, 9],
        [1, null],
        [214, 18],
      ]);
    });
  });

  /**
   * The credits figure is a text node beside its icon, and the header renders
   * "Valore rosa" (1157) exactly the same way immediately before it. A
   * position-based selector reads the wrong one and nothing about the result
   * looks wrong — both are plausible integers.
   */
  it('takes credits from beside the credits icon, not from the squad value next to it', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      expect(roster.credits).toBe(42);
    });
  });

  it('reports the league mode the roster page states', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { mode } = await parseRoster(page, TEAM_ID);

      expect(mode).toBe('classic');
    });
  });

  /**
   * A loan badge renders INSIDE `.player-name`, after the name. Reading the
   * element's whole `textContent` would publish "Ombretta FalconiP".
   */
  it('does not glue a loan badge onto the player name', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      expect(roster.players[1]).toMatchObject({ name: 'Ombretta Falconi', role: 'D', price: 8 });
    });
  });

  /**
   * `null` and `0` are different statements: nobody paid for this player, as
   * opposed to somebody paid nothing for him.
   */
  it('leaves an empty price cell null rather than 0', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      // His quotation is still 9: an empty price does not blank the row.
      expect(roster.players[2]).toMatchObject({
        name: 'Casimiro Ventura', price: null, quotation: 9,
      });
    });
  });

  it('leaves an empty quotation cell null rather than 0', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      // And his price is still 1, so this is not a row that parsed as all-null.
      expect(roster.players[3]).toMatchObject({
        name: 'Pellegrino Sbarra', price: 1, quotation: null,
      });
    });
  });

  it('leaves a missing club null', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      expect(roster.players[3]).toMatchObject({ name: 'Pellegrino Sbarra', club: null });
    });
  });

  /**
   * The page also renders the whole league in a sidebar and the last lineup on
   * a pitch. Neither is part of this team's squad, and both are made of the
   * same components.
   */
  it('ignores the sidebar team list and the pitch view outside the roster table', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      // The sidebar's first card is 9000002 "Sconforto Cosenza"; the pitch
      // repeats "Amilcare Buffagni" as a bare span with no player card.
      expect(roster.teamName).not.toBe('Sconforto Cosenza');
      expect(roster.players.filter((player) => player.name === 'Amilcare Buffagni')).toHaveLength(1);
    });
  });

  it('skips a skeleton row that carries no player card', async () => {
    await withFixturePage('roster.html', async (page) => {
      const { roster } = await parseRoster(page, TEAM_ID);

      // The fixture has six `tbody tr`s; one is the mid-load skeleton.
      expect(roster.players).toHaveLength(5);
    });
  });

  /**
   * In mantra a player holds several roles at once, rendered as several chips
   * in the same `ui-role`. Collapsing them to the first would publish a
   * different player from the one the manager bought.
   */
  it('joins the several role chips a mantra player carries and reports mantra', async () => {
    const card = `
      <ui-player-card data-id="9100009">
        <ui-player-role data-game-type="2"><ui-role>
          <div class="game-type-2 role role-d" data-len="2" data-role-index="2" data-role="Dc"></div>
          <div class="game-type-2 role role-d" data-len="2" data-role-index="2" data-role="Ds"></div>
        </ui-role></ui-player-role>
        <div class="ant-card-meta-title"><span class="player-name"><span>Ilario Peveri</span></span></div>
        <div class="ant-card-meta-description">Vigevano</div>
      </ui-player-card>`;

    // The quotation column is keyed `…current.mantra` in a mantra league; an
    // exact match on the classic key would return null for every player.
    await withHtmlPage(rosterPage(playerRow(card, '17', '9')), async (page) => {
      const { roster, mode } = await parseRoster(page, TEAM_ID);

      expect(mode).toBe('mantra');
      expect(roster.players[0]).toEqual({
        name: 'Ilario Peveri', role: 'Dc;Ds', club: 'Vigevano', price: 17, quotation: 9,
      });
    });
  });

  it('reports an unrecognised game type as unknown rather than guessing', async () => {
    const card = `
      <ui-player-card data-id="9100010">
        <ui-player-role data-game-type="7"><ui-role><div data-role="P"></div></ui-role></ui-player-role>
        <div class="player-name"><span>Ilario Peveri</span></div>
      </ui-player-card>`;

    await withHtmlPage(rosterPage(playerRow(card)), async (page) => {
      expect((await parseRoster(page, TEAM_ID)).mode).toBe('unknown');
    });
  });

  /**
   * The single most dangerous failure this scrape has: ten navigations that
   * all leave the first team on screen produce ten identical squads, a file
   * that validates perfectly and is entirely wrong.
   */
  it('refuses a page showing a different team from the one requested', async () => {
    await withFixturePage('roster.html', async (page) => {
      await expect(parseRoster(page, '9999999')).rejects.toThrow(/showing team 9000001/);
    });
  });

  /**
   * The other failure that looks like success: a squad that is really page one
   * of two.
   */
  it('refuses a paginated roster table rather than publish half a squad', async () => {
    const card = `
      <ui-player-card data-id="9100011">
        <ui-player-role data-game-type="1"><ui-role><div data-role="P"></div></ui-role></ui-player-role>
        <div class="player-name"><span>Ilario Peveri</span></div>
      </ui-player-card>`;
    const html = rosterPage(`${playerRow(card)}`).replace(
      '</ui-team-roster>',
      '<nz-pagination class="ant-pagination"></nz-pagination></ui-team-roster>',
    );

    await withHtmlPage(html, async (page) => {
      await expect(parseRoster(page, TEAM_ID)).rejects.toThrow(/paginated/);
    });
  });

  it('refuses a page with no roster component at all', async () => {
    await withHtmlPage('<app-root><h1>Errore</h1></app-root>', async (page) => {
      await expect(parseRoster(page, TEAM_ID)).rejects.toThrow(/ui-team-roster/);
    });
  });

  /**
   * An empty squad is never a real result — it is a page that did not finish
   * rendering — and writing it out would leave a team with no players in the
   * file the magazine is written from.
   */
  it('refuses a roster with no players', async () => {
    await withHtmlPage(rosterPage(''), async (page) => {
      await expect(parseRoster(page, TEAM_ID)).rejects.toThrow();
    });
  });
});

describe('resolveMode', () => {
  it('reports the mode every team agrees on', () => {
    expect(resolveMode(['classic', 'classic', 'classic'])).toBe('classic');
    expect(resolveMode(['mantra', 'mantra'])).toBe('mantra');
  });

  it('reports unknown when the teams disagree, rather than taking a majority', () => {
    expect(resolveMode(['classic', 'classic', 'mantra'])).toBe('unknown');
    expect(resolveMode(['classic', 'unknown'])).toBe('unknown');
  });

  it('reports unknown for no teams at all', () => {
    expect(resolveMode([])).toBe('unknown');
  });
});
