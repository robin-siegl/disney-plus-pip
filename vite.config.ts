import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import manifest from './manifest.config.ts';

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    // CRXJS adds a wrapper around content scripts. A regular source-map
    // comment can swallow the closing wrapper and produce invalid JavaScript.
    sourcemap: 'hidden',
    emptyOutDir: true,
  },
});
