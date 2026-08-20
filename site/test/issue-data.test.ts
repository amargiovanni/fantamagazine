import { describe, expect, it } from 'vitest';
import {
  assertMatchdayData,
  issueDirName,
  requiredMatchdayData,
  seasonOf,
  type IssueDataRef,
} from '../src/lib/issue-data';

/**
 * The build-time referential check. Its two failure modes are opposite and
 * both expensive: letting a `post` issue quote a matchday nobody scraped, and
 * refusing to build a `pre` issue whose matchday has not been played yet —
 * which is every `pre` issue, by definition.
 */

function issue(
  type: IssueDataRef['data']['type'],
  matchday: number | null,
  { season = '2026-27', number = 1 } = {},
): IssueDataRef {
  return {
    id: `${season}/${issueDirName(number)}/issue`,
    data: { number, type, matchday },
  };
}

const AVAILABLE = new Set(['2026-27/matchday-00', '2026-27/matchday-01']);

describe('requiredMatchdayData', () => {
  it('requires the declared matchday for a post issue', () => {
    expect(requiredMatchdayData(issue('post', 1))).toBe('2026-27/matchday-01');
  });

  it('zero-pads the matchday to two digits', () => {
    expect(requiredMatchdayData(issue('post', 3))).toBe('2026-27/matchday-03');
    expect(requiredMatchdayData(issue('post', 12))).toBe('2026-27/matchday-12');
  });

  it('takes the season from the entry id', () => {
    expect(requiredMatchdayData(issue('post', 5, { season: '2027-28' }))).toBe(
      '2027-28/matchday-05',
    );
  });

  it('requires nothing for a pre issue: its matchday has not been played yet', () => {
    expect(requiredMatchdayData(issue('pre', 2))).toBeNull();
  });

  it('requires nothing when no matchday is declared', () => {
    expect(requiredMatchdayData(issue('midweek', null))).toBeNull();
    expect(requiredMatchdayData(issue('pre', null))).toBeNull();
  });

  it('requires the declared matchday for a midweek issue that quotes one', () => {
    expect(requiredMatchdayData(issue('midweek', 4))).toBe('2026-27/matchday-04');
  });
});

describe('assertMatchdayData', () => {
  it('passes when the required matchday is committed', () => {
    expect(() => assertMatchdayData(issue('post', 1), AVAILABLE)).not.toThrow();
  });

  it('lets a pre issue build with no data for its matchday at all', () => {
    expect(() => assertMatchdayData(issue('pre', 2), AVAILABLE)).not.toThrow();
    expect(() => assertMatchdayData(issue('pre', 2), new Set())).not.toThrow();
  });

  it('names the issue, the missing file and the scrape command', () => {
    expect(() => assertMatchdayData(issue('post', 2, { number: 7 }), AVAILABLE)).toThrowError(
      /Issue 7 .*data\/2026-27\/matchday-02\/results\.json does not exist/s,
    );
    expect(() => assertMatchdayData(issue('post', 2), AVAILABLE)).toThrowError(
      /npm run scrape -- --matchday 2/,
    );
  });

  it('lists what is committed, so the reader can see the near miss', () => {
    expect(() => assertMatchdayData(issue('post', 2), AVAILABLE)).toThrowError(
      /2026-27\/matchday-00, 2026-27\/matchday-01/,
    );
    expect(() => assertMatchdayData(issue('post', 2), new Set())).toThrowError(/\(none\)/);
  });

  it('points at the issue.json to edit, by path', () => {
    expect(() => assertMatchdayData(issue('post', 9, { number: 12 }), AVAILABLE)).toThrowError(
      /content\/2026-27\/issue-012\/issue\.json/,
    );
  });
});

describe('seasonOf and issueDirName', () => {
  it('reads the season off an entry id', () => {
    expect(seasonOf({ id: '2026-27/issue-000/issue' })).toBe('2026-27');
  });

  it('zero-pads an issue number to three digits', () => {
    expect(issueDirName(0)).toBe('issue-000');
    expect(issueDirName(12)).toBe('issue-012');
    expect(issueDirName(150)).toBe('issue-150');
  });
});
