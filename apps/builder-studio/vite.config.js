import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import {
  createSsotResolveAliases,
  repoRoot as ssotRepoRoot,
} from '../../packages/embed/vite.ssot-aliases.js';
import { conisViteDevLogging } from '../../packages/embed/vite.dev-logging.js';

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

/** BU-001 — presentation bulk upload dirs (Builder host only). */
const BULK_UPLOAD_DIRS = {
  images: { dir: 'media/gallery', extensions: ['.jpg', '.jpeg', '.png', '.webp'] },
  svg: { dir: 'media/plans', extensions: ['.svg'] },
  documents: {
    dir: 'media/documents',
    extensions: ['.pdf', '.doc', '.docx'],
  },
};

function sanitizeUploadFileName(fileName) {
  const base = String(fileName).split(/[/\\]/).pop() ?? 'file';
  return base.replace(/[^\w.\-()+ ]+/g, '_').replace(/\s+/g, '-');
}

function uniqueUploadPath(dirAbsolute, fileName) {
  const safe = sanitizeUploadFileName(fileName);
  const dot = safe.lastIndexOf('.');
  const stem = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : '';
  let candidate = safe;
  let index = 1;
  while (existsSync(join(dirAbsolute, candidate))) {
    candidate = `${stem}-${index}${ext}`;
    index += 1;
  }
  return candidate;
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
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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

        if (
          pathOnly === '/__builder/house-package/initialize' &&
          req.method === 'POST'
        ) {
          try {
            const raw = await readRequestBody(req);
            const body = JSON.parse(raw || '{}');
            const houseId =
              body && typeof body.houseId === 'string'
                ? body.houseId.trim()
                : '';
            const { initializeBuilderHousePackage } = await import(
              '../../packages/object-house/src/builder-package/initializeBuilderHousePackage.ts'
            );
            const result = await initializeBuilderHousePackage({
              repoRoot,
              houseId,
            });
            res.statusCode = result.ok ? 200 : 400;
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
                    : 'House Package initialization failed.',
              }),
            );
          }
          return;
        }

        const housePackageDiskRoot = activeHousePackage.diskRoot;

        if (
          pathOnly === '/api/house-package/upload' &&
          req.method === 'POST'
        ) {
          try {
            const raw = await readRequestBody(req);
            const body = JSON.parse(raw || '{}');
            const kind =
              body && typeof body.kind === 'string' ? body.kind : '';
            const kindConfig = BULK_UPLOAD_DIRS[kind];
            const incoming = Array.isArray(body?.files) ? body.files : [];
            if (kindConfig === undefined || incoming.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(
                JSON.stringify({
                  ok: false,
                  error: 'Invalid upload kind or empty files.',
                  results: [],
                }),
              );
              return;
            }
            const dirAbsolute = join(housePackageDiskRoot, kindConfig.dir);
            mkdirSync(dirAbsolute, { recursive: true });
            const results = [];
            for (const entry of incoming) {
              const name =
                entry && typeof entry.name === 'string' ? entry.name : '';
              const contentBase64 =
                entry && typeof entry.contentBase64 === 'string'
                  ? entry.contentBase64
                  : '';
              const lower = name.toLowerCase();
              const allowed = kindConfig.extensions.some((ext) =>
                lower.endsWith(ext),
              );
              if (!allowed || contentBase64.length === 0) {
                results.push({
                  fileName: name,
                  relativePath: '',
                  ok: false,
                  error: 'Unsupported file or empty payload.',
                });
                continue;
              }
              const uniqueName = uniqueUploadPath(dirAbsolute, name);
              const absolute = join(dirAbsolute, uniqueName);
              writeFileSync(absolute, Buffer.from(contentBase64, 'base64'));
              results.push({
                fileName: uniqueName,
                relativePath: `${kindConfig.dir}/${uniqueName}`,
                ok: true,
              });
            }
            const ok = results.every((item) => item.ok);
            res.statusCode = ok ? 200 : 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok, results }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                ok: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Upload middleware failed.',
                results: [],
              }),
            );
          }
          return;
        }

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
            const packageRoot =
              body && typeof body === 'object' && typeof body.packageRoot === 'string'
                ? resolveAllowedPackageRoot(body.packageRoot)
                : null;
            if (packageRoot === null) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(
                JSON.stringify({
                  ok: false,
                  error: 'Invalid active House Package root.',
                }),
              );
              return;
            }
            const { persistBuilderHousePackage } = await import(
              '../../packages/object-house/src/builder-package/persistBuilderHousePackage.ts'
            );
            const result = await persistBuilderHousePackage({
              packageRoot: packageRoot.absolute,
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
  ...conisViteDevLogging(),
  base: process.env.VITE_BASE ?? '/',
  envDir: repoRoot,
  plugins: [react(), serveHousePackagePlugin()],
  css: {
    // Builder chrome + Embed Experience tokens live in apps/builder-studio/tailwind.config.js
    // so Client Studio CSS (?inline Runtime Preview) resolves text-embed-* @apply.
    postcss: join(rootDir, 'postcss.config.js'),
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
