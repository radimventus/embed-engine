import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';

import { pilotMailRelayPlugin } from './vite/pilotMailRelayPlugin';

const rootDir = dirname(fileURLToPath(import.meta.url));

/** Node-only mail transport — never prebundle / never ship in browser. */
const NODE_ONLY_MAIL = ['nodemailer', 'imapflow'] as const;

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
 * Office Studio Vite config (OF-01).
 * Port 4181 — distinct from Sales (4179) and Manager (4175).
 * CAP-GOV-06: isolate Node mail deps from browser optimizeDeps / build.
 * PT-COM-02: POST /api/pilot-mail/send relays production SMTP.
 */
export default defineConfig({
  root: rootDir,
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), pilotMailRelayPlugin()],
  optimizeDeps: {
    exclude: [...NODE_ONLY_MAIL],
  },
  build: {
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      external: [...NODE_ONLY_MAIL],
    },
  },
  ssr: {
    external: [...NODE_ONLY_MAIL],
  },
  server: {
    ...localSameSiteServer(4181),
  },
  preview: {
    host: '127.0.0.1',
    port: 4182,
    strictPort: true,
  },
});
