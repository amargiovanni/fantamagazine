import { defineConfig } from 'vitest/config';

/**
 * Unit tests for the site's pure libraries (`src/lib/*.ts`).
 *
 * `.astro` components are not covered here — they need `@astrojs/check` or a
 * component renderer, neither of which is an authorised dependency; they are
 * verified by the build plus the browser pass documented in the task report.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
