/**
 * Project HP-002 Builder registries into Object Package `HousePackage`
 * for Decision Session Runtime (PT-RUNTIME-UNIFY-01).
 *
 * Single SSOT path: Builder Package → registries → HousePackage → Runtime.
 * Room ids stay Builder ids (rooms.csv). Media (hero / gallery / video / floorplan)
 * is encoded on `HousePackage.media` so Presentation can read Experience only.
 */

import type {
  HouseDocument,
  HouseIdentity,
  HouseLocation,
  HouseMetadata,
  HouseOverview,
  HousePackage,
} from "../HousePackage";
import type { MediaAsset } from "../MediaAsset";
import type { BuilderHousePackageImport } from "./types";
import { resolveBuilderVideoUrl } from "./resolveVideoUrl";

export const RUNTIME_HOUSE_PACKAGE_SOURCE =
  "builder-package/projectBuilderImportToHousePackage" as const;
export const BUILDER_MEDIA_HERO_ID = "hero";
export const BUILDER_MEDIA_GALLERY_PREFIX = "gallery:";
export const BUILDER_MEDIA_VIDEO_PREFIX = "video:";
export const BUILDER_MEDIA_FLOORPLAN_PREFIX = "floorplan:";

/** Partner fields not present in HP-002 CSVs — supplied by the Runtime adapter. */
export type BuilderHousePackageProjectionOptions = {
  readonly identity: HouseIdentity;
  readonly overview: Omit<HouseOverview, "rooms">;
  readonly location: HouseLocation;
  readonly metadata: HouseMetadata;
  readonly documents?: readonly HouseDocument[];
  /** Public URL root for package assets (default `/house-package`). */
  readonly packagePublicRoot?: string;
};

function packageUrl(packagePublicRoot: string, relativePath: string): string {
  const root = packagePublicRoot.replace(/\/+$/, "");
  const normalized = relativePath.replace(/^\/+/, "");
  return `${root}/${normalized}`;
}

/**
 * Map Builder floor ids (`p1`, `p2`, …) onto Object Package numeric floors.
 * `p1` → 0, `p2` → 1, unknown → 0.
 */
export function builderFloorIdToNumber(floorId: string): number {
  const match = /^p(\d+)$/i.exec(floorId.trim());
  if (match === null) {
    return 0;
  }
  const n = Number.parseInt(match[1]!, 10);
  if (!Number.isFinite(n) || n < 1) {
    return 0;
  }
  return n - 1;
}

export function galleryMediaId(roomId: string, order: number): string {
  return `${BUILDER_MEDIA_GALLERY_PREFIX}${roomId}:${order}`;
}

export function videoMediaId(roomId: string, order: number): string {
  return `${BUILDER_MEDIA_VIDEO_PREFIX}${roomId}:${order}`;
}

export function floorplanMediaId(floorId: string): string {
  return `${BUILDER_MEDIA_FLOORPLAN_PREFIX}${floorId}`;
}

export function parseGalleryMediaId(
  id: string,
): { readonly roomId: string; readonly order: number } | null {
  if (!id.startsWith(BUILDER_MEDIA_GALLERY_PREFIX)) {
    return null;
  }
  const rest = id.slice(BUILDER_MEDIA_GALLERY_PREFIX.length);
  const sep = rest.lastIndexOf(":");
  if (sep <= 0) {
    return null;
  }
  const roomId = rest.slice(0, sep);
  const order = Number.parseInt(rest.slice(sep + 1), 10);
  if (roomId.length === 0 || !Number.isFinite(order)) {
    return null;
  }
  return { roomId, order };
}

export function parseVideoMediaId(
  id: string,
): { readonly roomId: string; readonly order: number } | null {
  if (!id.startsWith(BUILDER_MEDIA_VIDEO_PREFIX)) {
    return null;
  }
  const rest = id.slice(BUILDER_MEDIA_VIDEO_PREFIX.length);
  const sep = rest.lastIndexOf(":");
  if (sep <= 0) {
    return null;
  }
  const roomId = rest.slice(0, sep);
  const order = Number.parseInt(rest.slice(sep + 1), 10);
  if (roomId.length === 0 || !Number.isFinite(order)) {
    return null;
  }
  return { roomId, order };
}

/**
 * Deterministic Runtime House Package from Builder registries.
 */
export function projectBuilderImportToHousePackage(
  registries: BuilderHousePackageImport,
  options: BuilderHousePackageProjectionOptions,
): HousePackage {
  const packagePublicRoot = options.packagePublicRoot ?? "/house-package";

  const rooms = registries.rooms.rooms.map((room) =>
    Object.freeze({
      id: room.roomId,
      name: room.name,
      area: room.area,
      floor: builderFloorIdToNumber(room.floorId),
    }),
  );

  const media: MediaAsset[] = [];

  const hero = registries.hero.entries[0];
  if (hero !== undefined) {
    media.push(
      Object.freeze({
        id: BUILDER_MEDIA_HERO_ID,
        type: "image" as const,
        title: hero.title ?? "Hero",
        url: packageUrl(packagePublicRoot, hero.path),
      }),
    );
  }

  for (const entry of registries.gallery.entries) {
    media.push(
      Object.freeze({
        id: galleryMediaId(entry.roomId, entry.order),
        type: "image" as const,
        title: entry.roomId,
        url: packageUrl(packagePublicRoot, entry.path),
      }),
    );
  }

  for (const entry of registries.videos.entries) {
    media.push(
      Object.freeze({
        id: videoMediaId(entry.roomId, entry.order),
        type: "video" as const,
        title: entry.roomId,
        url: resolveBuilderVideoUrl(entry.provider, entry.mediaId),
      }),
    );
  }

  for (const floor of registries.floors.floors) {
    media.push(
      Object.freeze({
        id: floorplanMediaId(floor.floorId),
        type: "floorplan" as const,
        title: floor.floorId,
        url: packageUrl(packagePublicRoot, floor.planPng),
      }),
    );
  }

  return Object.freeze({
    identity: options.identity,
    overview: Object.freeze({
      ...options.overview,
      rooms: rooms.length,
    }),
    media: Object.freeze(media),
    rooms: Object.freeze(rooms),
    location: options.location,
    metadata: options.metadata,
    ...(options.documents !== undefined
      ? { documents: Object.freeze([...options.documents]) }
      : {}),
  });
}
