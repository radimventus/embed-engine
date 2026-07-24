/**
 * Builder → HousePackage helpers for unit tests and offline projection.
 *
 * Production Embed no longer calls these (PT-EMBED-RUNTIME-INTEGRATION-01).
 * Live Runtime is created only inside Client Studio Provider via
 * `ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`.
 */

import {
  buildBuilderPackageRegistries,
  parseCsv,
  projectBuilderImportToHousePackage,
  type BuilderHousePackageProjectionOptions,
  type BuilderPackageSources,
} from "@embed-engine/object-house/builder-package";
import type { HousePackage } from "@embed-engine/object-house";

/** Pilot Object Package id (canonical Gen1 identity after Builder import). */
export const DEFAULT_OBJECT_ID = "house-modern-01";

const BUILDER_RUNTIME_DEFAULTS: Omit<
  BuilderHousePackageProjectionOptions,
  "packagePublicRoot"
> = Object.freeze({
  identity: Object.freeze({
    id: DEFAULT_OBJECT_ID,
    title: "Modern 01",
    reference: "ASTAV-M01",
  }),
  overview: Object.freeze({
    price: 6_900_000,
    usableArea: 142,
    landArea: 620,
    hasGarden: true,
  }),
  location: Object.freeze({
    city: "Praha",
    district: "Západ",
  }),
  metadata: Object.freeze({
    energyClass: "B",
    construction: "Zděná",
  }),
});

function planPairsFromRooms(roomsCsvText: string): BuilderPackageSources["planPairs"] {
  const table = parseCsv(roomsCsvText);
  const floors = new Set<string>();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) {
      floors.add(floor);
    }
  }
  return [...floors]
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((floorId) => ({
      floorId,
      rasterRelativePath: `media/plans/${floorId}.webp`,
      svgRelativePath: `media/plans/${floorId}.svg`,
    }));
}

function resolveAssetUrl(assetBase: string | undefined, absolutePath: string): string {
  if (assetBase === undefined || assetBase.length === 0) {
    return absolutePath;
  }
  if (absolutePath.startsWith("/")) {
    return `${assetBase.replace(/\/+$/, "")}${absolutePath}`;
  }
  return absolutePath;
}

async function fetchCsvText(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load Builder Package CSV ${url}: HTTP ${response.status}`);
  }
  return response.text();
}

export type BuilderCsvTexts = {
  readonly galleryCsv: string;
  readonly roomsCsv: string;
  readonly videosCsv: string;
};

/**
 * Pure projection: CSV texts → Runtime HousePackage (no I/O).
 */
export function projectRuntimeHousePackageFromCsvTexts(
  texts: BuilderCsvTexts,
  objectId: string = DEFAULT_OBJECT_ID,
): HousePackage {
  if (objectId !== DEFAULT_OBJECT_ID) {
    throw new Error(
      `Embed.mount: unknown objectId "${objectId}". Known: ${DEFAULT_OBJECT_ID}`,
    );
  }

  const built = buildBuilderPackageRegistries({
    packageRoot: "/house-package",
    galleryCsv: texts.galleryCsv,
    roomsCsv: texts.roomsCsv,
    videosCsv: texts.videosCsv,
    heroPath: "media/hero/hero.webp",
    planPairs: planPairsFromRooms(texts.roomsCsv),
  });

  if (!built.ok) {
    const detail = built.errors.map((error) => `${error.code}: ${error.message}`).join("; ");
    throw new Error(`Embed.mount: Builder House Package import failed: ${detail}`);
  }

  return projectBuilderImportToHousePackage(built.result, {
    ...BUILDER_RUNTIME_DEFAULTS,
    packagePublicRoot: "/house-package",
  });
}

/**
 * Load HP-002 CSVs and project Runtime HousePackage.
 */
export async function resolveBuilderHousePackage(options?: {
  readonly objectId?: string;
  readonly assetBase?: string;
}): Promise<HousePackage> {
  const objectId =
    options?.objectId === undefined || options.objectId.trim().length === 0
      ? DEFAULT_OBJECT_ID
      : options.objectId.trim();

  if (objectId !== DEFAULT_OBJECT_ID) {
    throw new Error(
      `Embed.mount: unknown objectId "${objectId}". Known: ${DEFAULT_OBJECT_ID}`,
    );
  }

  const assetBase = options?.assetBase;
  const [galleryCsv, roomsCsv, videosCsv] = await Promise.all([
    fetchCsvText(resolveAssetUrl(assetBase, "/house-package/gallery.csv")),
    fetchCsvText(resolveAssetUrl(assetBase, "/house-package/rooms.csv")),
    fetchCsvText(resolveAssetUrl(assetBase, "/house-package/videos.csv")),
  ]);

  return projectRuntimeHousePackageFromCsvTexts(
    { galleryCsv, roomsCsv, videosCsv },
    objectId,
  );
}
