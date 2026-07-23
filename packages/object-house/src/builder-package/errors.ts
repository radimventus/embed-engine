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
  | "BP_INVALID_TYPE";

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
