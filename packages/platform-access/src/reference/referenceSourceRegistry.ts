import type { ReferenceHouseProvenance } from '../domain/types';

export const BUNGALOV_4KK_REFERENCE_SOURCE_ID =
  'bungalov-4kk-reference-v1' as const;

export type ReferenceSourceLifecycle = 'CONTENT_PENDING' | 'READY' | 'RETIRED';

export type ReferenceHouseSource = {
  readonly sourceId: string;
  readonly displayName: string;
  readonly version: string;
  readonly lifecycle: ReferenceSourceLifecycle;
  /**
   * Immutable reference content. Partner House instances receive their own
   * identity while materializing this package under their package root.
   */
  readonly packageRoot: string | null;
  /**
   * Canonical, source-owned knowledge identity. Materialized partner Houses keep
   * their own identity and resolve this only through explicit provenance.
   */
  readonly runtimeContextBinding: {
    readonly canonicalHouseId: string;
  } | null;
};

export const BUNGALOV_4KK_REFERENCE_SOURCE: ReferenceHouseSource = {
  sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  displayName: 'BUNGALOV 4KK',
  version: 'v1',
  lifecycle: 'READY',
  packageRoot: 'apps/client-studio/public/house-packages/bungalov-4kk',
  runtimeContextBinding: {
    canonicalHouseId: 'modern-4kk',
  },
};

const REFERENCE_HOUSE_SOURCES: readonly ReferenceHouseSource[] = [
  BUNGALOV_4KK_REFERENCE_SOURCE,
];

function isSafeCanonicalIdPart(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function listReferenceHouseSources(): readonly ReferenceHouseSource[] {
  return REFERENCE_HOUSE_SOURCES;
}

export function getReferenceHouseSource(
  sourceId: string,
): ReferenceHouseSource | null {
  return (
    REFERENCE_HOUSE_SOURCES.find((source) => source.sourceId === sourceId) ??
    null
  );
}

/**
 * Maps a Runtime House identity to canonical knowledge only when the House has
 * explicit source provenance. Never guesses from display name, slug, or media.
 */
export function resolveCanonicalKnowledgeHouseId(input: {
  readonly runtimeHouseId: string;
  readonly referenceProvenance?: ReferenceHouseProvenance;
}): string | null {
  const runtimeHouseId = input.runtimeHouseId.trim();
  if (runtimeHouseId.length === 0) return null;

  const sourceId = input.referenceProvenance?.sourceId;
  if (sourceId === undefined) {
    return runtimeHouseId;
  }
  const source = getReferenceHouseSource(sourceId);
  if (
    source === null ||
    source.version !== input.referenceProvenance?.sourceVersion
  ) {
    return null;
  }
  return source.runtimeContextBinding?.canonicalHouseId ?? null;
}

/**
 * Produces a deterministic Partner/Project-scoped House identity without
 * reading display names or conflating the materialization with its source.
 */
export function deriveReferenceInstanceHouseId(input: {
  readonly sourceId: string;
  readonly companyId: string;
  readonly projectId: string;
}): string {
  const source = getReferenceHouseSource(input.sourceId);
  if (source === null) {
    throw new Error(`Unknown reference source "${input.sourceId}".`);
  }
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  if (!isSafeCanonicalIdPart(companyId) || !isSafeCanonicalIdPart(projectId)) {
    throw new Error('Reference instance requires canonical Company and Project ids.');
  }

  return `reference-${source.version}-${companyId}-${projectId}-bungalov-4kk`;
}

/**
 * Deterministic identity for a Partner-owned draft House under a canonical
 * Partner/Project scope. Drafts never reuse a reference-source identity.
 */
export function derivePartnerDraftHouseId(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseSlug: string;
}): string {
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  const houseSlug = input.houseSlug.trim();
  if (
    !isSafeCanonicalIdPart(companyId) ||
    !isSafeCanonicalIdPart(projectId) ||
    !isSafeCanonicalIdPart(houseSlug)
  ) {
    throw new Error('Draft House requires canonical Company, Project, and House ids.');
  }
  return `draft-${companyId}-${projectId}-${houseSlug}`;
}

export function referenceInstanceProvenance(
  sourceId: string,
): ReferenceHouseProvenance {
  const source = getReferenceHouseSource(sourceId);
  if (source === null) {
    throw new Error(`Unknown reference source "${sourceId}".`);
  }
  return {
    sourceId: source.sourceId,
    sourceVersion: source.version,
  };
}
