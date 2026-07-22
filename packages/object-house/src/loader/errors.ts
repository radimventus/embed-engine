/**
 * Structured House Package loader errors (HP-001 §14).
 * Loaders MUST return these instead of throwing generic exceptions for validation failures.
 */

export type HousePackageErrorCode =
  | "HP_MISSING_MANIFEST"
  | "HP_INVALID_JSON"
  | "HP_BAD_FORMAT"
  | "HP_UNSUPPORTED_SCHEMA"
  | "HP_MISSING_FIELD"
  | "HP_DUPLICATE_ID"
  | "HP_ASSET_MISSING"
  | "HP_ASSET_ESCAPE"
  | "HP_INVALID_WISTIA"
  | "HP_DOCUMENT_MISSING"
  | "HP_INVALID_TYPE";

export type HousePackageLoadError = {
  readonly code: HousePackageErrorCode;
  readonly message: string;
  /** JSON path or filesystem-relative path related to the error. */
  readonly path?: string;
};

export type HousePackageLoadSuccess = {
  readonly ok: true;
  readonly package: import("../HousePackage").HousePackage;
};

export type HousePackageLoadFailure = {
  readonly ok: false;
  readonly errors: readonly HousePackageLoadError[];
};

export type HousePackageLoadResult =
  | HousePackageLoadSuccess
  | HousePackageLoadFailure;

export function loadError(
  code: HousePackageErrorCode,
  message: string,
  path?: string,
): HousePackageLoadError {
  return path === undefined ? { code, message } : { code, message, path };
}
