import type { PriorityId } from "./PriorityProfile";

/**
 * Deterministic Priority Signal kinds produced by the Signal Engine.
 * Interpretation Rules consume these — never UI priority widgets.
 */
export type PrioritySignalKind =
  | "emphasize-value"
  | "emphasize-outdoor"
  | "emphasize-space"
  | "emphasize-privacy"
  | "priority-generic";

/**
 * Machine signal emitted from a Priority Profile entry.
 */
export type PrioritySignal = {
  readonly id: string;
  readonly kind: PrioritySignalKind;
  readonly priorityId: PriorityId;
  readonly rank: number;
  /**
   * Relative strength in (0, 1]. Strongest rank → 1.
   * strength = (n - rank + 1) / n for n entries; empty profile → no signals.
   */
  readonly strength: number;
};

/** Catalog: known priority ids → signal kinds. */
export const PRIORITY_SIGNAL_KIND_BY_ID: Readonly<
  Record<string, PrioritySignalKind>
> = Object.freeze({
  price: "emphasize-value",
  garden: "emphasize-outdoor",
  space: "emphasize-space",
  privacy: "emphasize-privacy",
});

export function resolvePrioritySignalKind(
  priorityId: PriorityId,
): PrioritySignalKind {
  return PRIORITY_SIGNAL_KIND_BY_ID[priorityId] ?? "priority-generic";
}
