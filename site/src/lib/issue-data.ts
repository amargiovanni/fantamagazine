/**
 * The referential rule that ties an issue to the scraped data behind it.
 *
 * It lives here, and not in `issues.ts`, because that module imports
 * `astro:content` — a virtual module that only exists inside an Astro build,
 * so nothing in it can be unit-tested. The rule is the part worth testing, so
 * the pure decision lives here and the thin `import.meta.glob` wrapper that
 * feeds it the repository's inventory stays there.
 */

/** The `issue.json` fields the rule reads, plus the entry id it came from. */
export interface IssueDataRef {
  /** Collection entry id, e.g. `2026-27/issue-000/issue`. */
  id: string;
  data: {
    number: number;
    type: 'pre' | 'post' | 'midweek';
    matchday: number | null;
  };
}

/** The season an entry belongs to, taken from its id (`2026-27/issue-000/...`). */
export function seasonOf(entry: { id: string }): string {
  return entry.id.split('/')[0]!;
}

/** `0` → `issue-000`, the directory naming used under `content/`. */
export function issueDirName(issueNumber: number): string {
  return `issue-${String(issueNumber).padStart(3, '0')}`;
}

/**
 * The `<season>/matchday-NN` directory this issue's numbers must come from, or
 * `null` when the issue needs no scraped matchday at all.
 *
 * `post` reports a matchday that has been played, so its data must exist.
 * `midweek` normally carries `matchday: null`, but if it does declare one it is
 * quoting that matchday and the same requirement applies.
 *
 * A `pre` issue is the exception: its `matchday` announces the giornata *about
 * to be played*, which by definition has no data yet. The numbers a `pre` issue
 * quotes come from the previous, already-committed matchday (style guide §4),
 * so requiring the declared one would make the issue unpublishable.
 */
export function requiredMatchdayData(issue: IssueDataRef): string | null {
  const { matchday, type } = issue.data;
  if (matchday === null || type === 'pre') return null;
  return `${seasonOf(issue)}/matchday-${String(matchday).padStart(2, '0')}`;
}

/**
 * Referential integrity, enforced at build time (design spec: "Article →
 * missing data | Astro build fails with a named error").
 *
 * @param available every `<season>/matchday-NN` that has a committed `results.json`.
 * @throws Error when the issue requires a matchday directory that is not in `available`.
 */
export function assertMatchdayData(
  issue: IssueDataRef,
  available: ReadonlySet<string>,
): void {
  const dir = requiredMatchdayData(issue);
  if (dir === null || available.has(dir)) return;

  const { matchday, number } = issue.data;
  const season = seasonOf(issue);
  const known = [...available].sort().join(', ') || '(none)';
  throw new Error(
    `Issue ${number} (${issue.id}) is a "${issue.data.type}" issue on matchday ` +
      `${matchday}, but data/${dir}/results.json does not exist. Scrape that ` +
      `matchday (npm run scrape -- --matchday ${matchday}) and commit data/${dir}/, ` +
      `or set "matchday": null in content/${season}/${issueDirName(number)}/issue.json. ` +
      `Matchday data currently committed: ${known}.`,
  );
}
