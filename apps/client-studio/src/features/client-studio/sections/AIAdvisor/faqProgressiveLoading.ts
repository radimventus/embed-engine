/** Progressive FAQ reveal helpers (CAP UX 48 / RACIO 05) — UI-only, no content logic. */

/** Approved Racio landing presentation: show the canonical five questions. */
export const FAQ_VISIBLE_PAGE_SIZE = 5;

export function initialFaqVisibleCount(
  total: number,
  pageSize: number = FAQ_VISIBLE_PAGE_SIZE,
): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(pageSize, total);
}

export function nextFaqVisibleCount(
  current: number,
  total: number,
  pageSize: number = FAQ_VISIBLE_PAGE_SIZE,
): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(Math.max(current, 0) + pageSize, total);
}

export function hasMoreFaqItems(visibleCount: number, total: number): boolean {
  return visibleCount < total;
}

export type FaqDatasetIdentityItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

/**
 * Stable semantic identity of an FAQ dataset.
 *
 * Runtime events such as OpenQuestion may cause the parent to create a fresh
 * array containing the same FAQ data. That must not reset progressive
 * visibility from 10/15/... back to the landing count.
 */
export function faqDatasetIdentity(
  items: readonly FaqDatasetIdentityItem[],
): string {
  return JSON.stringify(
    items.map((item) => [item.id, item.question, item.answer]),
  );
}
