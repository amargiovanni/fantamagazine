import { describe, expect, it } from 'vitest';
import { excerpt, leadParagraphs } from '../src/lib/text';

/**
 * `text.ts` turns an article's raw Markdown into the plain-text standfirst the
 * front page and the archive print. It is regex-based on purpose (the site has
 * no Markdown parser outside Astro's render pipeline), which is exactly why it
 * needs tests: every rule here is a rule the front page would leak as raw
 * syntax if it broke.
 */

describe('leadParagraphs', () => {
  it('returns the opening paragraph as plain text', () => {
    const body = 'Prima riga del pezzo.\n\nSeconda riga del pezzo.';
    expect(leadParagraphs(body)).toEqual(['Prima riga del pezzo.']);
  });

  it('returns paragraphs in source order, up to the requested count', () => {
    const body = 'Uno.\n\nDue.\n\nTre.';
    expect(leadParagraphs(body, 2)).toEqual(['Uno.', 'Due.']);
  });

  it('skips a heading, so an article opening with a section still yields prose', () => {
    // rubrica-fissa.md opens with `## Lo Sconfitto della Settimana …`.
    const body = '## Lo Sconfitto della Settimana\n\nIl fatto. Prospero ha perso.';
    expect(leadParagraphs(body)).toEqual(['Il fatto. Prospero ha perso.']);
  });

  it('skips tables, lists, quotes, code fences and thematic breaks', () => {
    const body = [
      '| Pos | Squadra |',
      '',
      '- primo punto',
      '',
      '1. primo numerato',
      '',
      '> una citazione',
      '',
      '```',
      '',
      '---',
      '',
      'Questa è la prima prosa vera.',
    ].join('\n');
    expect(leadParagraphs(body, 3)).toEqual(['Questa è la prima prosa vera.']);
  });

  it('unwraps bold, italic, links, inline code and drops images', () => {
    const body =
      '**Real Sarcasmo** ha chiuso a *78,5* con un [attaccante](https://esempio.it/x) ' +
      'e un `bonus` non richiesto. ![stemma](/x.png)';
    expect(leadParagraphs(body)).toEqual([
      'Real Sarcasmo ha chiuso a 78,5 con un attaccante e un bonus non richiesto.',
    ]);
  });

  it('collapses the hard wrapping every article in content/ uses', () => {
    const body = 'Sono le 17:41 quando la giornata zero\nsmette di essere\nun’ipotesi.';
    expect(leadParagraphs(body)).toEqual([
      'Sono le 17:41 quando la giornata zero smette di essere un’ipotesi.',
    ]);
  });

  it('returns nothing for a body that carries no prose at all', () => {
    expect(leadParagraphs('## Solo un titolo\n\n| a | b |')).toEqual([]);
    expect(leadParagraphs('')).toEqual([]);
  });
});

describe('excerpt', () => {
  const article = [
    '## Le pagelle',
    '',
    '**Real Sarcasmo** — Furio · **7,5**',
    'Tre attaccanti, tre gol, 78,5 fantapunti e 245 crediti ancora in cassa.',
    '',
    'Il pool [Formazioni Pulite](https://esempio.it) ci tiene a *chiarire* un punto: ' +
      'schierare Prunetti non avrebbe ribaltato il risultato, e questa è l’unica ' +
      'attenuante disponibile agli atti di questa redazione.',
  ].join('\n');

  it('leaks no Markdown syntax on a realistic article snippet', () => {
    const result = excerpt(article, 200);
    expect(result).not.toMatch(/[*`]|\]\(|!\[|^#/);
    // The `## Le pagelle` heading is skipped; the pagella entry is the first
    // prose block, and its bold markers come off.
    expect(result.startsWith('Real Sarcasmo — Furio · 7,5 Tre attaccanti')).toBe(true);
    expect(result).not.toContain('Le pagelle');
  });

  it('returns the paragraph untouched when it is shorter than the limit', () => {
    expect(excerpt('Corto e chiuso.', 200)).toBe('Corto e chiuso.');
  });

  it('cuts on a word boundary and closes with an ellipsis', () => {
    const result = excerpt(article, 40);
    const paragraph = leadParagraphs(article, 1)[0]!;

    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(41);
    // What survives is a prefix of the paragraph, and it stops at a word end.
    const kept = result.slice(0, -1);
    expect(paragraph.startsWith(kept)).toBe(true);
    expect(paragraph.charAt(kept.length)).toMatch(/\s|^$/);
  });

  it('drops a trailing punctuation mark left dangling by the cut', () => {
    expect(excerpt('Alfa beta, gamma delta.', 10)).toBe('Alfa beta…');
  });

  it('returns an empty string when there is nothing to tease', () => {
    expect(excerpt('', 200)).toBe('');
    expect(excerpt('## Solo un titolo', 200)).toBe('');
  });
});
