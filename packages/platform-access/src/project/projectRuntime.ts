/**
 * PT-PDM-02 / CAP-PLAT-04e — Shared Project Runtime: openProject is the sole consumer entry.
 * Dual-read: legacy `projectId` may mean House id or Canonical Project id.
 */

import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import {
  DEFAULT_PROJECT_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_CANONICAL_REFERENCE_HOUSE_ID,
} from '../registry/defaults';
import { packageRootToPublicUrl } from './packagePublicUrl';
import {
  getSharedProject,
  listPublishedProjects,
  listSharedProjects,
} from './projectRepository';
import type { SharedProjectRuntimeView } from './sharedProjectTypes';

/**
 * Open a House row (legacy Shared Project id) for any Studio. Returns null when missing.
 * Consumers should prefer published houses; draft/ready are Builder-only.
 */
export function openProject(projectId: string): SharedProjectRuntimeView | null {
  const project = getSharedProject(projectId);
  if (project === null) return null;
  return {
    project,
    packagePublicRoot: packageRootToPublicUrl(project.packageRoot),
    isPublished: project.status === 'published',
  };
}

/**
 * CAP-PLAT-04e — map a legacy `projectId` candidate to a House id.
 *
 * Dual-read order:
 * 1. Gen1 / embed objectId alias → House id
 * 2. Existing House row id → itself
 * 3. Canonical Project id → first published House under that Project
 * 4. otherwise null (fail closed)
 */
export function resolveBindHouseId(
  objectOrProjectId: string | null | undefined,
): string | null {
  if (
    objectOrProjectId === undefined ||
    objectOrProjectId === null ||
    objectOrProjectId.trim().length === 0
  ) {
    return null;
  }

  const normalized = normalizeProjectIdCandidate(objectOrProjectId);
  if (getSharedProject(normalized) !== null) {
    return normalized;
  }

  const registry = getDefaultCompanyRegistry();
  const delivery = registry.canonicalProjects.find(
    (project) => project.id === normalized,
  );
  if (delivery === undefined) {
    return null;
  }

  const published = listPublishedProjects();
  if (delivery.id === DSE_CANONICAL_PROJECT_ID) {
    const canonicalReference = published.find(
      (shared) => shared.id === DSE_CANONICAL_REFERENCE_HOUSE_ID,
    );
    return canonicalReference?.id ?? null;
  }
  const linked = published.find((shared) => {
    const row = registry.projects.find((item) => item.id === shared.id);
    return row?.canonicalProjectId === delivery.id;
  });
  return linked?.id ?? null;
}

/**
 * Resolve active session / URL projectId (House or Canonical Project alias).
 * PT-PDM-03 — an explicit unknown id returns null (no silent package swap).
 * Only when `projectId` is empty does the Runtime fall back to the first published House.
 */
export function resolveActiveProjectView(
  projectId: string | null | undefined,
): SharedProjectRuntimeView | null {
  if (typeof projectId === 'string' && projectId.trim().length > 0) {
    const houseId = resolveBindHouseId(projectId);
    if (houseId === null) return null;
    return openProject(houseId);
  }
  const published = listPublishedProjects();
  const first = published[0];
  if (first === undefined) {
    const any = listSharedProjects()[0];
    return any === undefined ? null : openProject(any.id);
  }
  return openProject(first.id);
}

/**
 * PT-PDM-03 — Map Embed/Gen1 objectId aliases onto House ids.
 * Production mount ids must resolve through Shared Project Runtime.
 */
export const LEGACY_OBJECT_ID_TO_PROJECT_ID: Readonly<Record<string, string>> =
  Object.freeze({
    'house-modern-01': DEFAULT_PROJECT_ID,
  });

export function normalizeProjectIdCandidate(objectOrProjectId: string): string {
  const trimmed = objectOrProjectId.trim();
  return LEGACY_OBJECT_ID_TO_PROJECT_ID[trimmed] ?? trimmed;
}

/**
 * Resolve Embed / Client mount `objectId` to a Shared Project Runtime view.
 * Empty → first published House.
 * Legacy Gen1 objectId / House id / Canonical Project id → House view (CAP-PLAT-04e).
 * Unknown → null (caller must fail closed).
 */
export function resolveMountProjectView(
  objectOrProjectId: string | null | undefined,
): SharedProjectRuntimeView | null {
  if (
    objectOrProjectId === undefined ||
    objectOrProjectId === null ||
    objectOrProjectId.trim().length === 0
  ) {
    return resolveActiveProjectView(null);
  }
  const houseId = resolveBindHouseId(objectOrProjectId);
  if (houseId === null) return null;
  return openProject(houseId);
}

export function listOpenablePublishedProjects(): readonly SharedProjectRuntimeView[] {
  return listPublishedProjects()
    .map((project) => openProject(project.id))
    .filter((view): view is SharedProjectRuntimeView => view !== null);
}
