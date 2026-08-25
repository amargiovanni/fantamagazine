import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../src/cli.js';

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
