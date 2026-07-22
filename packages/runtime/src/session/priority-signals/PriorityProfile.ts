/**
 * Priority Profile — ordered user intent input (CAP-PRI-001).
 * Derived from Runtime State priorityIds — never from UI widgets.
 */

export type PriorityId = string;

export type PriorityProfileEntry = {
  readonly priorityId: PriorityId;
  /** 1 = strongest preference. */
  readonly rank: number;
};

export type PriorityProfile = {
  readonly entries: readonly PriorityProfileEntry[];
};

/**
 * Build a frozen Priority Profile from Runtime priority ids (order = preference).
 */
export function createPriorityProfile(
  priorityIds: readonly string[],
): PriorityProfile {
  const entries = priorityIds.map((priorityId, index) =>
    Object.freeze({
      priorityId,
      rank: index + 1,
    }),
  );

  return Object.freeze({
    entries: Object.freeze(entries),
  });
}
