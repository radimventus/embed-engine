/**
 * Structured errors for HP-002 Builder House Package import.
 */

export type BuilderPackageErrorCode =
  | "BP_MISSING_FILE"
  | "BP_INVALID_CSV"
  | "BP_MISSING_FIELD"
  | "BP_DUPLICATE_ORDER"
  | "BP_DUPLICATE_ROOM"
  | "BP_UNKNOWN_ROOM"
  | "BP_ASSET_MISSING"
  | "BP_PLAN_INCOMPLETE"
  | "BP_UNKNOWN_FLOOR"
  | "BP_INVALID_HERO_COUNT"
  | "BP_INVALID_TYPE"
  | "HP003_SVG_MISSING"
  | "HP003_SVG_EMPTY"
  | "HP003_SVG_NO_VIEWBOX"
  | "HP003_SVG_BAD_FLOOR"
  | "HP003_SVG_MISSING_HP003"
  | "HP003_SVG_BAD_SHAPE"
  | "HP003_ROOM_UNBOUND"
  | "HP003_CSV_NO_GEOMETRY"
  | "HP003_ROOM_DUP"
  | "HP003_VIEWBOX_MISMATCH"
  | "HP003_GEOMETRY_MISSING";

export type BuilderPackageImportError = {
  readonly code: BuilderPackageErrorCode;
  readonly message: string;
  readonly path?: string;
};

export type BuilderPackageImportSuccess = {
  readonly ok: true;
  readonly result: import("./types").BuilderHousePackageImport;
};

export type BuilderPackageImportFailure = {
  readonly ok: false;
  readonly errors: readonly BuilderPackageImportError[];
};

export type BuilderPackageImportResult =
  | BuilderPackageImportSuccess
  | BuilderPackageImportFailure;

export function bpError(
  code: BuilderPackageErrorCode,
  message: string,
  path?: string,
): BuilderPackageImportError {
  return path === undefined ? { code, message } : { code, message, path };
}
