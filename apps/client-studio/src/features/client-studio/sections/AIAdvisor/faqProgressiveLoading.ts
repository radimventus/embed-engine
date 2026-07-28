/** Progressive FAQ reveal helpers (CAP UX 48 / RACIO 05) — UI-only, no content logic. */

export const FAQ_VISIBLE_PAGE_SIZE = 3;

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
