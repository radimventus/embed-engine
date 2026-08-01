import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * Sales Studio Vite config (EPIC-BX-11).
 * Port 4179 — distinct from Builder (4177) and Manager (4175).
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
    port: 4179,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
  },
});
