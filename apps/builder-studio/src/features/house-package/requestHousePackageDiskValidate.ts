/**
 * CAP-BLD-05 — request disk HP-002 validation via Node host (object-house import).
 */

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

export const HOUSE_PACKAGE_VALIDATE_API = '/api/house-package/validate';

export type HousePackageDiskValidateResponse =
  | {
      readonly ok: true;
      readonly errors: readonly BuilderPackageImportError[];
    }
  | {
      readonly ok: false;
      readonly error: string;
      readonly errors?: readonly BuilderPackageImportError[];
    };

export async function requestHousePackageDiskValidate(): Promise<HousePackageDiskValidateResponse> {
  const response = await fetch(HOUSE_PACKAGE_VALIDATE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (
    payload !== null &&
    typeof payload === 'object' &&
    'ok' in payload &&
    (payload as { ok: unknown }).ok === true &&
    'errors' in payload &&
    Array.isArray((payload as { errors: unknown }).errors)
  ) {
    return {
      ok: true,
      errors: (payload as { errors: BuilderPackageImportError[] }).errors,
    };
  }

  if (
    payload !== null &&
    typeof payload === 'object' &&
    'errors' in payload &&
    Array.isArray((payload as { errors: unknown }).errors)
  ) {
    const record = payload as {
      error?: unknown;
      errors: BuilderPackageImportError[];
    };
    return {
      ok: false,
      error:
        typeof record.error === 'string'
          ? record.error
          : 'Disk validation failed.',
      errors: record.errors,
    };
  }

  const fallbackError =
    payload !== null &&
    typeof payload === 'object' &&
    typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : `Validate failed (HTTP ${response.status})`;

  return {
    ok: false,
    error: fallbackError,
  };
}
