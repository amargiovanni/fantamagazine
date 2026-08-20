import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../src/cli.js';
import { NotCalibratedError, PAGES } from '../src/selectors.js';

describe('parseCliArgs', () => {
  it('parses --matchday with a valid value', () => {
    expect(parseCliArgs(['--matchday', '3'])).toEqual({ command: 'matchday', matchday: 3 });
  });

  it('parses --league', () => {
    expect(parseCliArgs(['--league'])).toEqual({ command: 'league' });
  });

  it('parses --capture', () => {
    expect(parseCliArgs(['--capture'])).toEqual({ command: 'capture' });
  });

  it('throws on --matchday 0', () => {
    expect(() => parseCliArgs(['--matchday', '0'])).toThrow();
  });

  it('throws on --matchday above 38', () => {
    expect(() => parseCliArgs(['--matchday', '39'])).toThrow();
  });

  it('throws on a non-numeric --matchday', () => {
    expect(() => parseCliArgs(['--matchday', 'abc'])).toThrow();
  });

  it('throws with usage text on no arguments', () => {
    expect(() => parseCliArgs([])).toThrow(/usage/i);
  });

  it('throws when more than one command flag is given', () => {
    expect(() => parseCliArgs(['--league', '--capture'])).toThrow();
  });

  it('throws on an unrecognized flag', () => {
    expect(() => parseCliArgs(['--bogus'])).toThrow();
  });
});

/**
 * `--matchday` parses fine — it is a legitimate command that will work once
 * the season starts — but every page it would need is uncalibrated, because
 * season 2026-27 has not kicked off and the site publishes no lineups and no
 * results. The builders refuse rather than return a guessed URL, so a run can
 * only ever fail loudly; the alternative is a `matchday-01/` directory full of
 * files parsed out of an error page.
 */
describe('uncalibrated page builders', () => {
  it.each([
    ['lineups', () => PAGES.lineups(1)],
    ['results', () => PAGES.results(1)],
    ['standingsAt', () => PAGES.standingsAt(1)],
  ])('%s refuses to build a URL until matchday 1', (_name, build) => {
    expect(build).toThrow(NotCalibratedError);
    expect(build).toThrow(/not yet calibrated for the live season/);
  });

  it('names --capture as the way to recalibrate', () => {
    expect(() => PAGES.lineups(1)).toThrow(/--capture/);
  });
});
