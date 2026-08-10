/**
 * PT-PDM-03 — Load Runtime HousePackage from a Vite-public package root.
 * Shared by Manager (and any Studio) so content follows Shared Project Runtime.
 */

import type { HousePackage } from "../HousePackage";
import { buildBuilderPackageRegistries } from "./buildRegistries";
import { parseCsv } from "./parse-csv";
import {
  projectBuilderImportToHousePackage,
  type BuilderHousePackageProjectionOptions,
} from "./projectToHousePackage";
import type { BuilderPackageSources } from "./buildRegistries";

const DEFAULT_IDENTITY = Object.freeze({
  id: "house-modern-01",
  title: "Modern 01",
  reference: "ASTAV-M01",
});

const DEFAULT_OVERVIEW = Object.freeze({
  price: 6_900_000,
  usableArea: 142,
  landArea: 620,
  hasGarden: true,
});

function planPairsFromRooms(
  roomsCsvText: string,
): BuilderPackageSources["planPairs"] {
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

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `Failed to load House Package asset ${url}: HTTP ${response.status}`,
    );
  }
  return response.text();
}

export type LoadPublicBuilderHousePackageInput = {
  readonly packagePublicRoot: string;
  readonly identity?: BuilderHousePackageProjectionOptions["identity"];
  readonly overview?: BuilderHousePackageProjectionOptions["overview"];
};

/**
 * Fetch HP-002 CSVs from `packagePublicRoot` and project a Runtime HousePackage.
 * Does not load floor-plan geometry (Manager / ops surfaces do not require it).
 */
export async function loadPublicBuilderHousePackage(
  input: LoadPublicBuilderHousePackageInput,
): Promise<HousePackage> {
  const root = input.packagePublicRoot.replace(/\/+$/, "") || "/house-package";
  const [galleryCsv, roomsCsv, videosCsv] = await Promise.all([
    fetchText(`${root}/gallery.csv`),
    fetchText(`${root}/rooms.csv`),
    fetchText(`${root}/videos.csv`),
  ]);

  const built = buildBuilderPackageRegistries({
    packageRoot: root,
    galleryCsv,
    roomsCsv,
    videosCsv,
    heroPath: "media/hero/hero.png",
    planPairs: planPairsFromRooms(roomsCsv),
  });

  if (!built.ok) {
    const detail = built.errors
      .map((error) => `${error.code}: ${error.message}`)
      .join("; ");
    throw new Error(`Public Builder House Package load failed: ${detail}`);
  }

  return projectBuilderImportToHousePackage(built.result, {
    identity: input.identity ?? DEFAULT_IDENTITY,
    overview: input.overview ?? DEFAULT_OVERVIEW,
    location: { city: "Praha", district: "Západ" },
    metadata: { energyClass: "B", construction: "Zděná" },
    packagePublicRoot: root,
  });
}

/**
 * Sync projection for tests — inject CSV texts without HTTP.
 */
export function projectPublicBuilderHousePackageFromCsvTexts(input: {
  readonly packagePublicRoot: string;
  readonly galleryCsv: string;
  readonly roomsCsv: string;
  readonly videosCsv: string;
  readonly identity?: BuilderHousePackageProjectionOptions["identity"];
}): HousePackage {
  const root = input.packagePublicRoot.replace(/\/+$/, "") || "/house-package";
  const built = buildBuilderPackageRegistries({
    packageRoot: root,
    galleryCsv: input.galleryCsv,
    roomsCsv: input.roomsCsv,
    videosCsv: input.videosCsv,
    heroPath: "media/hero/hero.png",
    planPairs: planPairsFromRooms(input.roomsCsv),
  });
  if (!built.ok) {
    const detail = built.errors
      .map((error) => `${error.code}: ${error.message}`)
      .join("; ");
    throw new Error(`Public Builder House Package projection failed: ${detail}`);
  }
  return projectBuilderImportToHousePackage(built.result, {
    identity: input.identity ?? DEFAULT_IDENTITY,
    overview: DEFAULT_OVERVIEW,
    location: { city: "Praha", district: "Západ" },
    metadata: { energyClass: "B", construction: "Zděná" },
    packagePublicRoot: root,
  });
}
