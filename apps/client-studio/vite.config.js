import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createSsotResolveAliases, repoRoot } from '../../packages/embed/vite.ssot-aliases';
const rootDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
/**
 * SSOT Local host Vite config.
 *
 * Local is an Embed host only — same source aliases as Embed demo / Embed build.
 * There is no parallel Client Studio SPA Runtime entry.
 */
export default defineConfig({
    base: process.env.VITE_BASE ?? '/',
    envDir: repoRoot,
    plugins: [react()],
    css: {
        // SSOT CSS pipeline must match Embed hosts exactly.
        postcss: join(repoRoot, 'packages/embed/postcss.config.js'),
    },
    resolve: {
        alias: createSsotResolveAliases(),
        dedupe: ['react', 'react-dom'],
    },
    define: {
        __CLIENT_STUDIO_VERSION__: JSON.stringify(packageJson.version),
        'process.env.NODE_ENV': JSON.stringify('development'),
    },
    server: {
        host: '127.0.0.1',
        port: 4173,
        strictPort: true,
        fs: {
            allow: [repoRoot],
        },
    },
    preview: {
        host: '127.0.0.1',
        port: 4174,
        strictPort: true,
    },
    build: {
        sourcemap: false,
        target: 'es2022',
        reportCompressedSize: true,
    },
});
