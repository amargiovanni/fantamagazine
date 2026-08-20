import { getCollection, type CollectionEntry } from 'astro:content';
import { assertMatchdayData, issueDirName } from './issue-data';

export type IssueEntry = CollectionEntry<'issues'>;
export type ArticleEntry = CollectionEntry<'articles'>;

/**
 * Every `results.json` committed under `data/<season>/matchday-NN/`.
 *
 * `import.meta.glob` is resolved by Vite at build time, so this is a static
 * inventory of the repository — no filesystem access at runtime, which keeps
 * the check working in every Astro build target. The modules are NOT eagerly
 * imported: only the matched paths are needed.
 */
const RESULTS_FILES = import.meta.glob('../../../data/*/matchday-*/results.json');

const AVAILABLE_MATCHDAY_DATA: ReadonlySet<string> = new Set(
  Object.keys(RESULTS_FILES)
    .map((path) => /\/([^/]+)\/(matchday-\d+)\/results\.json$/.exec(path))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => `${match[1]}/${match[2]}`),
);

/** Path segment for an issue: `/numeri/numero-0/`. */
export function issueSlug(issueNumber: number): string {
  return `numero-${issueNumber}`;
}

/**
 * Referential integrity, enforced at build time (design spec: "Article →
 * missing data | Astro build fails with a named error").
 *
 * A `post` issue that quotes a matchday must have the scraped data for it in
 * the repository, otherwise the articles quote numbers nothing backs up. A
 * `pre` issue is exempt: it announces the giornata about to be played and
 * draws its numbers from the previous one. The rule itself, and the reasoning
 * behind it, live in `issue-data.ts`; this is only the glob that feeds it.
 *
 * @throws Error when the issue requires a matchday whose `results.json` is missing.
 */
export function assertIssueData(issue: IssueEntry): void {
  assertMatchdayData(issue, AVAILABLE_MATCHDAY_DATA);
}

/**
 * All issues, newest first. Every build goes through here, so every build
 * re-runs the referential check above.
 */
export async function getIssuesSorted(): Promise<IssueEntry[]> {
  const issues = await getCollection('issues');
  for (const issue of issues) assertIssueData(issue);
  return issues.sort((a, b) => b.data.number - a.data.number);
}

/** The articles of one issue, in reading order (`order` ascending). */
export async function getArticlesForIssue(issueNumber: number): Promise<ArticleEntry[]> {
  const dir = `/${issueDirName(issueNumber)}/`;
  const articles = await getCollection('articles', (article) => article.id.includes(dir));
  return articles.sort((a, b) => a.data.order - b.data.order);
}

/**
 * What the paper calls each kind of edition. Product copy, in Italian by
 * design — the reader's language, not the codebase's.
 */
export const ISSUE_TYPE_LABELS: Record<IssueEntry['data']['type'], string> = {
  post: 'Edizione del Lunedì',
  pre: 'Edizione del Mercato',
  midweek: "L'Inchiesta del Mercoledì",
};

/**
 * Path segment for an article: the last segment of its id, i.e. the file name
 * under `content/<season>/issue-NNN/`. Taken from the id rather than from
 * `column` so that two articles sharing a column can still coexist.
 */
export function articleSlug(article: ArticleEntry): string {
  return article.id.split('/').pop()!;
}

/** `/numeri/numero-0/` — the canonical URL of an issue. */
export function issuePath(issueNumber: number): string {
  return `/numeri/${issueSlug(issueNumber)}/`;
}

/** `/numeri/numero-0/editoriale/` — the canonical URL of an article. */
export function articlePath(issueNumber: number, article: ArticleEntry): string {
  return `${issuePath(issueNumber)}${articleSlug(article)}/`;
}

/**
 * The issue an article belongs to, from its id (`2026-27/issue-000/...`).
 * Needed by the article permalink page, which is routed by slug, not by number.
 */
export function issueNumberOf(article: ArticleEntry): number {
  const match = /\/issue-(\d+)\//.exec(article.id);
  if (!match) throw new Error(`Article ${article.id} is not inside an issue-NNN directory.`);
  return Number(match[1]);
}
