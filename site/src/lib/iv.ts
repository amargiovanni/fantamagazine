/**
 * Telegram Instant View links for an issue (see `IV.md` at the repo root).
 *
 * A template published on instantview.telegram.org is identified by an
 * `rhash`; a link of the form `https://t.me/iv?url=<article>&rhash=<hash>`
 * opens the article as an Instant View regardless of the template's approval
 * status. This module is plain TypeScript — no `astro:content` — so that
 * `scripts/iv-links.mjs` can run it after a deploy.
 */

export interface ArticleFile {
  /** File name without `.md`: the last permalink segment. */
  slug: string;
  /** Raw Markdown, frontmatter included. */
  source: string;
}

export interface ArticleLink {
  order: number;
  title: string;
  url: string;
  iv: string;
}

export function ivLink(articleUrl: string, rhash: string): string {
  if (!rhash) {
    throw new Error('IV_RHASH is empty: set it in site/.env (see IV.md)');
  }
  return `https://t.me/iv?url=${encodeURIComponent(articleUrl)}&rhash=${rhash}`;
}

/** Reads `title` and `order` from the article frontmatter (style guide §9). */
export function parseFrontmatter(source: string): { title: string; order: number } {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  if (!match) {
    throw new Error('article has no frontmatter');
  }
  const fields = new Map<string, string>();
  for (const line of match[1].split('\n')) {
    const m = /^(\w+):\s*(.*)$/.exec(line);
    if (m) fields.set(m[1], m[2].trim().replace(/^"(.*)"$/, '$1'));
  }
  const title = fields.get('title');
  const order = Number(fields.get('order'));
  if (!title || !Number.isInteger(order)) {
    throw new Error('frontmatter is missing title or order');
  }
  return { title, order };
}

export function issueArticleLinks(
  siteOrigin: string,
  issueNumber: number,
  files: ArticleFile[],
  rhash: string,
): ArticleLink[] {
  return files
    .map((file) => {
      const { title, order } = parseFrontmatter(file.source);
      const url = `${siteOrigin}/numeri/numero-${issueNumber}/${file.slug}/`;
      return { order, title, url, iv: ivLink(url, rhash) };
    })
    .sort((a, b) => a.order - b.order);
}
