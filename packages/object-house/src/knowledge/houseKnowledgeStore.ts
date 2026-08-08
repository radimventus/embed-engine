/**
 * CAP-REF-03 — House Knowledge store.
 * Keyed exclusively by House id; no Project or Studio state participates.
 */

import { REFERENCE_HOUSE_ID } from '../specification/houseSpecificationTypes';
import type { HouseKnowledgeAtom } from './houseKnowledgeTypes';

const byHouseId = new Map<string, Map<string, HouseKnowledgeAtom>>();

function normalizeHouseId(houseId: string): string {
  return houseId.trim();
}

/**
 * Returns the canonical atoms for one House. An unknown House has no Knowledge.
 */
export function getHouseKnowledge(
  houseId: string,
): readonly HouseKnowledgeAtom[] {
  const normalizedHouseId = normalizeHouseId(houseId);
  if (normalizedHouseId.length === 0) return [];
  return [...(byHouseId.get(normalizedHouseId)?.values() ?? [])];
}

export function listHouseKnowledge(
  houseId: string,
): readonly HouseKnowledgeAtom[] {
  return getHouseKnowledge(houseId);
}

/**
 * Registers the identity-only MODERN 4KK Knowledge collection.
 * It deliberately creates no factual atoms before CAP-REF-05 ingest.
 */
export function ensureReferenceHouseKnowledge(): readonly HouseKnowledgeAtom[] {
  if (!byHouseId.has(REFERENCE_HOUSE_ID)) {
    byHouseId.set(REFERENCE_HOUSE_ID, new Map());
  }
  return getHouseKnowledge(REFERENCE_HOUSE_ID);
}

/**
 * Deterministically replaces one atom only within its House collection.
 */
export function upsertHouseKnowledgeAtom(
  atom: HouseKnowledgeAtom,
): HouseKnowledgeAtom {
  const houseId = normalizeHouseId(atom.houseId);
  const id = atom.id.trim();
  if (houseId.length === 0) {
    throw new Error('upsertHouseKnowledgeAtom: houseId is required');
  }
  if (id.length === 0) {
    throw new Error('upsertHouseKnowledgeAtom: id is required');
  }

  const next: HouseKnowledgeAtom = { ...atom, id, houseId };
  const atoms = byHouseId.get(houseId) ?? new Map<string, HouseKnowledgeAtom>();
  atoms.set(id, next);
  byHouseId.set(houseId, atoms);
  return next;
}

/**
 * Upserts atoms by their id without deleting unrelated atoms for each House.
 */
export function upsertHouseKnowledge(
  atoms: readonly HouseKnowledgeAtom[],
): readonly HouseKnowledgeAtom[] {
  for (const atom of atoms) {
    upsertHouseKnowledgeAtom(atom);
  }
  return atoms;
}

/** Test / reset helper — clears all House Knowledge collections. */
export function resetHouseKnowledgeForTests(): void {
  byHouseId.clear();
}
