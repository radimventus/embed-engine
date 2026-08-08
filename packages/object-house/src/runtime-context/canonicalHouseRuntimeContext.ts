/**
 * CAP-REF-07b — Read projection over canonical House sources.
 * This context is not a new store and never requires legacy HousePackage data.
 */

import {
  bootstrapModern4kkReferenceContent,
} from '../reference/modern4kkContentBootstrap';
import {
  REFERENCE_HOUSE_ID,
  type HouseSpecification,
} from '../specification/houseSpecificationTypes';
import { getHouseSpecification } from '../specification/houseSpecificationStore';
import type { HouseKnowledgeAtom } from '../knowledge/houseKnowledgeTypes';
import { listHouseKnowledge } from '../knowledge/houseKnowledgeStore';
import type { HousePriorityFaqItem } from '../priority-faq/housePriorityFaqTypes';
import { listHousePriorityFaq } from '../priority-faq/housePriorityFaqStore';

export type CanonicalHouseRuntimeContext = {
  readonly identity: {
    readonly houseId: string;
  };
  readonly specification: HouseSpecification;
  readonly knowledge: readonly HouseKnowledgeAtom[];
  readonly priorityFaq: readonly HousePriorityFaqItem[];
};

/**
 * Resolves a House-keyed runtime read model without creating a second SSOT.
 * MODERN 4KK bootstraps deterministically from repository-backed REF-05 data.
 */
export function getCanonicalHouseRuntimeContext(
  houseId: string,
): CanonicalHouseRuntimeContext | null {
  const normalizedHouseId = houseId.trim();
  if (normalizedHouseId.length === 0) return null;

  if (normalizedHouseId === REFERENCE_HOUSE_ID) {
    bootstrapModern4kkReferenceContent();
  }

  const specification = getHouseSpecification(normalizedHouseId);
  if (specification === null) return null;

  return {
    identity: { houseId: specification.identity.houseId },
    specification,
    knowledge: listHouseKnowledge(normalizedHouseId),
    priorityFaq: listHousePriorityFaq(normalizedHouseId),
  };
}
