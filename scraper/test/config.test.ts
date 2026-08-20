import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

let tempRoot: string;
let previousUsername: string | undefined;
let previousPassword: string | undefined;
let previousEnvFile: string | undefined;

beforeEach(() => {
  previousUsername = process.env.FC_USERNAME;
  previousPassword = process.env.FC_PASSWORD;
  previousEnvFile = process.env.ENV_FILE;

  // Point the hand-rolled dotenv loader at an empty temp dir so a real
  // developer .env (with real credentials) never leaks into this test.
  tempRoot = mkdtempSync(join(tmpdir(), 'fantamagazine-config-test-'));
  process.env.ENV_FILE = join(tempRoot, '.env');

  process.env.FC_USERNAME = 'super-secret-username';
  delete process.env.FC_PASSWORD;
});

afterEach(() => {
  if (previousUsername === undefined) delete process.env.FC_USERNAME;
  else process.env.FC_USERNAME = previousUsername;

  if (previousPassword === undefined) delete process.env.FC_PASSWORD;
  else process.env.FC_PASSWORD = previousPassword;

  if (previousEnvFile === undefined) delete process.env.ENV_FILE;
  else process.env.ENV_FILE = previousEnvFile;

  rmSync(tempRoot, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('throws naming the missing variable, without leaking the value of a variable that is set', () => {
    let thrown: unknown;
    try {
      loadConfig();
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(Error);
    const message = (thrown as Error).message;
    expect(message).toContain('FC_PASSWORD');
    expect(message).not.toContain('super-secret-username');
  });
});
