// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Static output only; `site` stays unset until the deploy URL is known (Task 12).
  output: 'static',
  // Markdown is left on Astro's default processor. The pagelle's single-newline
  // line breaks are restored in CSS (see `.prose` in src/styles/global.css):
  // a remark plugin would require installing @astrojs/markdown-remark, and the
  // dependency list for this project is closed.
});
