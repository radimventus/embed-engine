import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { pilotMailRelayPlugin } from './vite/pilotMailRelayPlugin';

const rootDir = dirname(fileURLToPath(import.meta.url));

/** Node-only mail transport — never prebundle / never ship in browser. */
const NODE_ONLY_MAIL = ['nodemailer', 'imapflow'] as const;

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
