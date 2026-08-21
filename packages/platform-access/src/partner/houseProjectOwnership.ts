import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import {
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
} from '../reference/referenceSourceRegistry';

/**
 * Server-owned House ↔ Project ownership.
 *
 * Authorization uses canonical technical identity:
 * registry row, project-scoped reference instance id, or project-scoped draft id.
 * Never display name, package root, or browser extras alone.
 */
export function houseIdentityBelongsToAuthorizedProject(
  houseId: string,
  scope: {
    readonly companyId: string;
    readonly projectId: string;
  },
): boolean {
  const normalizedHouseId = houseId.trim();
  const companyId = scope.companyId.trim();
  const projectId = scope.projectId.trim();
  if (
    normalizedHouseId.length === 0 ||
    companyId.length === 0 ||
    projectId.length === 0
  ) {
    return false;
  }

  const registryHouse = getDefaultCompanyRegistry().projects.find(
    (house) => house.id === normalizedHouseId,
  );
  if (
    registryHouse !== undefined &&
    registryHouse.companyId === companyId &&
    registryHouse.canonicalProjectId === projectId
  ) {
    return true;
  }

  try {
    if (
      deriveReferenceInstanceHouseId({
        sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
        companyId,
        projectId,
      }) === normalizedHouseId
    ) {
      return true;
    }
  } catch {
    // Invalid canonical id parts — still allow a well-formed draft identity below.
  }

  const draftPrefix = `draft-${companyId}-${projectId}-`;
  if (!normalizedHouseId.startsWith(draftPrefix)) {
    return false;
  }
  const houseSlug = normalizedHouseId.slice(draftPrefix.length);
  try {
    return (
      derivePartnerDraftHouseId({
        companyId,
        projectId,
        houseSlug,
      }) === normalizedHouseId
    );
  } catch {
    return false;
  }
}
