/**
 * CAP-BLD-04 — browser client for Node host persistence API.
 */

import type { HousePackagePersistFiles } from './buildPersistFiles';

export const HOUSE_PACKAGE_PERSIST_API = '/api/house-package/persist';

export type HousePackagePersistResponse =
  | {
      readonly ok: true;
      readonly written: readonly string[];
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export async function requestHousePackagePersist(
  files: HousePackagePersistFiles,
): Promise<HousePackagePersistResponse> {
  const response = await fetch(HOUSE_PACKAGE_PERSIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
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
    'written' in payload &&
    Array.isArray((payload as { written: unknown }).written)
  ) {
    return {
      ok: true,
      written: (payload as { written: string[] }).written,
    };
  }

  const error =
    payload !== null &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof (payload as { error: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : `Persist failed (HTTP ${response.status})`;

  return { ok: false, error };
}
