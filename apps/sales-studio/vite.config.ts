import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

function localSameSiteServer(port: number): UserConfig['server'] {
  if (process.env.CONIS_LOCAL_HTTPS !== '1') {
    return { host: '127.0.0.1', port, strictPort: true };
  }
  const certificatePath = process.env.CONIS_LOCAL_HTTPS_CERT_PATH;
  const keyPath = process.env.CONIS_LOCAL_HTTPS_KEY_PATH;
  if (certificatePath === undefined || keyPath === undefined) {
    throw new Error(
      'CONIS_LOCAL_HTTPS_CERT_PATH and CONIS_LOCAL_HTTPS_KEY_PATH are required for same-site local HTTPS.',
    );
  }
  return {
    host: 'conis.cz',
    port,
    strictPort: true,
    allowedHosts: ['conis.cz'],
    https: {
      cert: readFileSync(certificatePath),
      key: readFileSync(keyPath),
    },
  };
}

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
    ...localSameSiteServer(4179),
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
  },
});
