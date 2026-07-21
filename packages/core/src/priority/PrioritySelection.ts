/**
 * Priority Domain Model §2.3 — PrioritySelection.
 *
 * User-expressed decision intent (lens).
 * Must not contain Interpretation, Experience, or object quality claims.
 *
 * Open Question DM-OQ-02: per-priority weights are not required on Journey
 * PrioritySelection until product/ADR clarifies placement vs Cognitive projections.
 *
 * Open Question DM-OQ-03 (Deferred MVP / Needs ADR): multi-id composition /
 * precedence when more than one id is selected. MVP assumes one dominant lens.
 */

export type PrioritySelection = {
  readonly selectedPriorityIds: readonly string[];
  /** MVP: one dominant lens per Journey run (Blueprint). */
  readonly dominantPriorityId: string;
};
