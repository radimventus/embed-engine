/**
 * CAP-REF-02 — House Specification store (House-owned SSOT foundation).
 * Keyed by houseId. Independent of Studio-local state and Project documents.
 */

import type { HouseSpecification } from './houseSpecificationTypes';
import {
  REFERENCE_COMPANY_ID,
  REFERENCE_HOUSE_ID,
  REFERENCE_HOUSE_NAME,
  REFERENCE_HOUSE_SLUG,
  REFERENCE_PROJECT_ID,
} from './houseSpecificationTypes';

const byHouseId = new Map<string, HouseSpecification>();

/**
 * Identity-only shell for MODERN 4KK — no invented product values.
 * Optional categories omitted (valid empty optional specification).
 */
export function createReferenceHouseSpecificationShell(): HouseSpecification {
  return {
    identity: {
      houseId: REFERENCE_HOUSE_ID,
      name: REFERENCE_HOUSE_NAME,
      slug: REFERENCE_HOUSE_SLUG,
      objectType: 'villa',
      canonicalProjectId: REFERENCE_PROJECT_ID,
      companyId: REFERENCE_COMPANY_ID,
      status: 'draft',
      role: 'reference',
    },
  };
}

export function ensureReferenceHouseSpecification(): HouseSpecification {
  const existing = byHouseId.get(REFERENCE_HOUSE_ID);
  if (existing !== undefined) return existing;
  const shell = createReferenceHouseSpecificationShell();
  byHouseId.set(REFERENCE_HOUSE_ID, shell);
  return shell;
}

export function getHouseSpecification(
  houseId: string,
): HouseSpecification | null {
  const normalized = houseId.trim();
  if (normalized.length === 0) return null;
  return byHouseId.get(normalized) ?? null;
}

/**
 * Upsert House Specification by identity.houseId.
 * Does not write Partner or Project records.
 */
export function upsertHouseSpecification(
  specification: HouseSpecification,
): HouseSpecification {
  const houseId = specification.identity.houseId.trim();
  if (houseId.length === 0) {
    throw new Error('upsertHouseSpecification: identity.houseId is required');
  }
  if (specification.identity.role === 'reference' && houseId !== REFERENCE_HOUSE_ID) {
    throw new Error(
      'upsertHouseSpecification: only modern-4kk may have role "reference"',
    );
  }
  const next: HouseSpecification = {
    ...specification,
    identity: {
      ...specification.identity,
      houseId,
    },
  };
  byHouseId.set(houseId, next);
  return next;
}

/**
 * Patch optional categories without changing House / Partner / Project identity.
 */
export function updateHouseSpecificationCategories(
  houseId: string,
  patch: Omit<Partial<HouseSpecification>, 'identity'>,
): HouseSpecification | null {
  const current = getHouseSpecification(houseId);
  if (current === null) return null;
  const next: HouseSpecification = {
    ...current,
    ...patch,
    identity: current.identity,
  };
  byHouseId.set(current.identity.houseId, next);
  return next;
}

export function listHouseSpecificationIds(): readonly string[] {
  return [...byHouseId.keys()];
}

/** Test / reset helper — clears all House Specifications. */
export function resetHouseSpecificationsForTests(): void {
  byHouseId.clear();
}
