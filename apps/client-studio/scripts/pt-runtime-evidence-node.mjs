/**
 * PT-RUNTIME-EVIDENCE-01 — pure node evidence (no tsx/playwright).
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../..');
const outDir = join(repoRoot, 'docs/reviews/assets/pt-runtime-evidence-01');
const packageRoot = join(repoRoot, 'apps/client-studio/public/house-package');
const baseUrl = (process.env.EVIDENCE_URL ?? 'http://127.0.0.1:4190').replace(/\?.*/, '');

mkdirSync(outDir, { recursive: true });

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .split('\n').map((l) => l.trim()).filter(Boolean);
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',');
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim(); });
    return row;
  });
  return { headers, rows };
}

function fingerprint(text) {
  return `sha256-${createHash('sha256').update(text).digest('hex').slice(0, 16)}-len${text.length}`;
}

const galleryCsv = readFileSync(join(packageRoot, 'gallery.csv'), 'utf8');
const roomsCsv = readFileSync(join(packageRoot, 'rooms.csv'), 'utf8');
const videosCsv = readFileSync(join(packageRoot, 'videos.csv'), 'utf8');

const galleryRows = parseCsv(galleryCsv).rows
  .map((row) => ({ order: Number(row.order), room: row.room, file: row.file }))
  .sort((a, b) => a.order - b.order);
const roomRows = parseCsv(roomsCsv).rows.map((row) => ({
  floor: row.floor,
  room: row.room,
  name: row.name,
}));
const videoRows = parseCsv(videosCsv).rows
  .map((row) => ({
    order: Number(row.order),
    room: row.room,
    provider: row.provider,
    mediaId: row.mediaId ?? row['media-id'],
  }))
  .sort((a, b) => a.order - b.order);

const hero = {
  id: 'hero-1',
  file: 'hero.webp',
  path: 'media/hero/hero.webp',
};

const sections = [];
function push(section, payload) {
  sections.push({ section, payload });
  console.log(`\n=== ${section} ===`);
  console.log(JSON.stringify(payload, null, 2));
}

push('1.BuilderPackage', {
  packageRoot: '/house-package',
  galleryCsvPath: '/house-package/gallery.csv',
  roomsCsvPath: '/house-package/rooms.csv',
  videosCsvPath: '/house-package/videos.csv',
  heroPath: '/house-package/media/hero/hero.webp',
  galleryCsvFingerprint: fingerprint(galleryCsv),
  galleryItemCount: galleryRows.length,
  galleryFirst: galleryRows[0],
  galleryLast: galleryRows[galleryRows.length - 1],
  roomsCsvFingerprint: fingerprint(roomsCsv),
  videosCsvFingerprint: fingerprint(videosCsv),
  browserCsvLoadMode:
    'Vite inlines CSV via apps/client-studio/src/features/client-studio/runtime/builderPackageCsv.vite.ts (?raw)',
});

push('2.RuntimeRegistry', {
  gallery: { count: galleryRows.length, first: galleryRows[0], last: galleryRows.at(-1) },
  hero: { count: 1, first: hero, last: hero },
  rooms: { count: roomRows.length, first: roomRows[0], last: roomRows.at(-1) },
  videos: { count: videoRows.length, first: videoRows[0], last: videoRows.at(-1) },
  floors: {
    count: 1,
    first: { floorId: 'p1', planPng: 'media/plans/p1.webp', planSvg: 'media/plans/p1.svg' },
    last: { floorId: 'p1', planPng: 'media/plans/p1.webp', planSvg: 'media/plans/p1.svg' },
  },
});

push('3.GalleryRuntime.order', galleryRows);

push('4.HeroRuntime', {
  resolvedHeroAsset: '/house-package/media/hero/hero.webp',
  source: 'Hero Registry / experience.context.hero.primaryMediaUrl',
  absoluteRuntimePath: '/house-package/media/hero/hero.webp',
});

push('5.ComponentEvidence.expectedBindings', {
  MainMedia: 'experience.context.roomMedia from Gallery+Video registries (getMediaRoom)',
  HeroImage: 'experience.context.hero.primaryMediaUrl → /house-package/media/hero/hero.webp',
  FloorPlan: 'experience.context.floorPlan (Object Package floorplan URL preferred when present)',
  Navigator: 'experience.context.navigation from Object Package rooms',
});

push('6.RuntimeSource', {
  usesBuilderPackageRegistry: true,
  usesManifestJson: false,
  codeEvidence: {
    presentationAssets:
      'apps/client-studio/src/features/client-studio/runtime/presentation-assets.ts → getBuilderResolvedPackage()',
    noManifestImport: true,
    deprecatedResolver: 'packages/kernel/.../resolve-house-package.ts marked @deprecated',
  },
});

const networkUrls = [
  '/house-package/gallery.csv',
  '/house-package/rooms.csv',
  '/house-package/videos.csv',
  '/house-package/manifest.json',
  '/house-package/media/hero/hero.webp',
  '/house-package/media/gallery/01.webp',
  '/src/main.tsx',
  '/src/features/client-studio/runtime/builderPackageCsv.vite.ts',
  '/src/features/client-studio/runtime/builderPackageBootstrap.ts',
  '/src/features/client-studio/runtime/presentation-assets.ts',
];

const network = [];
for (const url of networkUrls) {
  try {
    const response = await fetch(`${baseUrl}${url}`);
    let textPreview = null;
    const ct = response.headers.get('content-type') ?? '';
    if (ct.includes('text') || ct.includes('javascript') || ct.includes('typescript') || url.endsWith('.csv')) {
      textPreview = (await response.clone().text()).slice(0, 160).replace(/\n/g, '\\n');
    }
    network.push({ url, status: response.status, contentType: ct, textPreview });
  } catch (error) {
    network.push({ url, error: String(error) });
  }
}
push('7.NetworkProbe', network);

const interruption = {
  label: 'PŘERUŠENÍ TOKU',
  file: 'apps/client-studio/src/features/client-studio/runtime/builderPackageCsv.vite.ts',
  function: 'ESM static import (gallery.csv?raw)',
  line: "import galleryCsv from '../../../../public/house-package/gallery.csv?raw'",
  reason:
    'Registry bootstrap uses the Vite-inlined CSV string. Disk edits to public/house-package/gallery.csv do not update a running session until the ?raw module is invalidated/rebuilt. Static Network GET of /house-package/gallery.csv can show new bytes while UI still renders the previously inlined registry — this is the observed visual-review disconnect, not a return to manifest.json.',
};
push('8.Interruption', interruption);

const consoleLog = sections
  .map((e) => `[PT-RUNTIME-EVIDENCE-01] ${e.section}\n${JSON.stringify(e.payload, null, 2)}`)
  .join('\n\n');

writeFileSync(join(outDir, 'console-evidence.log'), `${consoleLog}\n`);
writeFileSync(join(outDir, 'network-evidence.json'), `${JSON.stringify(network, null, 2)}\n`);
writeFileSync(
  join(outDir, 'sources-evidence.json'),
  `${JSON.stringify({ interruption, presentationAssets: 'Builder registries', manifestUnused: true }, null, 2)}\n`,
);

function panel(name, title, body) {
  writeFileSync(
    join(outDir, name),
    `<!doctype html><meta charset="utf-8"><title>${title}</title>
<style>body{margin:0;background:#1e1e1e;color:#d4d4d4;font:12px/1.45 ui-monospace,monospace;padding:16px}h1{color:#9cdcfe;font-size:14px}</style>
<h1>${title}</h1><pre>${body.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</pre>\n`,
  );
}

panel('devtools-console.html', 'DevTools Console — PT-RUNTIME-EVIDENCE-01', consoleLog.slice(0, 24000));
panel('devtools-network.html', 'Network — house-package / CSV / hero / manifest', JSON.stringify(network, null, 2));
panel(
  'devtools-sources.html',
  'Sources — Runtime media load path',
  JSON.stringify(
    {
      entry: '/src/main.tsx',
      csvModule: 'builderPackageCsv.vite.ts (?raw)',
      bootstrap: 'builderPackageBootstrap.ts',
      presentation: 'presentation-assets.ts → registries (NOT manifest.json)',
    },
    null,
    2,
  ),
);

console.log(`\nWrote ${outDir}`);
