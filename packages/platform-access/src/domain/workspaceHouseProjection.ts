import {
  isCanonicalProjectId,
  listCanonicalHouses,
  resolveCanonicalRuntimeBinding,
} from '../projection/canonicalProjectProjection';
import type {
  CanonicalProjectProjection,
  CanonicalRuntimeBinding,
} from '../projection/canonicalProjectTypes';
import {
  getSharedWorkspaceContext,
  isHouseInProject,
  updateSession,
} from '../session/authService';
import { loadPlatformSession } from '../session/sessionStore';
import { packageRootToPublicUrl } from '../project/packagePublicUrl';
import type { WorkspaceAuthoredHouseIdentity } from './workspaceContext';

export type WorkspaceHouseIdentity = {
  readonly houseId: string;
  readonly name: string;
  readonly canonicalProjectId: string;
  readonly packageRoot?: string;
  readonly dataMode: 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';
  readonly status: 'draft' | 'published';
};

export type WorkspaceHouseRuntimeBinding = {
  readonly houseId: string;
  readonly projectId: string;
  readonly dataMode: WorkspaceHouseIdentity['dataMode'];
  readonly status: WorkspaceHouseIdentity['status'];
  readonly runtimeContentAvailable: boolean;
  /** Present only for a House-owned AUTHORING_DRAFT package. */
  readonly authoringDraftPackage: {
    readonly packageRoot: string;
    readonly packagePublicRoot: string;
    readonly name: string;
  } | null;
  /** Available only for a published/canonical House. */
  readonly canonicalBinding: CanonicalRuntimeBinding | null;
};

/** Writes Builder-authored draft identity into cookie-backed Workspace context. */
export function upsertWorkspaceAuthoredHouse(
  house: WorkspaceAuthoredHouseIdentity,
): void {
  const session = loadPlatformSession();
  const projectId = house.canonicalProjectId.trim();
  if (
    session === null ||
    session.projectId !== projectId ||
    !isCanonicalProjectId(projectId)
  ) {
    return;
  }

  const context = getSharedWorkspaceContext();
  if (context !== null && context.projectId !== projectId) {
    return;
  }
  const activeHouseId =
    session.activeHouseId !== null &&
    isHouseInProject(session.activeHouseId, projectId)
      ? session.activeHouseId
      : null;
  const workspaceContext = context ?? {
    operatorMode: true as const,
    partnerId: session.companyId,
    companyId: session.companyId,
    workspaceId: session.workspaceId,
    projectId,
    activeHouseId,
    authoredHouseIdentities: [],
    activeStudio: 'builder' as const,
    officeReturnHref: '',
    previous: {
      tenantId: session.tenantId,
      companyId: session.companyId,
      workspaceId: session.workspaceId,
      projectId: session.projectId,
    },
  };
  const identities = [
    ...(workspaceContext.authoredHouseIdentities ?? []).filter(
      (item) => item.houseId !== house.houseId,
    ),
    house,
  ];
  updateSession({
    workspaceContext: {
      ...workspaceContext,
      authoredHouseIdentities: identities,
    },
  });
}

/** Authenticated Workspace scope reader; deliberately distinct from published APIs. */
export function listWorkspaceHouses(
  canonicalProjectId: string,
): readonly WorkspaceHouseIdentity[] {
  const byId = new Map<string, WorkspaceHouseIdentity>();
  for (const projection of listCanonicalHouses(canonicalProjectId)) {
    addPublishedHouse(byId, projection);
  }
  for (const house of getSharedWorkspaceContext()?.authoredHouseIdentities ?? []) {
    if (house.canonicalProjectId === canonicalProjectId) {
      byId.set(house.houseId, house);
    }
  }
  return [...byId.values()];
}

/**
 * Resolves authenticated Workspace scope without making authored drafts public.
 * Draft LIVE_EMPTY Houses bind as identity-only and never fall back to content.
 */
export function resolveWorkspaceHouseBinding(input: {
  readonly projectId: string;
  readonly houseId: string;
}): WorkspaceHouseRuntimeBinding | null {
  const house = listWorkspaceHouses(input.projectId).find(
    (item) => item.houseId === input.houseId,
  );
  if (house === undefined) return null;

  if (house.status === 'draft') {
    const packageRoot = house.packageRoot?.trim() ?? '';
    return {
      houseId: house.houseId,
      projectId: house.canonicalProjectId,
      dataMode: house.dataMode,
      status: 'draft',
      runtimeContentAvailable: packageRoot.length > 0,
      authoringDraftPackage:
        packageRoot.length > 0
          ? {
              packageRoot,
              packagePublicRoot: packageRootToPublicUrl(packageRoot),
              name: house.name,
            }
          : null,
      canonicalBinding: null,
    };
  }

  const canonicalBinding = resolveCanonicalRuntimeBinding({
    explicitProjectId: house.houseId,
    fallbackToFirstPublished: false,
  });
  if (canonicalBinding.runtimeHouseId !== house.houseId) return null;
  return {
    houseId: house.houseId,
    projectId: house.canonicalProjectId,
    dataMode: house.dataMode,
    status: 'published',
    runtimeContentAvailable: true,
    authoringDraftPackage: null,
    canonicalBinding,
  };
}

function addPublishedHouse(
  target: Map<string, WorkspaceHouseIdentity>,
  projection: CanonicalProjectProjection,
): void {
  if (projection.house === null) return;
  target.set(projection.house.houseId, {
    houseId: projection.house.houseId,
    name: projection.house.name,
    canonicalProjectId: projection.project.projectId,
    dataMode: projection.house.dataMode,
    status: 'published',
  });
}
