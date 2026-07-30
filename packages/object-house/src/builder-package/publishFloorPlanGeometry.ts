/**
 * HP-003 Node publish: author.svg → geometry.json (+ optional raster).
 */

import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { extractFloorPlanGeometryFromSvg } from "./extractFloorPlanGeometry";
import {
  authorSvgRelativePath,
  geometryRelativePath,
  type FloorPlanGeometry,
} from "./floorPlanGeometry";
import { parseCsv } from "./parse-csv";
import {
  validateFloorPlanGeometryAgainstRooms,
  type Hp003ValidationError,
} from "./validateFloorPlanGeometry";
import type { RoomCsvRow } from "./types";

export type PublishFloorPlanGeometryOptions = {
  readonly packageRoot: string;
  readonly floorId: string;
  /** When true, rasterize author SVG to pN.webp via @resvg/resvg-js + sharp. */
  readonly writeRaster?: boolean;
  /** Keep existing raster when present and sized; only write geometry. Default true. */
  readonly keepExistingRaster?: boolean;
};

export type PublishFloorPlanGeometryResult =
  | {
      readonly ok: true;
      readonly geometry: FloorPlanGeometry;
      readonly geometryPath: string;
      readonly rasterPath: string | null;
      readonly warnings: readonly string[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly (Hp003ValidationError | { code: string; message: string; path?: string })[];
    };

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseRoomsCsv(roomsCsv: string): RoomCsvRow[] {
  const table = parseCsv(roomsCsv);
  const rows: RoomCsvRow[] = [];
  for (const row of table.rows) {
    const floor = row.floor?.trim() ?? "";
    const room = row.room?.trim() ?? "";
    const name = row.name?.trim() ?? "";
    const areaRaw = (row.area ?? "0").replace(",", ".");
    const area = Number(areaRaw);
    if (!floor || !room) {
      continue;
    }
    rows.push({
      floor,
      room,
      name,
      area: Number.isFinite(area) ? area : 0,
    });
  }
  return rows;
}

async function readRasterSize(
  filePath: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(filePath).metadata();
    if (
      typeof meta.width === "number" &&
      typeof meta.height === "number" &&
      meta.width > 0 &&
      meta.height > 0
    ) {
      return { width: meta.width, height: meta.height };
    }
  } catch {
    return null;
  }
  return null;
}

async function rasterizeAuthorSvg(
  svgText: string,
  outWebpPath: string,
  viewBox: { width: number; height: number },
): Promise<void> {
  const { Resvg } = await import("@resvg/resvg-js");
  const sharp = (await import("sharp")).default;
  const resvg = new Resvg(svgText, {
    fitTo: { mode: "width", value: viewBox.width },
  });
  const png = resvg.render().asPng();
  await sharp(png)
    .resize(viewBox.width, viewBox.height, { fit: "fill" })
    .webp({ quality: 90 })
    .toFile(outWebpPath);
}

/**
 * Resolve authoring SVG path for a floor (prefer pN.author.svg).
 */
export async function resolveAuthorSvgPath(
  packageRoot: string,
  floorId: string,
): Promise<string | null> {
  const authorPath = path.join(packageRoot, authorSvgRelativePath(floorId));
  if (await exists(authorPath)) {
    return authorPath;
  }
  const legacyPath = path.join(packageRoot, "media", "plans", `${floorId}.svg`);
  if (await exists(legacyPath)) {
    return legacyPath;
  }
  return null;
}

/**
 * Publish HP-003 geometry (and optionally raster) for one floor.
 */
export async function publishFloorPlanGeometry(
  options: PublishFloorPlanGeometryOptions,
): Promise<PublishFloorPlanGeometryResult> {
  const {
    packageRoot,
    floorId,
    writeRaster = false,
    keepExistingRaster = true,
  } = options;
  const warnings: string[] = [];
  const authorPath = await resolveAuthorSvgPath(packageRoot, floorId);
  if (authorPath === null) {
    return {
      ok: false,
      errors: [
        {
          code: "HP003_SVG_MISSING",
          message: `Missing ${authorSvgRelativePath(floorId)} (or legacy ${floorId}.svg).`,
          path: `media/plans/${floorId}`,
        },
      ],
    };
  }

  const svgText = await readFile(authorPath, "utf8");
  const extracted = extractFloorPlanGeometryFromSvg(svgText, floorId);
  if (!extracted.ok) {
    return { ok: false, errors: [...extracted.errors] };
  }

  const roomsCsvPath = path.join(packageRoot, "rooms.csv");
  if (!(await exists(roomsCsvPath))) {
    return {
      ok: false,
      errors: [
        {
          code: "BP_MISSING_FILE",
          message: "Missing rooms.csv",
          path: "rooms.csv",
        },
      ],
    };
  }
  const rooms = parseRoomsCsv(await readFile(roomsCsvPath, "utf8"));

  const webpPath = path.join(packageRoot, "media", "plans", `${floorId}.webp`);
  const pngPath = path.join(packageRoot, "media", "plans", `${floorId}.png`);
  let rasterSize: { width: number; height: number } | null = null;
  if (await exists(webpPath)) {
    rasterSize = await readRasterSize(webpPath);
  } else if (await exists(pngPath)) {
    rasterSize = await readRasterSize(pngPath);
  }

  const validation = validateFloorPlanGeometryAgainstRooms({
    geometry: extracted.geometry,
    rooms,
    rasterSize: rasterSize ?? undefined,
  });
  // Allow missing raster during first geometry-only publish; viewBox mismatch still fails when raster exists.
  if (validation.length > 0) {
    return { ok: false, errors: [...validation] };
  }

  const geometryPath = path.join(packageRoot, geometryRelativePath(floorId));
  await writeFile(
    geometryPath,
    `${JSON.stringify(extracted.geometry, null, 2)}\n`,
    "utf8",
  );

  let rasterOut: string | null = null;
  const shouldRasterize =
    writeRaster || (!(await exists(webpPath)) && !(await exists(pngPath)));

  if (shouldRasterize) {
    await rasterizeAuthorSvg(svgText, webpPath, extracted.geometry.viewBox);
    rasterOut = webpPath;
  } else if (keepExistingRaster) {
    warnings.push(
      `Kept existing raster for ${floorId}; geometry published from author SVG.`,
    );
    rasterOut = (await exists(webpPath)) ? webpPath : pngPath;
  }

  return {
    ok: true,
    geometry: extracted.geometry,
    geometryPath,
    rasterPath: rasterOut,
    warnings,
  };
}

/**
 * Publish geometry for every floor referenced in rooms.csv.
 */
export async function publishAllFloorPlanGeometry(
  packageRoot: string,
  options?: { readonly writeRaster?: boolean },
): Promise<PublishFloorPlanGeometryResult[]> {
  const roomsCsv = await readFile(path.join(packageRoot, "rooms.csv"), "utf8");
  const floors = new Set(
    parseRoomsCsv(roomsCsv).map((r) => r.floor).filter(Boolean),
  );
  const results: PublishFloorPlanGeometryResult[] = [];
  for (const floorId of [...floors].sort()) {
    results.push(
      await publishFloorPlanGeometry({
        packageRoot,
        floorId,
        writeRaster: options?.writeRaster,
      }),
    );
  }
  return results;
}
