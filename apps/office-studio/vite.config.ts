import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * Office Studio Vite config (OF-01).
 * Port 4181 — distinct from Sales (4179) and Manager (4175).
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
    port: 4181,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4182,
    strictPort: true,
  },
});
