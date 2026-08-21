import { describe, expect, it } from 'vitest';
import { ivLink, parseFrontmatter, issueArticleLinks } from '../src/lib/iv';

/**
 * `iv.ts` builds the Telegram Instant View links an issue is shared with
 * (see IV.md). It is a plain module so that `scripts/iv-links.mjs` can run it
 * outside Astro; these tests pin the URL shape Telegram expects.
 */
describe('ivLink', () => {
  it('percent-encodes the article URL and appends the rhash', () => {
    expect(ivLink('https://fantamagazine.margiovanni.it/numeri/numero-1/bombe/', 'a9fdaa01adff5c')).toBe(
      'https://t.me/iv?url=https%3A%2F%2Ffantamagazine.margiovanni.it%2Fnumeri%2Fnumero-1%2Fbombe%2F&rhash=a9fdaa01adff5c',
    );
  });

  it('refuses an empty rhash rather than producing a dead link', () => {
    expect(() => ivLink('https://example.org/a/', '')).toThrow(/IV_RHASH/);
  });
});

describe('parseFrontmatter', () => {
  it('reads title and order from the article header', () => {
    const md = '---\ncolumn: bombe\ntitle: "RETROSCENA: Thuram, ai dettagli"\nbyline: "Tancredi Soffiata"\norder: 6\n---\n\nCorpo.';
    expect(parseFrontmatter(md)).toEqual({ title: 'RETROSCENA: Thuram, ai dettagli', order: 6 });
  });

  it('throws on a file without frontmatter', () => {
    expect(() => parseFrontmatter('Corpo senza testa.')).toThrow(/frontmatter/);
  });
});

describe('issueArticleLinks', () => {
  it('orders articles by `order` and builds one IV link per article', () => {
    const files = [
      { slug: 'mercato', source: '---\ntitle: "B"\norder: 2\n---\n' },
      { slug: 'editoriale', source: '---\ntitle: "A"\norder: 1\n---\n' },
    ];
    expect(issueArticleLinks('https://fantamagazine.margiovanni.it', 1, files, 'abc')).toEqual([
      { order: 1, title: 'A', url: 'https://fantamagazine.margiovanni.it/numeri/numero-1/editoriale/', iv: 'https://t.me/iv?url=https%3A%2F%2Ffantamagazine.margiovanni.it%2Fnumeri%2Fnumero-1%2Feditoriale%2F&rhash=abc' },
      { order: 2, title: 'B', url: 'https://fantamagazine.margiovanni.it/numeri/numero-1/mercato/', iv: 'https://t.me/iv?url=https%3A%2F%2Ffantamagazine.margiovanni.it%2Fnumeri%2Fnumero-1%2Fmercato%2F&rhash=abc' },
    ]);
  });
});
