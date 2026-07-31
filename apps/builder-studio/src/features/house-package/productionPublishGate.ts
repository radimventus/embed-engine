/**
 * CAP-BLD-06 — pure gate helpers for production publish orchestration.
 * Validation remains object-house; this only decides next step.
 */

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

/** Geometry tooling can heal these HP-003 codes (existing publish:floorplan-geometry). */
export const HEALABLE_GEOMETRY_CODES = new Set([
  'HP003_GEOMETRY_MISSING',
  'HP003_VIEWBOX_MISMATCH',
]);

export type ProductionPublishGateDecision =
  | { readonly action: 'continue' }
  | { readonly action: 'run-geometry' }
  | {
      readonly action: 'block';
      readonly errors: readonly BuilderPackageImportError[];
    };

export function decideProductionPublishGate(
  errors: readonly BuilderPackageImportError[],
): ProductionPublishGateDecision {
  if (errors.length === 0) {
    return { action: 'continue' };
  }

  const healable = errors.filter((error) =>
    HEALABLE_GEOMETRY_CODES.has(error.code),
  );
  const blocking = errors.filter(
    (error) => !HEALABLE_GEOMETRY_CODES.has(error.code),
  );

  if (blocking.length > 0) {
    return { action: 'block', errors };
  }

  if (healable.length > 0) {
    return { action: 'run-geometry' };
  }

  return { action: 'block', errors };
}

export type ProductionPublishStage =
  | 'validate'
  | 'geometry'
  | 'embed:publish'
  | 'summary';

export type HousePackageReleaseSummary = {
  readonly status: 'Publish OK';
  readonly buildFingerprint: string;
  readonly housePackageVersion: string;
  readonly embedVersion: string;
  readonly releaseTimestamp: string;
  readonly artifacts: {
    readonly housePackage: 'docs/house-package';
    readonly embed: 'docs/embed';
  };
  readonly geometryRan: boolean;
};

export function buildHousePackageReleaseSummary(input: {
  readonly embedVersionJson: {
    readonly version?: unknown;
    readonly fingerprint?: {
      readonly marker?: unknown;
      readonly builtAt?: unknown;
    };
  };
  readonly housePackageManifest: {
    readonly version?: unknown;
  };
  readonly geometryRan: boolean;
}): HousePackageReleaseSummary {
  const fingerprint = input.embedVersionJson.fingerprint?.marker;
  const releaseTimestamp = input.embedVersionJson.fingerprint?.builtAt;
  const embedVersion = input.embedVersionJson.version;
  const housePackageVersion = input.housePackageManifest.version;

  if (typeof fingerprint !== 'string' || fingerprint.length === 0) {
    throw new Error(
      'Release Summary: missing docs/embed/version.json fingerprint.marker',
    );
  }
  if (typeof releaseTimestamp !== 'string' || releaseTimestamp.length === 0) {
    throw new Error(
      'Release Summary: missing docs/embed/version.json fingerprint.builtAt',
    );
  }
  if (typeof embedVersion !== 'string' || embedVersion.length === 0) {
    throw new Error('Release Summary: missing docs/embed/version.json version');
  }
  if (
    typeof housePackageVersion !== 'string' &&
    typeof housePackageVersion !== 'number'
  ) {
    throw new Error(
      'Release Summary: missing house-package manifest.json version',
    );
  }

  return {
    status: 'Publish OK',
    buildFingerprint: fingerprint,
    housePackageVersion: String(housePackageVersion),
    embedVersion,
    releaseTimestamp,
    artifacts: {
      housePackage: 'docs/house-package',
      embed: 'docs/embed',
    },
    geometryRan: input.geometryRan,
  };
}
