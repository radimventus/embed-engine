/**
 * CAP-BLD-06 — client request for production publish orchestration.
 */

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

import type {
  HousePackageReleaseSummary,
  ProductionPublishStage,
} from './productionPublishGate';

export const HOUSE_PACKAGE_PUBLISH_API = '/api/house-package/publish';

export type HousePackagePublishResponse =
  | {
      readonly ok: true;
      readonly summary: HousePackageReleaseSummary;
    }
  | {
      readonly ok: false;
      readonly stage: ProductionPublishStage;
      readonly error: string;
      readonly validationErrors?: readonly BuilderPackageImportError[];
    };

export async function requestHousePackagePublish(): Promise<HousePackagePublishResponse> {
  const response = await fetch(HOUSE_PACKAGE_PUBLISH_API, {
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
    'summary' in payload
  ) {
    return {
      ok: true,
      summary: (payload as { summary: HousePackageReleaseSummary }).summary,
    };
  }

  if (
    payload !== null &&
    typeof payload === 'object' &&
    'ok' in payload &&
    (payload as { ok: unknown }).ok === false
  ) {
    const record = payload as {
      stage?: unknown;
      error?: unknown;
      validationErrors?: BuilderPackageImportError[];
    };
    return {
      ok: false,
      stage:
        typeof record.stage === 'string'
          ? (record.stage as ProductionPublishStage)
          : 'embed:publish',
      error:
        typeof record.error === 'string'
          ? record.error
          : `Publish failed (HTTP ${response.status})`,
      validationErrors: record.validationErrors,
    };
  }

  return {
    ok: false,
    stage: 'embed:publish',
    error: `Publish failed (HTTP ${response.status})`,
  };
}
