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
import { readHeroRelativePathFromManifest } from './buildPersistFiles';
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
  /** Repo-relative HP-002 disk root for the active workspace project. */
  readonly canonicalDiskRoot: string;
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
  /** Active workspace project disk root (repo-relative). */
  readonly diskRoot?: string;
  /** Draft packages may omit hero and floor-plan content until authored. */
  readonly validationMode?: HousePackageMountValidationMode;
  /** Abort in-flight HTTP when workspace switches (PR-003B). */
  readonly signal?: AbortSignal;
};

export type HousePackageMountValidationMode =
  | 'AUTHORING_DRAFT'
  | 'PUBLISH_READY';

function createFetchers(signal?: AbortSignal): {
  readonly fetchText: (url: string) => Promise<string>;
  readonly probeExists: (url: string) => Promise<boolean>;
} {
  return {
    fetchText: async (url: string) => {
      const response = await fetch(url, { cache: 'no-store', signal });
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
      }
      return response.text();
    },
    probeExists: async (url: string) => {
      try {
        const response = await fetch(url, {
          cache: 'no-store',
          method: 'GET',
          signal,
        });
        return response.ok;
      } catch (error: unknown) {
        if (
          (error instanceof DOMException && error.name === 'AbortError') ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          throw error;
        }
        return false;
      }
    },
  };
}

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
): Promise<string | null> {
  for (const relative of HOUSE_PACKAGE_HERO_CANDIDATES) {
    const exists = await probeExists(`${HOUSE_PACKAGE_URL_ROOT}/${relative}`);
    if (exists) {
      return relative;
    }
  }
  return null;
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
  const signal = options.signal;
  if (signal?.aborted) {
    throw new DOMException('Mount aborted', 'AbortError');
  }
  const defaults = signal !== undefined ? createFetchers(signal) : null;
  const fetchText =
    options.fetchText ?? defaults?.fetchText ?? defaultFetchText;
  const probeExists =
    options.probeExists ?? defaults?.probeExists ?? defaultProbeExists;
  const now = options.now ?? (() => new Date());
  const diskRoot = options.diskRoot ?? HOUSE_PACKAGE_DISK_ROOT;
  const validationMode = options.validationMode ?? 'PUBLISH_READY';

  const [galleryCsv, roomsCsv, videosCsv, manifestJson] = await Promise.all([
    fetchText(HOUSE_PACKAGE_CSV.gallery),
    fetchText(HOUSE_PACKAGE_CSV.rooms),
    fetchText(HOUSE_PACKAGE_CSV.videos),
    fetchText(HOUSE_PACKAGE_MANIFEST_URL).catch(() => null),
  ]);

  const manifestHero = readHeroRelativePathFromManifest(manifestJson);
  const heroRelativePath =
    manifestHero !== null &&
    (await probeExists(`${HOUSE_PACKAGE_URL_ROOT}/${manifestHero}`))
      ? manifestHero
      : await resolveHeroPath(probeExists);

  const planPairs = planPairsFromRooms(roomsCsv);
  const registryResult = buildBuilderPackageRegistries({
    packageRoot: HOUSE_PACKAGE_URL_ROOT,
    galleryCsv,
    roomsCsv,
    videosCsv,
    validationMode,
    heroPath: heroRelativePath ?? undefined,
    planPairs,
  });

  const floorIds = planPairs.map((pair) => pair.floorId);
  const geometryByFloor = await loadGeometryByFloor(floorIds, fetchText);

  if (!registryResult.ok) {
    return {
      packageRootLabel: HOUSE_PACKAGE_URL_ROOT,
      canonicalDiskRoot: diskRoot,
      ok: false,
      errors: registryResult.errors,
      texts: { galleryCsv, roomsCsv, videosCsv, manifestJson },
      heroRelativePath: heroRelativePath ?? '',
      builderImport: null,
      geometryByFloor,
      mountedAt: now().toISOString(),
    };
  }

  return {
    packageRootLabel: HOUSE_PACKAGE_URL_ROOT,
    canonicalDiskRoot: diskRoot,
    ok: true,
    errors: [],
    texts: { galleryCsv, roomsCsv, videosCsv, manifestJson },
    heroRelativePath: heroRelativePath ?? '',
    builderImport: registryResult.result,
    geometryByFloor,
    mountedAt: now().toISOString(),
  };
}
