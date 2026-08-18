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
  type BuilderPackageValidationMode,
} from "./buildRegistries";
export { parseCsv } from "./parse-csv";
export { resolveBuilderVideoUrl } from "./resolveVideoUrl";
export {
  DEFAULT_HERO_COPY,
  isHeroCopy,
  readHeroCopyFromManifest,
  readHeroRelativePathFromManifest,
} from "./heroCopy";
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
export {
  normalizeRuntimeHousePackageAssets,
  type NormalizedHousePackageAssets,
} from "./normalizeRuntimeHousePackageAssets";
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
export {
  HP003_GEOMETRY_SCHEMA,
  HP003_GEOMETRY_SCHEMA_VERSION,
  authorSvgRelativePath,
  geometryRelativePath,
  isFloorPlanGeometry,
  roomSvgDirectoryRelativePath,
  type FloorPlanBBox,
  type FloorPlanGeometry,
  type FloorPlanGeometryRoom,
} from "./floorPlanGeometry";
export {
  extractFloorPlanGeometryFromSvg,
  type GeometryExtractError,
  type GeometryExtractResult,
} from "./extractFloorPlanGeometry";
export {
  loadPublicBuilderHousePackage,
  projectPublicBuilderHousePackageFromCsvTexts,
  type LoadPublicBuilderHousePackageInput,
} from "./loadPublicBuilderHousePackage";
