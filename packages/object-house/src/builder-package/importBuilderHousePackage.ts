import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  buildBuilderPackageRegistries,
  type BuilderPackageValidationMode,
} from "./buildRegistries";
import {
  bpError,
  type BuilderPackageImportError,
  type BuilderPackageImportResult,
} from "./errors";
import { extractFloorPlanGeometryFromSvg } from "./extractFloorPlanGeometry";
import { isFloorPlanGeometry } from "./floorPlanGeometry";
import { parseCsv, parseNonNegativeNumber } from "./parse-csv";
import { validateFloorPlanGeometryAgainstRooms } from "./validateFloorPlanGeometry";
import type { RoomCsvRow } from "./types";

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readUtf8(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

function packageRelative(packageRoot: string, absolutePath: string): string {
  return path.relative(packageRoot, absolutePath).split(path.sep).join("/");
}

async function discoverPlanPairs(
  packageRoot: string,
  errors: BuilderPackageImportError[],
  validationMode: BuilderPackageValidationMode,
): Promise<
  readonly {
    readonly floorId: string;
    readonly rasterRelativePath: string;
    readonly svgRelativePath: string;
    readonly authorSvgRelativePath: string | null;
    readonly geometryRelativePath: string | null;
  }[]
> {
  const plansDir = path.join(packageRoot, "media", "plans");
  if (!(await pathExists(plansDir))) {
    if (validationMode === "PUBLISH_READY") {
      errors.push(
        bpError(
          "BP_MISSING_FILE",
          "Missing media/plans/ directory.",
          "media/plans/",
        ),
      );
    }
    return [];
  }

  const names = await readdir(plansDir);
  const basenames = new Set<string>();

  for (const name of names) {
    const authorMatch = /^(p\d+)\.author\.svg$/i.exec(name);
    if (authorMatch) {
      basenames.add(authorMatch[1]!.toLowerCase());
      continue;
    }
    const match = /^(p\d+)\.(png|webp|svg|geometry\.json)$/i.exec(name);
    if (!match) {
      continue;
    }
    basenames.add(match[1]!.toLowerCase());
  }

  const floors = [...basenames].sort((a, b) => a.localeCompare(b, "en"));
  const pairs = [];

  for (const floorId of floors) {
    const authorName = `${floorId}.author.svg`;
    const svgName = `${floorId}.svg`;
    const authorPath = path.join(plansDir, authorName);
    const svgPath = path.join(plansDir, svgName);
    const webpPath = path.join(plansDir, `${floorId}.webp`);
    const pngPath = path.join(plansDir, `${floorId}.png`);
    const geometryPath = path.join(plansDir, `${floorId}.geometry.json`);

    const hasAuthor = await pathExists(authorPath);
    const hasSvg = await pathExists(svgPath);
    const hasWebp = await pathExists(webpPath);
    const hasPng = await pathExists(pngPath);
    const hasGeometry = await pathExists(geometryPath);

    if (!hasAuthor && !hasSvg) {
      errors.push(
        bpError(
          "HP003_SVG_MISSING",
          `Floor ${floorId} requires ${floorId}.author.svg (or legacy ${floorId}.svg).`,
          `media/plans/${floorId}`,
        ),
      );
      continue;
    }

    if (!hasWebp && !hasPng) {
      errors.push(
        bpError(
          "BP_PLAN_INCOMPLETE",
          `Floor ${floorId} requires ${floorId}.webp (or .png).`,
          `media/plans/${floorId}`,
        ),
      );
      continue;
    }

    if (!hasGeometry) {
      errors.push(
        bpError(
          "HP003_GEOMETRY_MISSING",
          `Floor ${floorId} requires ${floorId}.geometry.json (run publish-floorplan-geometry).`,
          `media/plans/${floorId}.geometry.json`,
        ),
      );
      continue;
    }

    const rasterAbsolute = hasWebp ? webpPath : pngPath;
    const svgAbsolute = hasAuthor ? authorPath : svgPath;
    pairs.push({
      floorId,
      rasterRelativePath: packageRelative(packageRoot, rasterAbsolute),
      svgRelativePath: packageRelative(packageRoot, hasSvg ? svgPath : svgAbsolute),
      authorSvgRelativePath: hasAuthor
        ? packageRelative(packageRoot, authorPath)
        : null,
      geometryRelativePath: packageRelative(packageRoot, geometryPath),
    });
  }

  return pairs;
}

async function collectExistingPaths(packageRoot: string): Promise<Set<string>> {
  const existing = new Set<string>();
  const queue = [packageRoot];

  while (queue.length > 0) {
    const current = queue.pop()!;
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolute);
        continue;
      }
      existing.add(packageRelative(packageRoot, absolute));
    }
  }

  return existing;
}

async function resolveHeroPath(
  packageRoot: string,
  errors: BuilderPackageImportError[],
  validationMode: BuilderPackageValidationMode,
): Promise<string | undefined> {
  const heroDir = path.join(packageRoot, "media", "hero");
  const preferredPng = path.join(heroDir, "hero.png");
  if (await pathExists(preferredPng)) {
    return packageRelative(packageRoot, preferredPng);
  }

  const preferredWebp = path.join(heroDir, "hero.webp");
  if (await pathExists(preferredWebp)) {
    return packageRelative(packageRoot, preferredWebp);
  }

  if (!(await pathExists(heroDir))) {
    if (validationMode === "PUBLISH_READY") {
      errors.push(
        bpError(
          "BP_MISSING_FILE",
          "Missing media/hero/ directory.",
          "media/hero/",
        ),
      );
    }
    return undefined;
  }

  const names = await readdir(heroDir);
  const media = names.find((name) => /\.(webp|jpg|jpeg|png|mp4|webm)$/i.test(name));
  if (media === undefined) {
    if (validationMode === "PUBLISH_READY") {
      errors.push(
        bpError(
          "BP_ASSET_MISSING",
          "No Hero media file under media/hero/.",
          "media/hero/",
        ),
      );
    }
    return undefined;
  }

  return packageRelative(packageRoot, path.join(heroDir, media));
}

/**
 * Import an HP-002 Builder House Package from disk and generate Runtime registries.
 * Does not write files — returns in-memory registries for callers to persist.
 */
export async function importBuilderHousePackage(
  packageRoot: string,
  options: {
    readonly validationMode?: BuilderPackageValidationMode;
  } = {},
): Promise<BuilderPackageImportResult> {
  const root = path.resolve(packageRoot);
  const errors: BuilderPackageImportError[] = [];
  const validationMode = options.validationMode ?? "PUBLISH_READY";

  const roomsCsvPath = path.join(root, "rooms.csv");
  const galleryCsvPath = path.join(root, "gallery.csv");
  const videosCsvPath = path.join(root, "videos.csv");

  for (const [absolute, relative] of [
    [roomsCsvPath, "rooms.csv"],
    [galleryCsvPath, "gallery.csv"],
    [videosCsvPath, "videos.csv"],
  ] as const) {
    if (!(await pathExists(absolute))) {
      errors.push(bpError("BP_MISSING_FILE", `Missing required file: ${relative}`, relative));
    }
  }

  const roomsText = await readUtf8(roomsCsvPath);
  const galleryText = await readUtf8(galleryCsvPath);
  const videosText = await readUtf8(videosCsvPath);
  const heroPath = await resolveHeroPath(root, errors, validationMode);
  const planPairs = await discoverPlanPairs(root, errors, validationMode);

  if (
    errors.length > 0 ||
    !roomsText ||
    !galleryText ||
    !videosText ||
    (validationMode === "PUBLISH_READY" && heroPath === undefined)
  ) {
    if (!roomsText || !galleryText || !videosText) {
      errors.push(bpError("BP_MISSING_FILE", "Failed to read one or more required CSV files."));
    }
    return { ok: false, errors };
  }

  const existingRelativePaths = await collectExistingPaths(root);

  const registries = buildBuilderPackageRegistries({
    packageRoot: root,
    validationMode,
    galleryCsv: galleryText,
    roomsCsv: roomsText,
    videosCsv: videosText,
    heroPath,
    planPairs: planPairs.map((pair) => ({
      floorId: pair.floorId,
      rasterRelativePath: pair.rasterRelativePath,
      svgRelativePath: pair.authorSvgRelativePath ?? pair.svgRelativePath,
    })),
    existingRelativePaths,
  });

  if (!registries.ok) {
    return registries;
  }

  // HP-003: validate authoring SVG ↔ geometry.json ↔ rooms.csv
  const roomRows: RoomCsvRow[] = [];
  const roomsTable = parseCsv(roomsText);
  for (const row of roomsTable.rows) {
    const floor = row.floor?.trim() ?? "";
    const room = row.room?.trim() ?? "";
    const name = row.name?.trim() ?? "";
    const areaParsed = parseNonNegativeNumber(row.area ?? "0", "area", "rooms.csv");
    if (!floor || !room || typeof areaParsed === "string") {
      continue;
    }
    roomRows.push({ floor, room, name, area: areaParsed });
  }

  const hp003Errors: BuilderPackageImportError[] = [];
  for (const pair of planPairs) {
    const authorRel = pair.authorSvgRelativePath ?? pair.svgRelativePath;
    const authorAbs = path.join(root, authorRel);
    const svgText = await readUtf8(authorAbs);
    if (svgText === undefined) {
      hp003Errors.push(
        bpError("HP003_SVG_MISSING", `Cannot read authoring SVG for ${pair.floorId}.`, authorRel),
      );
      continue;
    }
    const extracted = extractFloorPlanGeometryFromSvg(svgText, pair.floorId);
    if (!extracted.ok) {
      for (const err of extracted.errors) {
        hp003Errors.push(bpError(err.code, err.message, authorRel));
      }
      continue;
    }
    const geometryAbs = path.join(root, "media", "plans", `${pair.floorId}.geometry.json`);
    const geometryText = await readUtf8(geometryAbs);
    if (geometryText === undefined) {
      hp003Errors.push(
        bpError(
          "HP003_GEOMETRY_MISSING",
          `Missing ${pair.floorId}.geometry.json`,
          `media/plans/${pair.floorId}.geometry.json`,
        ),
      );
      continue;
    }
    let published: unknown;
    try {
      published = JSON.parse(geometryText);
    } catch {
      hp003Errors.push(
        bpError(
          "HP003_GEOMETRY_MISSING",
          `Invalid JSON in ${pair.floorId}.geometry.json`,
          `media/plans/${pair.floorId}.geometry.json`,
        ),
      );
      continue;
    }
    if (!isFloorPlanGeometry(published)) {
      hp003Errors.push(
        bpError(
          "HP003_GEOMETRY_MISSING",
          `Invalid HP-003 schema in ${pair.floorId}.geometry.json`,
          `media/plans/${pair.floorId}.geometry.json`,
        ),
      );
      continue;
    }
    for (const err of validateFloorPlanGeometryAgainstRooms({
      geometry: extracted.geometry,
      rooms: roomRows,
    })) {
      hp003Errors.push(bpError(err.code, err.message, err.path));
    }
    // Published file must match extractor output (room set + viewBox)
    if (
      published.viewBox.width !== extracted.geometry.viewBox.width ||
      published.viewBox.height !== extracted.geometry.viewBox.height ||
      published.rooms.length !== extracted.geometry.rooms.length
    ) {
      hp003Errors.push(
        bpError(
          "HP003_VIEWBOX_MISMATCH",
          `${pair.floorId}.geometry.json is stale — re-run publish-floorplan-geometry.`,
          `media/plans/${pair.floorId}.geometry.json`,
        ),
      );
    }
  }

  if (hp003Errors.length > 0) {
    return { ok: false, errors: hp003Errors };
  }

  return registries;
}
