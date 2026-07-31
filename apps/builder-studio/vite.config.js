import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(rootDir, '../..');
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf8'),
);

const housePackageDiskRoot = resolve(
  repoRoot,
  'apps/client-studio/public/house-package',
);

const CONTENT_TYPES = {
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

function pkgSrc(name, entry = 'index.ts') {
  return resolve(repoRoot, 'packages', name, 'src', entry);
}

/** Same workspace source aliases as Embed / Client Studio hosts. */
function createBuilderResolveAliases() {
  return [
    {
      find: '@embed-engine/object-house/builder-package/node',
      replacement: pkgSrc('object-house', 'builder-package/node.ts'),
    },
    {
      find: '@embed-engine/object-house/builder-package',
      replacement: pkgSrc('object-house', 'builder-package/index.ts'),
    },
    {
      find: '@embed-engine/object-house/loader',
      replacement: pkgSrc('object-house', 'loader/index.ts'),
    },
    {
      find: '@embed-engine/object-house',
      replacement: pkgSrc('object-house'),
    },
    {
      find: '@embed-engine/design-tokens',
      replacement: pkgSrc('design-tokens'),
    },
    {
      find: '@embed-engine/model',
      replacement: pkgSrc('model'),
    },
    {
      find: '@embed-engine/core',
      replacement: pkgSrc('core'),
    },
  ];
}

function readRequestBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolveBody(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', rejectBody);
  });
}

function serveHousePackagePlugin() {
  return {
    name: 'serve-house-package-hp002',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        const pathOnly = (url.split('?')[0] ?? url);

        if (
          pathOnly === '/api/house-package/validate' &&
          req.method === 'POST'
        ) {
          try {
            const { importBuilderHousePackage } = await import(
              '../../packages/object-house/src/builder-package/importBuilderHousePackage.ts'
            );
            const result = await importBuilderHousePackage(housePackageDiskRoot);
            const errors = result.ok ? [] : result.errors;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, errors }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                ok: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Validate middleware failed.',
                errors: [],
              }),
            );
          }
          return;
        }

        if (
          pathOnly === '/api/house-package/persist' &&
          req.method === 'POST'
        ) {
          try {
            const raw = await readRequestBody(req);
            const body = JSON.parse(raw || '{}');
            const files =
              body && typeof body === 'object' && body.files
                ? body.files
                : {};
            const { persistBuilderHousePackage } = await import(
              '../../packages/object-house/src/builder-package/persistBuilderHousePackage.ts'
            );
            const result = await persistBuilderHousePackage({
              packageRoot: housePackageDiskRoot,
              files: {
                roomsCsv:
                  typeof files.roomsCsv === 'string'
                    ? files.roomsCsv
                    : undefined,
                galleryCsv:
                  typeof files.galleryCsv === 'string'
                    ? files.galleryCsv
                    : undefined,
                videosCsv:
                  typeof files.videosCsv === 'string'
                    ? files.videosCsv
                    : undefined,
                manifestJson:
                  typeof files.manifestJson === 'string'
                    ? files.manifestJson
                    : files.manifestJson === null
                      ? null
                      : undefined,
              },
            });
            res.statusCode = result.ok ? 200 : 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(result));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                ok: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Persist middleware failed.',
              }),
            );
          }
          return;
        }

        if (!url.startsWith('/house-package/')) {
          next();
          return;
        }

        const rel = decodeURIComponent(pathOnly.slice('/house-package/'.length));
        if (rel.length === 0 || rel.includes('\0')) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        const absolute = normalize(resolve(housePackageDiskRoot, rel));
        const fromRoot = relative(housePackageDiskRoot, absolute);
        if (fromRoot.startsWith('..') || fromRoot === '') {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        if (!existsSync(absolute) || !statSync(absolute).isFile()) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        const ext = absolute.slice(absolute.lastIndexOf('.')).toLowerCase();
        const type = CONTENT_TYPES[ext] ?? 'application/octet-stream';
        res.statusCode = 200;
        res.setHeader('Content-Type', type);
        res.setHeader('Cache-Control', 'no-store');
        res.end(readFileSync(absolute));
      });
    },
  };
}

/**
 * Builder Studio Vite config (EPIC-BLD-01 / CAP-BLD-02).
 * Vite prefers vite.config.js over vite.config.ts when both exist.
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), serveHousePackagePlugin()],
  resolve: {
    alias: createBuilderResolveAliases(),
    dedupe: ['react', 'react-dom'],
  },
  define: {
    __BUILDER_STUDIO_VERSION__: JSON.stringify(packageJson.version),
  },
  build: {
    sourcemap: false,
    target: 'es2022',
  },
  server: {
    host: '127.0.0.1',
    port: 4177,
    strictPort: true,
    fs: {
      allow: [repoRoot],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4178,
    strictPort: true,
  },
});
