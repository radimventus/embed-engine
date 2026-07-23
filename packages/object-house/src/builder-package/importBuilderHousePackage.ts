import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  bpError,
  type BuilderPackageImportError,
  type BuilderPackageImportResult,
} from "./errors";
import { parseCsv, parsePositiveInt, requireHeaders } from "./parse-csv";
import {
  BUILDER_PACKAGE_FORMAT,
  BUILDER_PACKAGE_SCHEMA_VERSION,
  type BuilderHousePackageImport,
  type FloorRegistry,
  type GalleryCsvRow,
  type GalleryRegistry,
  type HeroCsvRow,
  type HeroRegistry,
  type RoomCsvRow,
  type RoomRegistry,
  type RuntimeManifest,
  type SvgRegistry,
  type VideoCsvRow,
  type VideoRegistry,
} from "./types";

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

async function discoverPlans(
  packageRoot: string,
  errors: BuilderPackageImportError[],
): Promise<FloorRegistry> {
  const plansDir = path.join(packageRoot, "plans");
  if (!(await pathExists(plansDir))) {
    errors.push(bpError("BP_MISSING_FILE", "Missing plans/ directory.", "plans/"));
    return { floors: [] };
  }

  const names = await readdir(plansDir);
  const basenames = new Set<string>();

  for (const name of names) {
    const match = /^(P\d+)\.(png|svg)$/i.exec(name);
    if (!match) {
      continue;
    }
    basenames.add(match[1]!);
  }

  const floors = [...basenames].sort((a, b) => a.localeCompare(b, "en"));
  const entries = [];

  for (const floorId of floors) {
    const pngName = `${floorId}.png`;
    const svgName = `${floorId}.svg`;
    const pngPath = path.join(plansDir, pngName);
    const svgPath = path.join(plansDir, svgName);

    const hasPng = await pathExists(pngPath);
    const hasSvg = await pathExists(svgPath);

    if (!hasPng || !hasSvg) {
      errors.push(
        bpError(
          "BP_PLAN_INCOMPLETE",
          `Floor ${floorId} requires both ${pngName} and ${svgName}.`,
          `plans/${floorId}`,
        ),
      );
      continue;
    }

    entries.push({
      floorId,
      planPng: packageRelative(packageRoot, pngPath),
      planSvg: packageRelative(packageRoot, svgPath),
    });
  }

  return { floors: entries };
}

function parseHeroRows(
  text: string,
  csvPath: string,
  errors: BuilderPackageImportError[],
): HeroCsvRow[] {
  const table = parseCsv(text);
  const headerError = requireHeaders(table, ["file"], csvPath);
  if (headerError) {
    errors.push(bpError("BP_INVALID_CSV", headerError, csvPath));
    return [];
  }

  const rows: HeroCsvRow[] = [];
  for (let i = 0; i < table.rows.length; i += 1) {
    const row = table.rows[i]!;
    const file = row.file ?? "";
    if (!file) {
      errors.push(
        bpError("BP_MISSING_FIELD", 'Missing "file" value.', `${csvPath}:row ${i + 2}`),
      );
      continue;
    }
    const title = row.title?.trim() ? row.title.trim() : undefined;
    rows.push(title === undefined ? { file } : { file, title });
  }

  if (rows.length !== 1) {
    errors.push(
      bpError(
        "BP_INVALID_HERO_COUNT",
        `hero.csv must contain exactly one data row (found ${rows.length}).`,
        csvPath,
      ),
    );
  }

  return rows;
}

function parseGalleryRows(
  text: string,
  csvPath: string,
  errors: BuilderPackageImportError[],
): GalleryCsvRow[] {
  const table = parseCsv(text);
  const headerError = requireHeaders(table, ["order", "room", "file"], csvPath);
  if (headerError) {
    errors.push(bpError("BP_INVALID_CSV", headerError, csvPath));
    return [];
  }

  const seenOrders = new Set<number>();
  const rows: GalleryCsvRow[] = [];

  for (let i = 0; i < table.rows.length; i += 1) {
    const row = table.rows[i]!;
    const orderRaw = row.order ?? "";
    const room = row.room ?? "";
    const file = row.file ?? "";
    const loc = `${csvPath}:row ${i + 2}`;

    if (!orderRaw || !room || !file) {
      errors.push(bpError("BP_MISSING_FIELD", "Missing order, room, or file.", loc));
      continue;
    }

    const order = parsePositiveInt(orderRaw, "order", loc);
    if (typeof order === "string") {
      errors.push(bpError("BP_INVALID_TYPE", order, loc));
      continue;
    }

    if (seenOrders.has(order)) {
      errors.push(bpError("BP_DUPLICATE_ORDER", `Duplicate gallery order ${order}.`, loc));
      continue;
    }
    seenOrders.add(order);
    rows.push({ order, room, file });
  }

  rows.sort((a, b) => a.order - b.order);
  return rows;
}

function parseRoomRows(
  text: string,
  csvPath: string,
  errors: BuilderPackageImportError[],
): RoomCsvRow[] {
  const table = parseCsv(text);
  const headerError = requireHeaders(table, ["floor", "room", "name"], csvPath);
  if (headerError) {
    errors.push(bpError("BP_INVALID_CSV", headerError, csvPath));
    return [];
  }

  const seenRooms = new Set<string>();
  const rows: RoomCsvRow[] = [];

  for (let i = 0; i < table.rows.length; i += 1) {
    const row = table.rows[i]!;
    const floor = row.floor ?? "";
    const room = row.room ?? "";
    const name = row.name ?? "";
    const loc = `${csvPath}:row ${i + 2}`;

    if (!floor || !room || !name) {
      errors.push(bpError("BP_MISSING_FIELD", "Missing floor, room, or name.", loc));
      continue;
    }

    if (seenRooms.has(room)) {
      errors.push(bpError("BP_DUPLICATE_ROOM", `Duplicate room id "${room}".`, loc));
      continue;
    }
    seenRooms.add(room);
    rows.push({ floor, room, name });
  }

  return rows;
}

function parseVideoRows(
  text: string,
  csvPath: string,
  errors: BuilderPackageImportError[],
): VideoCsvRow[] {
  const table = parseCsv(text);
  const headerError = requireHeaders(
    table,
    ["order", "room", "provider", "mediaId"],
    csvPath,
  );
  if (headerError) {
    errors.push(bpError("BP_INVALID_CSV", headerError, csvPath));
    return [];
  }

  const seenOrders = new Set<number>();
  const rows: VideoCsvRow[] = [];

  for (let i = 0; i < table.rows.length; i += 1) {
    const row = table.rows[i]!;
    const orderRaw = row.order ?? "";
    const room = row.room ?? "";
    const provider = row.provider ?? "";
    const mediaId = row.mediaId ?? "";
    const loc = `${csvPath}:row ${i + 2}`;

    if (!orderRaw || !room || !provider || !mediaId) {
      errors.push(
        bpError("BP_MISSING_FIELD", "Missing order, room, provider, or mediaId.", loc),
      );
      continue;
    }

    const order = parsePositiveInt(orderRaw, "order", loc);
    if (typeof order === "string") {
      errors.push(bpError("BP_INVALID_TYPE", order, loc));
      continue;
    }

    if (seenOrders.has(order)) {
      errors.push(bpError("BP_DUPLICATE_ORDER", `Duplicate video order ${order}.`, loc));
      continue;
    }
    seenOrders.add(order);
    rows.push({ order, room, provider, mediaId });
  }

  rows.sort((a, b) => a.order - b.order);
  return rows;
}

/**
 * Import an HP-002 Builder House Package and generate Runtime registries.
 * Does not write files — returns in-memory registries for callers to persist.
 */
export async function importBuilderHousePackage(
  packageRoot: string,
): Promise<BuilderPackageImportResult> {
  const root = path.resolve(packageRoot);
  const errors: BuilderPackageImportError[] = [];

  const roomsCsvPath = path.join(root, "rooms.csv");
  const galleryCsvPath = path.join(root, "gallery.csv");
  const heroCsvPath = path.join(root, "hero", "hero.csv");
  const videosCsvPath = path.join(root, "videos", "videos.csv");

  const requiredFiles: Array<[string, string]> = [
    [roomsCsvPath, "rooms.csv"],
    [galleryCsvPath, "gallery.csv"],
    [heroCsvPath, "hero/hero.csv"],
    [videosCsvPath, "videos/videos.csv"],
  ];

  for (const [absolute, relative] of requiredFiles) {
    if (!(await pathExists(absolute))) {
      errors.push(bpError("BP_MISSING_FILE", `Missing required file: ${relative}`, relative));
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const roomsText = await readUtf8(roomsCsvPath);
  const galleryText = await readUtf8(galleryCsvPath);
  const heroText = await readUtf8(heroCsvPath);
  const videosText = await readUtf8(videosCsvPath);

  if (!roomsText || !galleryText || !heroText || !videosText) {
    errors.push(bpError("BP_MISSING_FILE", "Failed to read one or more required CSV files."));
    return { ok: false, errors };
  }

  const roomRows = parseRoomRows(roomsText, "rooms.csv", errors);
  const galleryRows = parseGalleryRows(galleryText, "gallery.csv", errors);
  const heroRows = parseHeroRows(heroText, "hero/hero.csv", errors);
  const videoRows = parseVideoRows(videosText, "videos/videos.csv", errors);
  const floors = await discoverPlans(root, errors);

  const roomIds = new Set(roomRows.map((r) => r.room));
  const floorIds = new Set(floors.floors.map((f) => f.floorId));

  for (const row of roomRows) {
    if (!floorIds.has(row.floor)) {
      errors.push(
        bpError(
          "BP_UNKNOWN_FLOOR",
          `Room "${row.room}" references unknown floor "${row.floor}".`,
          "rooms.csv",
        ),
      );
    }
  }

  for (const row of galleryRows) {
    if (!roomIds.has(row.room)) {
      errors.push(
        bpError(
          "BP_UNKNOWN_ROOM",
          `Gallery entry references unknown room "${row.room}".`,
          "gallery.csv",
        ),
      );
    }
    const assetPath = path.join(root, "gallery", row.file);
    if (!(await pathExists(assetPath))) {
      errors.push(
        bpError(
          "BP_ASSET_MISSING",
          `Gallery file missing: gallery/${row.file}`,
          `gallery/${row.file}`,
        ),
      );
    }
  }

  for (const row of videoRows) {
    if (!roomIds.has(row.room)) {
      errors.push(
        bpError(
          "BP_UNKNOWN_ROOM",
          `Video entry references unknown room "${row.room}".`,
          "videos/videos.csv",
        ),
      );
    }
  }

  for (const row of heroRows) {
    const assetPath = path.join(root, "hero", row.file);
    if (!(await pathExists(assetPath))) {
      errors.push(
        bpError(
          "BP_ASSET_MISSING",
          `Hero file missing: hero/${row.file}`,
          `hero/${row.file}`,
        ),
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const hero: HeroRegistry = {
    entries: heroRows.map((row, index) => {
      const entryPath = packageRelative(root, path.join(root, "hero", row.file));
      const base = {
        id: `hero-${index + 1}`,
        file: row.file,
        path: entryPath,
      };
      return row.title === undefined ? base : { ...base, title: row.title };
    }),
  };

  const gallery: GalleryRegistry = {
    entries: galleryRows.map((row) => ({
      order: row.order,
      roomId: row.room,
      file: row.file,
      path: packageRelative(root, path.join(root, "gallery", row.file)),
    })),
  };

  const rooms: RoomRegistry = {
    rooms: roomRows.map((row) => ({
      floorId: row.floor,
      roomId: row.room,
      name: row.name,
    })),
  };

  const svg: SvgRegistry = {
    entries: floors.floors.map((floor) => ({
      floorId: floor.floorId,
      path: floor.planSvg,
    })),
  };

  const videos: VideoRegistry = {
    entries: videoRows.map((row) => ({
      order: row.order,
      roomId: row.room,
      provider: row.provider,
      mediaId: row.mediaId,
    })),
  };

  const manifest: RuntimeManifest = {
    packageFormat: BUILDER_PACKAGE_FORMAT,
    schemaVersion: BUILDER_PACKAGE_SCHEMA_VERSION,
    packageRoot: root,
    hero,
    gallery,
    rooms,
    floors,
    svg,
    videos,
  };

  const result: BuilderHousePackageImport = {
    manifest,
    hero,
    gallery,
    rooms,
    floors,
    svg,
    videos,
  };

  return { ok: true, result };
}
