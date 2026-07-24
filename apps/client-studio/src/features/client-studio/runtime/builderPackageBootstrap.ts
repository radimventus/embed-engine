import {
  buildBuilderPackageRegistries,
  parseCsv,
  type BuilderHousePackageImport,
} from '@embed-engine/object-house/builder-package';

import { galleryCsv, roomsCsv, videosCsv } from '@client-studio/builder-package-csv';
import { projectRegistriesToResolvedPackage } from './projectRegistriesToResolvedPackage';
import {
  evidenceLog,
  fingerprintText,
  firstLast,
  isRuntimeEvidenceEnabled,
} from './runtimeEvidence';

const PACKAGE_ROOT_LABEL = '/house-package';
const HERO_PATH = 'media/hero/hero.webp';

const GALLERY_CSV_PATH = '/house-package/gallery.csv';
const ROOMS_CSV_PATH = '/house-package/rooms.csv';
const VIDEOS_CSV_PATH = '/house-package/videos.csv';
const HERO_PUBLIC_PATH = '/house-package/media/hero/hero.webp';

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

function logBuilderPackageEvidence(registries: BuilderHousePackageImport): void {
  if (!isRuntimeEvidenceEnabled()) {
    return;
  }

  const galleryFp = fingerprintText(galleryCsv);
  const galleryEntries = registries.gallery.entries;

  evidenceLog('1.BuilderPackage', {
    packageRoot: PACKAGE_ROOT_LABEL,
    galleryCsvPath: GALLERY_CSV_PATH,
    roomsCsvPath: ROOMS_CSV_PATH,
    videosCsvPath: VIDEOS_CSV_PATH,
    heroPath: HERO_PUBLIC_PATH,
    galleryCsvSource:
      'bundled via @client-studio/builder-package-csv (?raw / fs at bootstrap) — NOT a live Network fetch',
    galleryCsvFingerprint: galleryFp,
    galleryItemCount: galleryEntries.length,
    galleryFirst: galleryEntries[0] ?? null,
    galleryLast: galleryEntries[galleryEntries.length - 1] ?? null,
    roomsCsvFingerprint: fingerprintText(roomsCsv),
    videosCsvFingerprint: fingerprintText(videosCsv),
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
    usesManifestJson: false,
    manifestImportInPresentationAssets: false,
    csvLoadMode: 'module-inlined-at-bundle-or-node-read',
    note:
      'Editing public/house-package/gallery.csv does not change Runtime until Vite rebuild/HMR refreshes the inlined CSV module.',
  });

  if (typeof window !== 'undefined') {
    void fetch(GALLERY_CSV_PATH, { cache: 'no-store' })
      .then(async (response) => {
        const diskText = response.ok ? await response.text() : null;
        const diskFp = diskText !== null ? fingerprintText(diskText) : null;
        evidenceLog('1.BuilderPackage.networkCompare', {
          fetchedUrl: GALLERY_CSV_PATH,
          httpStatus: response.status,
          bundledFingerprint: galleryFp,
          fetchedFingerprint: diskFp,
          fingerprintsMatch: diskFp === galleryFp,
          breakIfMismatch:
            diskFp !== null && diskFp !== galleryFp
              ? 'PŘERUŠENÍ TOKU: disk gallery.csv ≠ bundled galleryCsv used by Runtime'
              : null,
        });
      })
      .catch((error: unknown) => {
        evidenceLog('1.BuilderPackage.networkCompare', {
          fetchedUrl: GALLERY_CSV_PATH,
          error: String(error),
        });
      });
  }
}

let cachedRegistries: BuilderHousePackageImport | null = null;

/**
 * Bootstrap Runtime registries from Builder House Package CSVs (HP-002).
 * Runs at first access — sole media SSOT for Client Studio.
 */
export function bootstrapBuilderPackageRegistries(): BuilderHousePackageImport {
  if (cachedRegistries !== null) {
    return cachedRegistries;
  }

  const result = buildBuilderPackageRegistries({
    packageRoot: PACKAGE_ROOT_LABEL,
    galleryCsv,
    roomsCsv,
    videosCsv,
    heroPath: HERO_PATH,
    planPairs: planPairsFromRooms(roomsCsv),
  });

  if (!result.ok) {
    const detail = result.errors.map((error) => `${error.code}: ${error.message}`).join('; ');
    throw new Error(`Builder House Package bootstrap failed: ${detail}`);
  }

  cachedRegistries = result.result;
  logBuilderPackageEvidence(cachedRegistries);
  return cachedRegistries;
}

export function getBuilderPackageRegistries(): BuilderHousePackageImport {
  return bootstrapBuilderPackageRegistries();
}

export function getBuilderResolvedPackage() {
  return projectRegistriesToResolvedPackage(getBuilderPackageRegistries());
}

/** Test helper — clear memoized registries. */
export function resetBuilderPackageBootstrapForTests(): void {
  cachedRegistries = null;
}
