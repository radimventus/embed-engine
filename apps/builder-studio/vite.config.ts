// Runtime config SSOT is vite.config.js (Vite prefers .js).
// Keep this TypeScript mirror for editors; prefer editing vite.config.js.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import {
  createSsotResolveAliases,
  repoRoot as ssotRepoRoot,
} from '../../packages/embed/vite.ssot-aliases.js';

const rootDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = ssotRepoRoot;
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf8'),
);

const defaultHousePackageDiskRoot = resolve(
  repoRoot,
  'apps/client-studio/public/house-package',
);

/** CAP-BLD-08 — single active HP root (no parallel mounts). */
let activeHousePackage = {
  projectId: 'villa-168',
  packageRootRel: 'apps/client-studio/public/house-package',
  diskRoot: defaultHousePackageDiskRoot,
};

function resolveAllowedPackageRoot(packageRootRel) {
  const normalized = packageRootRel.replace(/\\/g, '/').replace(/^\.\//, '');
  if (normalized.includes('..') || normalized.includes('\0')) {
    return null;
  }
  const allowed =
    normalized === 'apps/client-studio/public/house-package' ||
    normalized.startsWith('apps/client-studio/public/house-packages/');
  if (!allowed) {
    return null;
  }
  const absolute = resolve(repoRoot, normalized);
  const fromRepo = relative(repoRoot, absolute);
  if (fromRepo.startsWith('..')) {
    return null;
  }
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
    return null;
  }
  if (!existsSync(join(absolute, 'rooms.csv'))) {
    return null;
  }
  return { absolute, relative: normalized };
}

function readEmbedRuntimeBuildDefine() {
  const versionPath = join(repoRoot, 'docs/embed/version.json');
  try {
    const versionJson = JSON.parse(readFileSync(versionPath, 'utf8'));
    const fp = versionJson.fingerprint;
    if (
      fp &&
      typeof fp.commit === 'string' &&
      typeof fp.builtAt === 'string' &&
      typeof fp.marker === 'string' &&
      typeof fp.runtimeSource === 'string'
    ) {
      return {
        commit: fp.commit,
        builtAt: fp.builtAt,
        runtimeSource: fp.runtimeSource,
        marker: fp.marker,
      };
    }
  } catch {
    // fall through
  }
  return {
    commit: 'dev',
    builtAt: 'dev',
    runtimeSource: 'builder-package/projectBuilderImportToHousePackage',
    marker: 'EMBED_RUNTIME_BUILD:dev@dev',
  };
}

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

        if (pathOnly === '/api/workspace/active') {
          if (req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                ok: true,
                projectId: activeHousePackage.projectId,
                packageRoot: activeHousePackage.packageRootRel,
              }),
            );
            return;
          }
          if (req.method === 'POST') {
            try {
              const raw = await readRequestBody(req);
              const body = JSON.parse(raw || '{}');
              const packageRootRel =
                typeof body.packageRoot === 'string' ? body.packageRoot : '';
              const projectId =
                typeof body.projectId === 'string' ? body.projectId : '';
              const resolved = resolveAllowedPackageRoot(packageRootRel);
              if (resolved === null || projectId.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(
                  JSON.stringify({
                    ok: false,
                    error:
                      'Invalid packageRoot or projectId. Root must be an HP-002 directory under apps/client-studio/public.',
                  }),
                );
                return;
              }
              activeHousePackage = {
                projectId,
                packageRootRel: resolved.relative,
                diskRoot: resolved.absolute,
              };
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(
                JSON.stringify({
                  ok: true,
                  projectId,
                  packageRoot: resolved.relative,
                }),
              );
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(
                JSON.stringify({
                  ok: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Workspace active middleware failed.',
                }),
              );
            }
            return;
          }
        }

        const housePackageDiskRoot = activeHousePackage.diskRoot;

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
          pathOnly === '/api/house-package/publish' &&
          req.method === 'POST'
        ) {
          try {
            const { importBuilderHousePackage } = await import(
              '../../packages/object-house/src/builder-package/importBuilderHousePackage.ts'
            );
            const { publishAllFloorPlanGeometry } = await import(
              '../../packages/object-house/src/builder-package/publishFloorPlanGeometry.ts'
            );
            const { runProductionHousePackagePublish } = await import(
              './src/features/house-package/server/runProductionHousePackagePublish.ts'
            );
            const result = await runProductionHousePackagePublish({
              packageRoot: housePackageDiskRoot,
              repoRoot,
              importBuilderHousePackage,
              publishAllFloorPlanGeometry,
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
                stage: 'embed:publish',
                error:
                  error instanceof Error
                    ? error.message
                    : 'Publish middleware failed.',
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
 * Builder Studio Vite config (CAP-BLD-02..07).
 * Vite prefers vite.config.js over vite.config.ts when both exist.
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  envDir: repoRoot,
  plugins: [react(), serveHousePackagePlugin()],
  css: {
    postcss: join(repoRoot, 'packages/embed/postcss.config.js'),
  },
  resolve: {
    alias: createSsotResolveAliases(),
    dedupe: ['react', 'react-dom'],
  },
  define: {
    __BUILDER_STUDIO_VERSION__: JSON.stringify(packageJson.version),
    __EMBED_RUNTIME_BUILD__: JSON.stringify(readEmbedRuntimeBuildDefine()),
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV ?? 'development',
    ),
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
