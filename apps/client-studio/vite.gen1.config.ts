import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf8'),
) as { version: string };

/**
 * Client Studio Gen1 Freeze — last static Studio before Decision Experience.
 *
 * Output: `gen1/` (committed; not overwritten by `dev` / `build` → `dist/`).
 * Preview: http://127.0.0.1:5175/
 *
 * Do not point day-to-day development at this config.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    __CLIENT_STUDIO_VERSION__: JSON.stringify(packageJson.version),
  },
  build: {
    outDir: 'gen1',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022',
    reportCompressedSize: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
  },
});
