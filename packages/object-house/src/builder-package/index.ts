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
