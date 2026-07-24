/**
 * Browser-safe Builder Package surface (no node:fs).
 * Disk importer: `@embed-engine/object-house/builder-package/node`
 */

export type {
  BuilderPackageErrorCode,
  BuilderPackageImportError,
  BuilderPackageImportFailure,
  BuilderPackageImportResult,
  BuilderPackageImportSuccess,
} from "./errors";
export { bpError } from "./errors";
export {
  buildBuilderPackageRegistries,
  type BuilderPackageSources,
} from "./buildRegistries";
export { parseCsv } from "./parse-csv";
export { resolveBuilderVideoUrl } from "./resolveVideoUrl";
export {
  BUILDER_MEDIA_FLOORPLAN_PREFIX,
  BUILDER_MEDIA_GALLERY_PREFIX,
  BUILDER_MEDIA_HERO_ID,
  BUILDER_MEDIA_VIDEO_PREFIX,
  RUNTIME_HOUSE_PACKAGE_SOURCE,
  builderFloorIdToNumber,
  floorplanMediaId,
  galleryMediaId,
  parseGalleryMediaId,
  parseVideoMediaId,
  projectBuilderImportToHousePackage,
  videoMediaId,
  type BuilderHousePackageProjectionOptions,
} from "./projectToHousePackage";
export type {
  BuilderHousePackageImport,
  FloorRegistry,
  FloorRegistryEntry,
  GalleryCsvRow,
  GalleryRegistry,
  GalleryRegistryEntry,
  HeroCsvRow,
  HeroRegistry,
  HeroRegistryEntry,
  RoomCsvRow,
  RoomRegistry,
  RoomRegistryEntry,
  RuntimeManifest,
  SvgRegistry,
  SvgRegistryEntry,
  VideoCsvRow,
  VideoRegistry,
  VideoRegistryEntry,
} from "./types";
export {
  BUILDER_PACKAGE_FORMAT,
  BUILDER_PACKAGE_SCHEMA_VERSION,
} from "./types";
