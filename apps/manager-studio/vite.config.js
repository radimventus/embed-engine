import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const rootDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
/**
 * Manager Studio Vite config (MSCB-01).
 * Ports intentionally distinct from Client Studio (4173/4174).
 */
export default defineConfig({
    base: process.env.VITE_BASE ?? '/',
    plugins: [react()],
    define: {
        __MANAGER_STUDIO_VERSION__: JSON.stringify(packageJson.version),
    },
    build: {
        sourcemap: false,
        target: 'es2022',
    },
    server: {
        host: '127.0.0.1',
        port: 4175,
        strictPort: true,
    },
    preview: {
        host: '127.0.0.1',
        port: 4176,
        strictPort: true,
    },
});
