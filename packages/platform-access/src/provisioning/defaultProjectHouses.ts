import type { PlatformProject } from '../domain/types';
import {
  getDefaultCompanyRegistry,
  upsertBuilderProject,
} from '../registry/companyRegistry';
import {
  BUNGALOV_4KK_REFERENCE_SOURCE,
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
  referenceInstanceProvenance,
} from '../reference/referenceSourceRegistry';

export const DEFAULT_PARTNER_DRAFT_HOUSE_SLUG = 'vas-prvni-dum-5kk' as const;

export const DEFAULT_VPD_PACKAGE_ROOT =
  'apps/client-studio/public/house-packages/patrovy-5kk' as const;

export type DefaultProjectHouseRole = 'bungalov-4kk' | 'vas-prvni-dum';

export type ProvisionDefaultProjectHousesInput = {
  readonly companyId: string;
  readonly projectId: string;
  readonly workspaceId: string;
};

export type ProvisionDefaultProjectHousesResult = {
  readonly created: readonly DefaultProjectHouseRole[];
  readonly createdCount: number;
  readonly message: string;
};

function normalizeScope(input: ProvisionDefaultProjectHousesInput): {
  readonly companyId: string;
  readonly projectId: string;
  readonly workspaceId: string;
} | null {
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  const workspaceId = input.workspaceId.trim();
  if (
    companyId.length === 0 ||
    projectId.length === 0 ||
    workspaceId.length === 0
  ) {
    return null;
  }
  return { companyId, projectId, workspaceId };
}

export function housesForCanonicalProject(
  companyId: string,
  projectId: string,
): readonly PlatformProject[] {
  return getDefaultCompanyRegistry().projects.filter(
    (house) =>
      house.companyId === companyId &&
      house.canonicalProjectId === projectId,
  );
}

/** Stable provenance identity — display name renames must not affect detection. */
export function isDefaultReferenceBungalovHouse(
  house: PlatformProject,
): boolean {
  return (
    house.referenceProvenance?.sourceId === BUNGALOV_4KK_REFERENCE_SOURCE_ID
  );
}

/** Stable deterministic draft identity — display name renames must not affect detection. */
export function isDefaultPartnerVpdHouse(
  house: PlatformProject,
  companyId: string,
  projectId: string,
): boolean {
  const expectedId = derivePartnerDraftHouseId({
    companyId,
    projectId,
    houseSlug: DEFAULT_PARTNER_DRAFT_HOUSE_SLUG,
  });
  return house.id === expectedId;
}

export function buildDefaultReferenceBungalovHouse(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly workspaceId: string;
}): PlatformProject {
  return {
    id: deriveReferenceInstanceHouseId({
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      companyId: input.companyId,
      projectId: input.projectId,
    }),
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    name: BUNGALOV_4KK_REFERENCE_SOURCE.displayName,
    packageRoot: BUNGALOV_4KK_REFERENCE_SOURCE.packageRoot ?? '',
    status: 'published',
    slug: 'bungalov-4kk',
    objectType: 'reference-house',
    description:
      'Project-scoped materialization of reference source bungalov-4kk-reference-v1.',
    dataMode: 'REFERENCE_DEMO',
    referenceProvenance: referenceInstanceProvenance(
      BUNGALOV_4KK_REFERENCE_SOURCE_ID,
    ),
    canonicalProjectId: input.projectId,
  };
}

export function buildDefaultPartnerVpdHouse(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly workspaceId: string;
}): PlatformProject {
  return {
    id: derivePartnerDraftHouseId({
      companyId: input.companyId,
      projectId: input.projectId,
      houseSlug: DEFAULT_PARTNER_DRAFT_HOUSE_SLUG,
    }),
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    name: 'Váš první dům',
    packageRoot: DEFAULT_VPD_PACKAGE_ROOT,
    status: 'draft',
    slug: DEFAULT_PARTNER_DRAFT_HOUSE_SLUG,
    objectType: 'partner-house',
    description: 'Partner-owned starter draft House for demonstration.',
    dataMode: 'LIVE_EMPTY',
    canonicalProjectId: input.projectId,
  };
}

export function formatDefaultProjectHousesRecoveryMessage(
  created: readonly DefaultProjectHouseRole[],
): string {
  if (created.length === 0) {
    return 'Výchozí domy jsou již doplněny.';
  }
  if (created.length === 2) {
    return 'Doplněny 2 výchozí domy.';
  }
  if (created[0] === 'bungalov-4kk') {
    return 'Doplněn BUNGALOV 4KK.';
  }
  return 'Doplněn Váš první dům.';
}

/**
 * Manual, idempotent recovery of demonstration Houses for one Company + Project.
 * Uses stable provenance/identity — never display-name matching.
 */
export function provisionDefaultProjectHouses(
  input: ProvisionDefaultProjectHousesInput,
): ProvisionDefaultProjectHousesResult {
  const scope = normalizeScope(input);
  if (scope === null) {
    return {
      created: [],
      createdCount: 0,
      message: 'Vyberte platný projekt.',
    };
  }

  const existing = housesForCanonicalProject(scope.companyId, scope.projectId);
  const created: DefaultProjectHouseRole[] = [];

  if (
    !existing.some((house) => isDefaultReferenceBungalovHouse(house))
  ) {
    upsertBuilderProject(
      buildDefaultReferenceBungalovHouse(scope),
    );
    created.push('bungalov-4kk');
  }

  if (
    !existing.some((house) =>
      isDefaultPartnerVpdHouse(house, scope.companyId, scope.projectId),
    )
  ) {
    upsertBuilderProject(buildDefaultPartnerVpdHouse(scope));
    created.push('vas-prvni-dum');
  }

  return {
    created,
    createdCount: created.length,
    message: formatDefaultProjectHousesRecoveryMessage(created),
  };
}
