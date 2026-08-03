import path from 'node:path';
import { fileURLToPath } from 'node:url';

import clientStudioConfig from '../client-studio/tailwind.config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const clientStudio = path.join(repoRoot, 'apps/client-studio');
const uiSrc = path.join(repoRoot, 'packages/ui/src');
const hostSrc = path.join(here, 'src');

/**
 * ARCH-01 — Workspace Host Tailwind (Client Studio theme + absolute content globs).
 */
/** @type {import('tailwindcss').Config} */
export default {
  ...clientStudioConfig,
  important: true,
  content: [
    path.join(here, 'index.html'),
    path.join(hostSrc, '**/*.{js,ts,jsx,tsx}'),
    path.join(clientStudio, 'index.html'),
    path.join(clientStudio, 'src/**/*.{js,ts,jsx,tsx}'),
    path.join(uiSrc, '**/*.{js,ts,jsx,tsx}'),
  ],
};
