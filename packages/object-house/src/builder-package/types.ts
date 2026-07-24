/**
 * HP-002 Builder House Package — input rows and generated Runtime registries.
 * Partner package is folders + CSV only; registries are import outputs.
 */

export const BUILDER_PACKAGE_FORMAT = "builder-house-package" as const;
export const BUILDER_PACKAGE_SCHEMA_VERSION = "1.0" as const;

export type HeroCsvRow = {
  readonly file: string;
  readonly title?: string;
};

export type GalleryCsvRow = {
  readonly order: number;
  readonly room: string;
  readonly file: string;
};

export type RoomCsvRow = {
  readonly floor: string;
  readonly room: string;
  readonly name: string;
  /** Usable area in m² from rooms.csv. */
  readonly area: number;
};

export type VideoCsvRow = {
  readonly order: number;
  readonly room: string;
  readonly provider: string;
  readonly mediaId: string;
};

export type HeroRegistryEntry = {
  readonly id: string;
  readonly file: string;
  readonly path: string;
  readonly title?: string;
};

export type HeroRegistry = {
  readonly entries: readonly HeroRegistryEntry[];
};

export type GalleryRegistryEntry = {
  readonly order: number;
  readonly roomId: string;
  readonly file: string;
  readonly path: string;
};

export type GalleryRegistry = {
  readonly entries: readonly GalleryRegistryEntry[];
};

export type RoomRegistryEntry = {
  readonly floorId: string;
  readonly roomId: string;
  readonly name: string;
  readonly area: number;
};

export type RoomRegistry = {
  readonly rooms: readonly RoomRegistryEntry[];
};

export type FloorRegistryEntry = {
  readonly floorId: string;
  readonly planPng: string;
  readonly planSvg: string;
};

export type FloorRegistry = {
  readonly floors: readonly FloorRegistryEntry[];
};

export type SvgRegistryEntry = {
  readonly floorId: string;
  readonly path: string;
};

export type SvgRegistry = {
  readonly entries: readonly SvgRegistryEntry[];
};

export type VideoRegistryEntry = {
  readonly order: number;
  readonly roomId: string;
  readonly provider: string;
  readonly mediaId: string;
};

export type VideoRegistry = {
  readonly entries: readonly VideoRegistryEntry[];
};

export type RuntimeManifest = {
  readonly packageFormat: typeof BUILDER_PACKAGE_FORMAT;
  readonly schemaVersion: typeof BUILDER_PACKAGE_SCHEMA_VERSION;
  readonly packageRoot: string;
  readonly hero: HeroRegistry;
  readonly gallery: GalleryRegistry;
  readonly rooms: RoomRegistry;
  readonly floors: FloorRegistry;
  readonly svg: SvgRegistry;
  readonly videos: VideoRegistry;
};

export type BuilderHousePackageImport = {
  readonly manifest: RuntimeManifest;
  readonly hero: HeroRegistry;
  readonly gallery: GalleryRegistry;
  readonly rooms: RoomRegistry;
  readonly floors: FloorRegistry;
  readonly svg: SvgRegistry;
  readonly videos: VideoRegistry;
};
