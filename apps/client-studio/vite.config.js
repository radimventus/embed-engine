import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createSsotResolveAliases, repoRoot } from '../../packages/embed/vite.ssot-aliases';
const rootDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
/**
 * SSOT Local host Vite config (compiled mirror of vite.config.ts).
 */
export default defineConfig({
    base: process.env.VITE_BASE ?? '/',
    envDir: repoRoot,
    plugins: [react()],
    resolve: {
        alias: createSsotResolveAliases(),
        dedupe: ['react', 'react-dom'],
    },
    define: {
        __CLIENT_STUDIO_VERSION__: JSON.stringify(packageJson.version),
        'process.env.NODE_ENV': JSON.stringify('development'),
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
        fs: { allow: [repoRoot] },
    },
    preview: {
        host: '127.0.0.1',
        port: 4174,
        strictPort: true,
    },
});
