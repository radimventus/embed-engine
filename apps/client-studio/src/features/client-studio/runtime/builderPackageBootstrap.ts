import {
  buildBuilderPackageRegistries,
  parseCsv,
  type BuilderHousePackageImport,
} from '@embed-engine/object-house/builder-package';

import { galleryCsv, roomsCsv, videosCsv } from '@client-studio/builder-package-csv';
import { projectRegistriesToResolvedPackage } from './projectRegistriesToResolvedPackage';

const PACKAGE_ROOT_LABEL = '/house-package';
const HERO_PATH = 'media/hero/hero.webp';

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
