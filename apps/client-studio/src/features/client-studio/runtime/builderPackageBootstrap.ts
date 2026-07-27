import {
  buildBuilderPackageRegistries,
  parseCsv,
  projectBuilderImportToHousePackage,
  type BuilderHousePackageImport,
} from '@embed-engine/object-house/builder-package';
import type { HousePackage } from '@embed-engine/object-house';

import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from './builderRuntimeHouseDefaults';
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

async function fetchCsvText(absolutePath: string): Promise<string> {
  const url = resolvePackageUrl(absolutePath);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      `Failed to load Builder Package CSV ${url}: HTTP ${response.status}`,
    );
  }
  return response.text();
}

/**
 * Vite 7–compatible loader: HTTP fetch of public HP-002 CSVs (no public/?raw imports).
 */
export async function loadBuilderPackageCsvTexts(): Promise<BuilderPackageCsvTexts> {
  const [galleryCsv, roomsCsv, videosCsv] = await Promise.all([
    fetchCsvText(GALLERY_CSV_PATH),
    fetchCsvText(ROOMS_CSV_PATH),
    fetchCsvText(VIDEOS_CSV_PATH),
  ]);
  return { galleryCsv, roomsCsv, videosCsv };
}

function buildRegistriesFromTexts(
  texts: BuilderPackageCsvTexts,
): BuilderHousePackageImport {
  const result = buildBuilderPackageRegistries({
    packageRoot: PACKAGE_ROOT_LABEL,
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
let bootstrapPromise: Promise<BuilderHousePackageImport> | null = null;

function projectCachedHousePackage(
  registries: BuilderHousePackageImport,
): HousePackage {
  const housePackage = projectBuilderImportToHousePackage(registries, {
    ...BUILDER_RUNTIME_HOUSE_DEFAULTS,
    packagePublicRoot: '/house-package',
  });
  cachedHousePackage = housePackage;
  return housePackage;
}

/**
 * Ensure Builder registries + Runtime HousePackage exist (async).
 * Browser: fetches HP-002 CSVs over HTTP. Tests: use bootstrapBuilderPackageRegistriesSyncForTests.
 */
export async function ensureBuilderPackageBootstrapped(): Promise<BuilderHousePackageImport> {
  if (cachedRegistries !== null) {
    return cachedRegistries;
  }
  if (bootstrapPromise !== null) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    const texts = await loadBuilderPackageCsvTexts();
    const registries = buildRegistriesFromTexts(texts);
    cachedRegistries = registries;
    projectCachedHousePackage(registries);
    logBuilderPackageEvidence(registries, texts);
    return registries;
  })();

  try {
    return await bootstrapPromise;
  } catch (error) {
    bootstrapPromise = null;
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
  return projectCachedHousePackage(getBuilderPackageRegistries());
}

/**
 * Node/unit-test bootstrap — inject CSV texts without HTTP (no Vite public/?raw).
 */
export function bootstrapBuilderPackageRegistriesSyncForTests(
  texts: BuilderPackageCsvTexts,
): BuilderHousePackageImport {
  const registries = buildRegistriesFromTexts(texts);
  cachedRegistries = registries;
  bootstrapPromise = Promise.resolve(registries);
  projectCachedHousePackage(registries);
  logBuilderPackageEvidence(registries, texts);
  return registries;
}

/** Test helper — clear memoized registries. */
export function resetBuilderPackageBootstrapForTests(): void {
  cachedRegistries = null;
  cachedHousePackage = null;
  bootstrapPromise = null;
}
