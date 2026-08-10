import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const rootDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(rootDir, '../..');
const clientPublicDir = join(repoRoot, 'apps/client-studio/public');
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
/**
 * Manager Studio Vite config (MSCB-01).
 * Ports intentionally distinct from Client Studio (4173/4174).
 * Local Manager serves Client public assets for development. Production uses
 * the release-wide Pages House Package root emitted by studio:publish.
 */
export default defineConfig({
    base: process.env.VITE_BASE ?? '/',
    plugins: [react()],
    publicDir: process.env.VITE_SHARED_PUBLIC_ROOT === '1' ? false : clientPublicDir,
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
