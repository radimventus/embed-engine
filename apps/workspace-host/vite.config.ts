import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import {
  createSsotResolveAliases,
  repoRoot,
} from '../../packages/embed/vite.ssot-aliases';

const rootDir = dirname(fileURLToPath(import.meta.url));
const clientPublicDir = join(repoRoot, 'apps/client-studio/public');
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf8'),
) as { version: string };

/**
 * ARCH-01 — CONIS Workspace Host.
 * Operator entry for Client Studio Experience (not partner Embed launcher).
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  envDir: repoRoot,
  // Development serves canonical Client assets locally. Production publishing
  // copies the declared package contract to the Pages root once, rather than
  // duplicating it below every Studio route.
  publicDir:
    process.env.VITE_SHARED_PUBLIC_ROOT === '1' ? false : clientPublicDir,
  plugins: [react()],
  css: {
    postcss: join(rootDir, 'postcss.config.js'),
  },
  resolve: {
    alias: createSsotResolveAliases(),
    dedupe: ['react', 'react-dom'],
  },
  define: {
    __WORKSPACE_HOST_VERSION__: JSON.stringify(packageJson.version),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  server: {
    host: '127.0.0.1',
    port: 4183,
    strictPort: true,
    fs: {
      allow: [repoRoot],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4184,
    strictPort: true,
  },
  build: {
    sourcemap: false,
    target: 'es2022',
  },
});
