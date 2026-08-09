import {
  bpError,
  type BuilderPackageImportError,
  type BuilderPackageImportResult,
} from "./errors";
import {
  parseCsv,
  parseNonNegativeNumber,
  parsePositiveInt,
  requireHeaders,
} from "./parse-csv";
import {
  BUILDER_PACKAGE_FORMAT,
  BUILDER_PACKAGE_SCHEMA_VERSION,
  type BuilderHousePackageImport,
  type FloorRegistry,
  type GalleryCsvRow,
  type GalleryRegistry,
  type HeroRegistry,
  type RoomCsvRow,
  type RoomRegistry,
  type RuntimeManifest,
  type SvgRegistry,
  type VideoCsvRow,
  type VideoRegistry,
} from "./types";

/**
 * Text/CSV sources for HP-002 Builder House Package (no filesystem I/O).
 * Paths are package-relative using forward slashes.
 */
export type BuilderPackageSources = {
  /**
   * AUTHORING_DRAFT permits a structurally valid package before its optional
   * hero and floor-plan content has been authored. PUBLISH_READY preserves
   * the strict runtime-ready requirements.
   */
  readonly validationMode?: BuilderPackageValidationMode;
  /** Label stored on Runtime Manifest (absolute path or public URL root). */
  readonly packageRoot: string;
  readonly galleryCsv: string;
  readonly roomsCsv: string;
  readonly videosCsv: string;
  /** Package-relative hero asset, e.g. `media/hero/hero.webp`. */
  readonly heroPath?: string;
  readonly heroTitle?: string;
  /**
   * Floor plan pairs under `media/plans/`.
   * Raster may be `.webp` or `.png`.
   */
  readonly planPairs: readonly {
    readonly floorId: string;
    readonly rasterRelativePath: string;
    readonly svgRelativePath: string;
  }[];
  /**
   * When set, every referenced relative path MUST be present.
   * When omitted, asset existence is not checked (browser bootstrap).
   */
  readonly existingRelativePaths?: ReadonlySet<string>;
};

export type BuilderPackageValidationMode =
  | "AUTHORING_DRAFT"
  | "PUBLISH_READY";

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
  const headerError = requireHeaders(
    table,
    ["floor", "room", "name", "area"],
    csvPath,
  );
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
    const areaRaw = row.area ?? "";
    const loc = `${csvPath}:row ${i + 2}`;

    if (!floor || !room || !name || !areaRaw) {
      errors.push(
        bpError("BP_MISSING_FIELD", "Missing floor, room, name, or area.", loc),
      );
      continue;
    }

    const area = parseNonNegativeNumber(areaRaw, "area", loc);
    if (typeof area === "string") {
      errors.push(bpError("BP_INVALID_TYPE", area, loc));
      continue;
    }

    if (seenRooms.has(room)) {
      errors.push(bpError("BP_DUPLICATE_ROOM", `Duplicate room id "${room}".`, loc));
      continue;
    }
    seenRooms.add(room);
    rows.push({ floor, room, name, area });
  }

  return rows;
}

function parseVideoRows(
  text: string,
  csvPath: string,
  errors: BuilderPackageImportError[],
): VideoCsvRow[] {
  const table = parseCsv(text);
  const headerError = requireHeaders(table, ["order", "room", "provider"], csvPath);
  if (headerError) {
    errors.push(bpError("BP_INVALID_CSV", headerError, csvPath));
    return [];
  }

  const hasMediaId =
    table.headers.includes("mediaId") || table.headers.includes("media-id");
  if (!hasMediaId) {
    errors.push(
      bpError(
        "BP_INVALID_CSV",
        `Missing required CSV header "mediaId" in ${csvPath}`,
        csvPath,
      ),
    );
    return [];
  }

  const seenOrders = new Set<number>();
  const rows: VideoCsvRow[] = [];

  for (let i = 0; i < table.rows.length; i += 1) {
    const row = table.rows[i]!;
    const orderRaw = row.order ?? "";
    const room = row.room ?? "";
    const provider = row.provider ?? "";
    const mediaId = (row.mediaId ?? row["media-id"] ?? "").trim();
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

function assertExisting(
  relativePath: string,
  existing: ReadonlySet<string> | undefined,
  errors: BuilderPackageImportError[],
): void {
  if (existing === undefined) {
    return;
  }
  if (!existing.has(relativePath)) {
    errors.push(
      bpError("BP_ASSET_MISSING", `Referenced asset is missing: ${relativePath}`, relativePath),
    );
  }
}

/**
 * Build Runtime registries from HP-002 CSV/text sources (deterministic, no I/O).
 */
export function buildBuilderPackageRegistries(
  sources: BuilderPackageSources,
): BuilderPackageImportResult {
  const errors: BuilderPackageImportError[] = [];
  const validationMode =
    sources.validationMode ?? "PUBLISH_READY";
  const isPublishReady = validationMode === "PUBLISH_READY";

  const roomRows = parseRoomRows(sources.roomsCsv, "rooms.csv", errors);
  const galleryRows = parseGalleryRows(sources.galleryCsv, "gallery.csv", errors);
  const videoRows = parseVideoRows(sources.videosCsv, "videos.csv", errors);

  const heroPath = sources.heroPath?.trim() ?? "";
  if (heroPath.length === 0 && isPublishReady) {
    errors.push(
      bpError("BP_MISSING_FILE", "Hero asset path is required (media/hero/…).", "media/hero/"),
    );
  } else if (heroPath.length > 0) {
    assertExisting(heroPath, sources.existingRelativePaths, errors);
  }

  const floors: FloorRegistry = {
    floors: sources.planPairs.map((pair) => ({
      floorId: pair.floorId,
      planPng: pair.rasterRelativePath,
      planSvg: pair.svgRelativePath,
    })),
  };

  for (const pair of sources.planPairs) {
    assertExisting(pair.rasterRelativePath, sources.existingRelativePaths, errors);
    assertExisting(pair.svgRelativePath, sources.existingRelativePaths, errors);
  }

  const floorIds = new Set(floors.floors.map((f) => f.floorId));
  const roomIds = new Set(roomRows.map((r) => r.room));

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
    assertExisting(
      `media/gallery/${row.file}`,
      sources.existingRelativePaths,
      errors,
    );
  }

  for (const row of videoRows) {
    if (!roomIds.has(row.room)) {
      errors.push(
        bpError(
          "BP_UNKNOWN_ROOM",
          `Video entry references unknown room "${row.room}".`,
          "videos.csv",
        ),
      );
    }
  }

  if (isPublishReady && floors.floors.length === 0) {
    errors.push(
      bpError("BP_PLAN_INCOMPLETE", "No floor plan pairs provided under media/plans/.", "media/plans/"),
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const hero: HeroRegistry = {
    entries:
      heroPath.length === 0
        ? []
        : [
            {
              id: "hero-1",
              file: heroPath.split("/").pop() ?? heroPath,
              path: heroPath,
              ...(sources.heroTitle !== undefined
                ? { title: sources.heroTitle }
                : {}),
            },
          ],
  };

  const gallery: GalleryRegistry = {
    entries: galleryRows.map((row) => ({
      order: row.order,
      roomId: row.room,
      file: row.file,
      path: `media/gallery/${row.file}`,
    })),
  };

  const rooms: RoomRegistry = {
    rooms: roomRows.map((row) => ({
      floorId: row.floor,
      roomId: row.room,
      name: row.name,
      area: row.area,
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
    packageRoot: sources.packageRoot,
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
