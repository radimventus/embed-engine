import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const rootDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
/**
 * Client Studio Vite config (CSCB-09).
 *
 * - Production source maps: off (policy — enable only for internal debug builds).
 * - Version injected for support diagnostics (no Runtime semantics).
 * - Optional `VITE_BASE` for subdirectory hosting.
 */
export default defineConfig({
    base: process.env.VITE_BASE ?? '/',
    plugins: [react()],
    define: {
        __CLIENT_STUDIO_VERSION__: JSON.stringify(packageJson.version),
    },
    build: {
        sourcemap: false,
        target: 'es2022',
        reportCompressedSize: true,
    },
    server: {
        host: '127.0.0.1',
        port: 4173,
        strictPort: true,
    },
    preview: {
        host: '127.0.0.1',
        port: 4174,
        strictPort: true,
    },
});
