/**
 * Plain-text helpers for turning an article's Markdown body into the short
 * standfirst a front page or an index needs.
 *
 * Deliberately tiny and regex-based: the site's dependency list is closed, so
 * there is no Markdown parser available outside Astro's own render pipeline,
 * and a front-page teaser does not need one. Anything richer than "the first
 * paragraph, as plain text" belongs in the rendered article, not here.
 */

/** Block-level Markdown that is never the opening of a story. */
const NON_PROSE_BLOCK = /^\s*(#{1,6}\s|>|[-*+]\s|\d+\.\s|\||!\[|```|---\s*$)/;

/** Inline Markdown that has to come off before the text is shown raw. */
function stripInline(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → their text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[\s(])\*([^*]+)\*/g, '$1$2')
    .replace(/(^|[\s(])_([^_]+)_/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The article's opening paragraphs as plain text, in source order.
 *
 * Headings, tables, lists and quotes are skipped, so an article that opens
 * with a section heading (the rubrica does) still yields its first real
 * sentence rather than the heading.
 */
export function leadParagraphs(body: string, count = 1): string[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0 && !NON_PROSE_BLOCK.test(block))
    .slice(0, count)
    .map(stripInline)
    .filter((block) => block.length > 0);
}

/**
 * A one-paragraph teaser, cut at a word boundary and closed with an ellipsis
 * when it had to be cut. Returns an empty string for a body with no prose.
 *
 * The cut only backtracks to the previous space when it lands *inside* a word:
 * a cut that already falls on a word end keeps that word, so a limit landing
 * right after a comma does not silently cost the teaser a whole word.
 */
export function excerpt(body: string, maxChars = 200): string {
  const [first] = leadParagraphs(body, 1);
  if (!first) return '';
  if (first.length <= maxChars) return first;

  const cut = first.slice(0, maxChars);
  const endsOnWordBoundary = /\s/.test(first.charAt(maxChars));
  const lastSpace = cut.lastIndexOf(' ');
  const kept = endsOnWordBoundary || lastSpace <= 0 ? cut : cut.slice(0, lastSpace);
  return `${kept.replace(/[\s.,;:—-]+$/, '')}…`;
}
