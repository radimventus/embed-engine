import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * CAP-CE-01 — Public Offer Experience.
 * Port 4192 — distinct from conis-web (4190) and studio hosts.
 */
export default defineConfig({
  root: rootDir,
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    sourcemap: false,
    target: 'es2022',
  },
  server: {
    host: '127.0.0.1',
    port: 4192,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4193,
    strictPort: true,
  },
});
