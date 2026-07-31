/**
 * CAP-BLD-02 — Mount HP-002 via @embed-engine/object-house only.
 * No custom CSV parser. No Builder content package. Read-only load.
 */

import {
  buildBuilderPackageRegistries,
  isFloorPlanGeometry,
  type BuilderHousePackageImport,
  type BuilderPackageImportError,
  type FloorPlanGeometry,
} from '@embed-engine/object-house/builder-package';

import {
  HOUSE_PACKAGE_CSV,
  HOUSE_PACKAGE_DISK_ROOT,
  HOUSE_PACKAGE_HERO_CANDIDATES,
  HOUSE_PACKAGE_MANIFEST_URL,
  HOUSE_PACKAGE_URL_ROOT,
} from './housePackagePaths';
import { planPairsFromRooms } from './validateHousePackageWorking';

export type HousePackageMountTexts = {
  readonly galleryCsv: string;
  readonly roomsCsv: string;
  readonly videosCsv: string;
  readonly manifestJson: string | null;
};

/**
 * Mount snapshot — holds the loaded HP-002 import from object-house.
 * Not a parallel content model: registries are HP import outputs.
 */
export type HousePackageMount = {
  readonly packageRootLabel: typeof HOUSE_PACKAGE_URL_ROOT;
  readonly canonicalDiskRoot: typeof HOUSE_PACKAGE_DISK_ROOT;
  readonly ok: boolean;
  readonly errors: readonly BuilderPackageImportError[];
  readonly texts: HousePackageMountTexts;
  readonly heroRelativePath: string;
  readonly builderImport: BuilderHousePackageImport | null;
  readonly geometryByFloor: Readonly<
    Record<string, FloorPlanGeometry | 'missing' | 'invalid'>
  >;
  readonly mountedAt: string;
};

export type MountHousePackageOptions = {
  readonly fetchText?: (url: string) => Promise<string>;
  readonly probeExists?: (url: string) => Promise<boolean>;
  readonly now?: () => Date;
};

async function defaultFetchText(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
  }
  return response.text();
}

async function defaultProbeExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { cache: 'no-store', method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

async function resolveHeroPath(
  probeExists: (url: string) => Promise<boolean>,
): Promise<string> {
  for (const relative of HOUSE_PACKAGE_HERO_CANDIDATES) {
    const exists = await probeExists(`${HOUSE_PACKAGE_URL_ROOT}/${relative}`);
    if (exists) {
      return relative;
    }
  }
  return HOUSE_PACKAGE_HERO_CANDIDATES[0];
}

async function loadGeometryByFloor(
  floorIds: readonly string[],
  fetchText: (url: string) => Promise<string>,
): Promise<
  Record<string, FloorPlanGeometry | 'missing' | 'invalid'>
> {
  const entries = await Promise.all(
    floorIds.map(async (floorId) => {
      const url = `${HOUSE_PACKAGE_URL_ROOT}/media/plans/${floorId}.geometry.json`;
      try {
        const text = await fetchText(url);
        const parsed: unknown = JSON.parse(text);
        if (!isFloorPlanGeometry(parsed)) {
          return [floorId, 'invalid'] as const;
        }
        return [floorId, parsed] as const;
      } catch {
        return [floorId, 'missing'] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

/**
 * Mount the canonical HP-002 tree (HTTP) using object-house registries.
 */
export async function mountHousePackage(
  options: MountHousePackageOptions = {},
): Promise<HousePackageMount> {
  const fetchText = options.fetchText ?? defaultFetchText;
  const probeExists = options.probeExists ?? defaultProbeExists;
  const now = options.now ?? (() => new Date());

  const [galleryCsv, roomsCsv, videosCsv, manifestJson, heroRelativePath] =
    await Promise.all([
      fetchText(HOUSE_PACKAGE_CSV.gallery),
      fetchText(HOUSE_PACKAGE_CSV.rooms),
      fetchText(HOUSE_PACKAGE_CSV.videos),
      fetchText(HOUSE_PACKAGE_MANIFEST_URL).catch(() => null),
      resolveHeroPath(probeExists),
    ]);

  const planPairs = planPairsFromRooms(roomsCsv);
  const registryResult = buildBuilderPackageRegistries({
    packageRoot: HOUSE_PACKAGE_URL_ROOT,
    galleryCsv,
    roomsCsv,
    videosCsv,
    heroPath: heroRelativePath,
    planPairs,
  });

  const floorIds = planPairs.map((pair) => pair.floorId);
  const geometryByFloor = await loadGeometryByFloor(floorIds, fetchText);

  if (!registryResult.ok) {
    return {
      packageRootLabel: HOUSE_PACKAGE_URL_ROOT,
      canonicalDiskRoot: HOUSE_PACKAGE_DISK_ROOT,
      ok: false,
      errors: registryResult.errors,
      texts: { galleryCsv, roomsCsv, videosCsv, manifestJson },
      heroRelativePath,
      builderImport: null,
      geometryByFloor,
      mountedAt: now().toISOString(),
    };
  }

  return {
    packageRootLabel: HOUSE_PACKAGE_URL_ROOT,
    canonicalDiskRoot: HOUSE_PACKAGE_DISK_ROOT,
    ok: true,
    errors: [],
    texts: { galleryCsv, roomsCsv, videosCsv, manifestJson },
    heroRelativePath,
    builderImport: registryResult.result,
    geometryByFloor,
    mountedAt: now().toISOString(),
  };
}
