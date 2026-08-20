import { getCollection, type CollectionEntry } from 'astro:content';

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

/** The season an entry belongs to, taken from its id (`2026-27/issue-000/...`). */
function seasonOf(entry: IssueEntry | ArticleEntry): string {
  return entry.id.split('/')[0]!;
}

/** `0` → `issue-000`, the directory naming used under `content/`. */
function issueDirName(issueNumber: number): string {
  return `issue-${String(issueNumber).padStart(3, '0')}`;
}

/** Path segment for an issue: `/numeri/numero-0/`. */
export function issueSlug(issueNumber: number): string {
  return `numero-${issueNumber}`;
}

/**
 * Referential integrity, enforced at build time (design spec: "Article →
 * missing data | Astro build fails with a named error").
 *
 * An issue that declares a matchday must have the scraped data for it in the
 * repository, otherwise the articles quote numbers nothing backs up.
 *
 * @throws Error when `matchday` is set but `data/<season>/matchday-NN/results.json` is missing.
 */
export function assertIssueData(issue: IssueEntry): void {
  const { matchday, number } = issue.data;
  if (matchday === null) return;

  const season = seasonOf(issue);
  const dir = `${season}/matchday-${String(matchday).padStart(2, '0')}`;
  if (AVAILABLE_MATCHDAY_DATA.has(dir)) return;

  const known = [...AVAILABLE_MATCHDAY_DATA].sort().join(', ') || '(none)';
  throw new Error(
    `Issue ${number} (${issue.id}) declares matchday ${matchday}, but ` +
      `data/${dir}/results.json does not exist. Scrape that matchday ` +
      `(npm run scrape -- --matchday ${matchday}) and commit data/${dir}/, ` +
      `or set "matchday": null in content/${season}/${issueDirName(number)}/issue.json. ` +
      `Matchday data currently committed: ${known}.`,
  );
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
