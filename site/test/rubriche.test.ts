import { describe, expect, it } from 'vitest';
import { COLUMNS, COLUMN_LABELS } from '../src/lib/columns';
import { DESKS, RUBRICHE } from '../src/lib/rubriche';

/**
 * `COLUMNS` is the technical contract (style guide §9); `COLUMN_LABELS` and
 * `DESKS` are hand-maintained maps keyed by it. TypeScript already forces every
 * column to have an entry, but a typo'd slug or a forgotten rubrica only shows
 * up at build time. These tests make the contract explicit and name the
 * columns the style guide currently lists, so adding one is a deliberate act.
 */
describe('rubriche contract', () => {
  it('lists the seven rubriche of style guide §6, in order', () => {
    expect([...COLUMNS]).toEqual([
      'cronaca-pagelle',
      'editoriale',
      'rubrica-fissa',
      'classifiche',
      'mercato',
      'approfondimento',
      'bombe',
    ]);
    expect(RUBRICHE).toEqual(COLUMNS);
  });

  it('has a label and a desk for every column and nothing else', () => {
    expect(Object.keys(COLUMN_LABELS).sort()).toEqual([...COLUMNS].sort());
    expect(Object.keys(DESKS).sort()).toEqual([...COLUMNS].sort());
  });

  it('assigns Tancredi Soffiata to the bombe desk', () => {
    expect(DESKS.bombe.signatures).toEqual(['Tancredi Soffiata']);
    expect(COLUMN_LABELS.bombe).toBe('Le Bombe');
  });
});
