import {
  buildBuilderPackageRegistries,
  isFloorPlanGeometry,
  parseCsv,
  projectBuilderImportToHousePackage,
  type BuilderHousePackageImport,
  type FloorPlanGeometry,
} from '@embed-engine/object-house/builder-package';
import type { HousePackage } from '@embed-engine/object-house';

import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from './builderRuntimeHouseDefaults';
import {
  clearFloorPlanGeometryCache,
  setFloorPlanGeometryForFloor,
} from './floorPlanGeometryStore';
import { getPresentationAssetBase } from './presentationAssetBase';
import {
  evidenceLog,
  fingerprintText,
  firstLast,
  isRuntimeEvidenceEnabled,
} from './runtimeEvidence';

const PACKAGE_ROOT_LABEL = '/house-package';
const HERO_PATH = 'media/hero/hero.png';

export const GALLERY_CSV_PATH = '/house-package/gallery.csv';
export const ROOMS_CSV_PATH = '/house-package/rooms.csv';
export const VIDEOS_CSV_PATH = '/house-package/videos.csv';
const HERO_PUBLIC_PATH = '/house-package/media/hero/hero.png';

function csvPathsForPackageRoot(packagePublicRoot: string): {
  readonly gallery: string;
  readonly rooms: string;
  readonly videos: string;
  readonly packageRootLabel: string;
} {
  const root = packagePublicRoot.replace(/\/+$/, '') || '/house-package';
  return {
    gallery: `${root}/gallery.csv`,
    rooms: `${root}/rooms.csv`,
    videos: `${root}/videos.csv`,
    packageRootLabel: root,
  };
}

export type BuilderPackageCsvTexts = {
  readonly galleryCsv: string;
  readonly roomsCsv: string;
  readonly videosCsv: string;
};

function planPairsFromRooms(roomsCsvText: string): {
  readonly floorId: string;
  readonly rasterRelativePath: string;
  readonly svgRelativePath: string;
}[] {
  const table = parseCsv(roomsCsvText);
  const floors = new Set<string>();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) {
      floors.add(floor);
    }
  }

  return [...floors]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((floorId) => ({
      floorId,
      rasterRelativePath: `media/plans/${floorId}.webp`,
      svgRelativePath: `media/plans/${floorId}.svg`,
    }));
}

function resolvePackageUrl(absolutePath: string): string {
  const assetBase = getPresentationAssetBase();
  if (assetBase === null || assetBase.length === 0) {
    return absolutePath;
  }
  if (
    absolutePath.startsWith('https://') ||
    absolutePath.startsWith('http://') ||
    absolutePath.startsWith('data:') ||
    absolutePath.startsWith('blob:')
  ) {
    return absolutePath;
  }
  if (absolutePath.startsWith('/')) {
    return `${assetBase}${absolutePath}`;
  }
  return absolutePath;
}

async function fetchText(absolutePath: string): Promise<string> {
  const url = resolvePackageUrl(absolutePath);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      `Failed to load House Package asset ${url}: HTTP ${response.status}`,
    );
  }
  return response.text();
}

async function fetchCsvText(absolutePath: string): Promise<string> {
  return fetchText(absolutePath);
}

async function loadFloorPlanGeometryForRooms(
  roomsCsvText: string,
  packagePublicRoot: string,
): Promise<void> {
  clearFloorPlanGeometryCache();
  const table = parseCsv(roomsCsvText);
  const floors = new Set<string>();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) {
      floors.add(floor);
    }
  }
  const root = packagePublicRoot.replace(/\/+$/, '') || '/house-package';
  await Promise.all(
    [...floors].map(async (floorId) => {
      const path = `${root}/media/plans/${floorId}.geometry.json`;
      const text = await fetchText(path);
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(`Invalid HP-003 geometry JSON at ${path}`);
      }
      if (!isFloorPlanGeometry(parsed)) {
        throw new Error(`HP-003 schema mismatch at ${path}`);
      }
      const geometry = parsed as FloorPlanGeometry;
      if (geometry.floorId !== floorId) {
        throw new Error(
          `HP-003 floorId mismatch at ${path}: expected ${floorId}, got ${geometry.floorId}`,
        );
      }
      setFloorPlanGeometryForFloor(floorId, geometry);
    }),
  );
}

/**
 * Vite 7–compatible loader: HTTP fetch of public HP-002 CSVs (no public/?raw imports).
 * PT-PDM-02 — paths follow Shared Project `packagePublicRoot`.
 */
export async function loadBuilderPackageCsvTexts(
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
): Promise<BuilderPackageCsvTexts> {
  const paths = csvPathsForPackageRoot(packagePublicRoot);
  const [galleryCsv, roomsCsv, videosCsv] = await Promise.all([
    fetchCsvText(paths.gallery),
    fetchCsvText(paths.rooms),
    fetchCsvText(paths.videos),
  ]);
  return { galleryCsv, roomsCsv, videosCsv };
}

function buildRegistriesFromTexts(
  texts: BuilderPackageCsvTexts,
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
): BuilderHousePackageImport {
  const paths = csvPathsForPackageRoot(packagePublicRoot);
  const result = buildBuilderPackageRegistries({
    packageRoot: paths.packageRootLabel,
    galleryCsv: texts.galleryCsv,
    roomsCsv: texts.roomsCsv,
    videosCsv: texts.videosCsv,
    heroPath: HERO_PATH,
    planPairs: planPairsFromRooms(texts.roomsCsv),
  });

  if (!result.ok) {
    const detail = result.errors
      .map((error) => `${error.code}: ${error.message}`)
      .join('; ');
    throw new Error(`Builder House Package bootstrap failed: ${detail}`);
  }

  return result.result;
}

function logBuilderPackageEvidence(
  registries: BuilderHousePackageImport,
  texts: BuilderPackageCsvTexts,
): void {
  if (!isRuntimeEvidenceEnabled()) {
    return;
  }

  evidenceLog('1.BuilderPackage', {
    packageRoot: PACKAGE_ROOT_LABEL,
    galleryCsvPath: GALLERY_CSV_PATH,
    roomsCsvPath: ROOMS_CSV_PATH,
    videosCsvPath: VIDEOS_CSV_PATH,
    heroPath: HERO_PUBLIC_PATH,
    galleryCsvSource: 'HTTP fetch of public/house-package/*.csv (Vite 7 compatible)',
    galleryCsvFingerprint: fingerprintText(texts.galleryCsv),
    galleryItemCount: registries.gallery.entries.length,
    galleryFirst: registries.gallery.entries[0] ?? null,
    galleryLast:
      registries.gallery.entries[registries.gallery.entries.length - 1] ?? null,
    roomsCsvFingerprint: fingerprintText(texts.roomsCsv),
    videosCsvFingerprint: fingerprintText(texts.videosCsv),
  });

  evidenceLog('2.RuntimeRegistry', {
    gallery: firstLast(registries.gallery.entries),
    hero: firstLast(registries.hero.entries),
    rooms: firstLast(registries.rooms.rooms),
    videos: firstLast(registries.videos.entries),
    floors: firstLast(registries.floors.floors),
  });

  evidenceLog('6.RuntimeSource', {
    usesBuilderPackageRegistry: true,
    usesRuntimeHousePackageFromBuilder: true,
    usesManifestJson: false,
    usesReferenceHousePackage: false,
    csvLoadMode: 'http-fetch-public-house-package',
  });
}

let cachedRegistries: BuilderHousePackageImport | null = null;
let cachedHousePackage: HousePackage | null = null;
let cachedPackagePublicRoot: string | null = null;
let bootstrapPromise: Promise<BuilderHousePackageImport> | null = null;

function projectCachedHousePackage(
  registries: BuilderHousePackageImport,
  packagePublicRoot: string,
): HousePackage {
  const housePackage = projectBuilderImportToHousePackage(registries, {
    ...BUILDER_RUNTIME_HOUSE_DEFAULTS,
    packagePublicRoot,
  });
  cachedHousePackage = housePackage;
  return housePackage;
}

/**
 * Ensure Builder registries + Runtime HousePackage exist (async).
 * PT-PDM-02 — `packagePublicRoot` comes from Shared Project Runtime (`openProject`).
 * Browser: fetches HP-002 CSVs over HTTP. Tests: use bootstrapBuilderPackageRegistriesSyncForTests.
 */
export async function ensureBuilderPackageBootstrapped(
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
): Promise<BuilderHousePackageImport> {
  const root = packagePublicRoot.replace(/\/+$/, '') || PACKAGE_ROOT_LABEL;
  if (cachedRegistries !== null && cachedPackagePublicRoot === root) {
    return cachedRegistries;
  }
  if (bootstrapPromise !== null && cachedPackagePublicRoot === root) {
    return bootstrapPromise;
  }

  cachedRegistries = null;
  cachedHousePackage = null;
  cachedPackagePublicRoot = root;

  bootstrapPromise = (async () => {
    const texts = await loadBuilderPackageCsvTexts(root);
    await loadFloorPlanGeometryForRooms(texts.roomsCsv, root);
    const registries = buildRegistriesFromTexts(texts, root);
    cachedRegistries = registries;
    projectCachedHousePackage(registries, root);
    logBuilderPackageEvidence(registries, texts);
    return registries;
  })();

  try {
    return await bootstrapPromise;
  } catch (error) {
    bootstrapPromise = null;
    cachedPackagePublicRoot = null;
    throw error;
  }
}

/**
 * Sync access after bootstrap. Throws if ensureBuilderPackageBootstrapped has not completed.
 */
export function getBuilderPackageRegistries(): BuilderHousePackageImport {
  if (cachedRegistries === null) {
    throw new Error(
      'Builder House Package registries are not ready. Await ensureBuilderPackageBootstrapped() first.',
    );
  }
  return cachedRegistries;
}

/**
 * Runtime HousePackage projected from Builder registries (sole Client Studio object SSOT).
 */
export function getBuilderRuntimeHousePackage(): HousePackage {
  if (cachedHousePackage !== null) {
    return cachedHousePackage;
  }
  return projectCachedHousePackage(
    getBuilderPackageRegistries(),
    cachedPackagePublicRoot ?? PACKAGE_ROOT_LABEL,
  );
}

/**
 * Node/unit-test bootstrap — inject CSV texts without HTTP (no Vite public/?raw).
 */
export function bootstrapBuilderPackageRegistriesSyncForTests(
  texts: BuilderPackageCsvTexts,
  geometryByFloor?: Readonly<Record<string, FloorPlanGeometry>>,
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
): BuilderHousePackageImport {
  clearFloorPlanGeometryCache();
  if (geometryByFloor !== undefined) {
    for (const [floorId, geometry] of Object.entries(geometryByFloor)) {
      setFloorPlanGeometryForFloor(floorId, geometry);
    }
  }
  const root = packagePublicRoot.replace(/\/+$/, '') || PACKAGE_ROOT_LABEL;
  cachedPackagePublicRoot = root;
  const registries = buildRegistriesFromTexts(texts, root);
  cachedRegistries = registries;
  bootstrapPromise = Promise.resolve(registries);
  projectCachedHousePackage(registries, root);
  logBuilderPackageEvidence(registries, texts);
  return registries;
}

/** Test helper — clear memoized registries. */
export function resetBuilderPackageBootstrapForTests(): void {
  cachedRegistries = null;
  cachedHousePackage = null;
  cachedPackagePublicRoot = null;
  bootstrapPromise = null;
  clearFloorPlanGeometryCache();
}
