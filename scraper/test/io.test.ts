import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { writeData } from '../src/io.js';

const ItemSchema = z.object({ id: z.string().min(1), value: z.number() });

let tempRoot: string;
let previousDataRoot: string | undefined;

beforeEach(() => {
  previousDataRoot = process.env.DATA_ROOT;
  tempRoot = mkdtempSync(join(tmpdir(), 'fantamagazine-io-test-'));
  process.env.DATA_ROOT = tempRoot;
});

afterEach(() => {
  if (previousDataRoot === undefined) {
    delete process.env.DATA_ROOT;
  } else {
    process.env.DATA_ROOT = previousDataRoot;
  }
  rmSync(tempRoot, { recursive: true, force: true });
});

describe('writeData', () => {
  it('writes valid data to DATA_ROOT and returns the absolute path', () => {
    const path = writeData('league/2026-27.json', ItemSchema, { id: 'a1', value: 42 });

    expect(path).toBe(join(tempRoot, 'league/2026-27.json'));
    expect(existsSync(path)).toBe(true);
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual({ id: 'a1', value: 42 });
  });

  it('creates nested directories as needed', () => {
    const path = writeData('a/b/c/item.json', ItemSchema, { id: 'a1', value: 1 });

    expect(existsSync(path)).toBe(true);
  });

  it('throws on invalid data and leaves no file behind', () => {
    const path = join(tempRoot, 'invalid.json');

    expect(() => writeData('invalid.json', ItemSchema, { id: '', value: 'not-a-number' })).toThrow();
    expect(existsSync(path)).toBe(false);
  });
});
