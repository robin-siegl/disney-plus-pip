import { readFileSync } from 'node:fs';
import { defineManifest } from '@crxjs/vite-plugin';

interface PackageJson {
  version: string;
}

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageJson;

export default defineManifest({
  manifest_version: 3,
  name: 'Disney+ Picture in Picture',
  version: packageJson.version,
  description: 'Adds Picture-in-Picture controls to the Disney+ web player.',
  permissions: ['activeTab', 'scripting'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  action: {
    default_title: 'Toggle Disney+ Picture in Picture',
    default_icon: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  content_scripts: [
    {
      matches: ['https://*.disneyplus.com/*'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle',
    },
  ],
  icons: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
});
