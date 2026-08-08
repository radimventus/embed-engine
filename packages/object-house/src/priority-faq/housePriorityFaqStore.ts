/**
 * CAP-REF-04 — House Priority FAQ store.
 * Keyed exclusively by House id; no Project or Studio state participates.
 */

import { REFERENCE_HOUSE_ID } from '../specification/houseSpecificationTypes';
import type {
  HousePriority,
  HousePriorityFaqItem,
} from './housePriorityFaqTypes';

const byHouseId = new Map<string, Map<string, HousePriorityFaqItem>>();

function normalizeHouseId(houseId: string): string {
  return houseId.trim();
}

export function listHousePriorityFaq(
  houseId: string,
): readonly HousePriorityFaqItem[] {
  const normalizedHouseId = normalizeHouseId(houseId);
  if (normalizedHouseId.length === 0) return [];
  return [...(byHouseId.get(normalizedHouseId)?.values() ?? [])];
}

export function listHousePriorityFaqByPriority(
  houseId: string,
  priority: HousePriority,
): readonly HousePriorityFaqItem[] {
  return listHousePriorityFaq(houseId).filter(
    (item) => item.priority === priority,
  );
}

export function getHousePriorityFaqItem(
  houseId: string,
  faqId: string,
): HousePriorityFaqItem | null {
  const normalizedHouseId = normalizeHouseId(houseId);
  const normalizedFaqId = faqId.trim();
  if (normalizedHouseId.length === 0 || normalizedFaqId.length === 0) {
    return null;
  }
  return byHouseId.get(normalizedHouseId)?.get(normalizedFaqId) ?? null;
}

/**
 * Registers the identity-only MODERN 4KK FAQ collection with no CAP-REF-05
 * content.
 */
export function ensureReferenceHousePriorityFaq(): readonly HousePriorityFaqItem[] {
  if (!byHouseId.has(REFERENCE_HOUSE_ID)) {
    byHouseId.set(REFERENCE_HOUSE_ID, new Map());
  }
  return listHousePriorityFaq(REFERENCE_HOUSE_ID);
}

/**
 * Deterministically replaces one FAQ item only within its House collection.
 */
export function upsertHousePriorityFaqItem(
  item: HousePriorityFaqItem,
): HousePriorityFaqItem {
  const houseId = normalizeHouseId(item.houseId);
  const id = item.id.trim();
  if (houseId.length === 0) {
    throw new Error('upsertHousePriorityFaqItem: houseId is required');
  }
  if (id.length === 0) {
    throw new Error('upsertHousePriorityFaqItem: id is required');
  }

  const next: HousePriorityFaqItem = { ...item, id, houseId };
  const items =
    byHouseId.get(houseId) ?? new Map<string, HousePriorityFaqItem>();
  items.set(id, next);
  byHouseId.set(houseId, items);
  return next;
}

/**
 * Upserts FAQ items by id without deleting unrelated items for each House.
 */
export function upsertHousePriorityFaq(
  items: readonly HousePriorityFaqItem[],
): readonly HousePriorityFaqItem[] {
  for (const item of items) {
    upsertHousePriorityFaqItem(item);
  }
  return items;
}

/** Test / reset helper — clears all House Priority FAQ collections. */
export function resetHousePriorityFaqForTests(): void {
  byHouseId.clear();
}
