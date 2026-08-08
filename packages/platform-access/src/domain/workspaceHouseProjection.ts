import {
  listCanonicalHouses,
  resolveCanonicalRuntimeBinding,
} from '../projection/canonicalProjectProjection';
import type {
  CanonicalProjectProjection,
  CanonicalRuntimeBinding,
} from '../projection/canonicalProjectTypes';
import {
  getSharedWorkspaceContext,
  updateSession,
} from '../session/authService';
import type { WorkspaceAuthoredHouseIdentity } from './workspaceContext';

export type WorkspaceHouseIdentity = {
  readonly houseId: string;
  readonly name: string;
  readonly canonicalProjectId: string;
  readonly dataMode: 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';
  readonly status: 'draft' | 'published';
};

export type WorkspaceHouseRuntimeBinding = {
  readonly houseId: string;
  readonly projectId: string;
  readonly dataMode: WorkspaceHouseIdentity['dataMode'];
  readonly status: WorkspaceHouseIdentity['status'];
  readonly runtimeContentAvailable: boolean;
  /** Available only for a published/canonical House. */
  readonly canonicalBinding: CanonicalRuntimeBinding | null;
};

/** Writes Builder-authored draft identity into cookie-backed Workspace context. */
export function upsertWorkspaceAuthoredHouse(
  house: WorkspaceAuthoredHouseIdentity,
): void {
  const context = getSharedWorkspaceContext();
  if (context === null) return;
  const identities = [
    ...(context.authoredHouseIdentities ?? []).filter(
      (item) => item.houseId !== house.houseId,
    ),
    house,
  ];
  updateSession({
    workspaceContext: {
      ...context,
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
    return {
      houseId: house.houseId,
      projectId: house.canonicalProjectId,
      dataMode: house.dataMode,
      status: 'draft',
      runtimeContentAvailable: false,
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
