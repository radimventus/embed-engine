/**
 * Decision Outcome — canonical semantic conclusion of Move execution (CAP-OUT-001 / PT-008).
 * Deterministic Runtime artifact — never UI, never AI authorship.
 *
 * Invariant: Outcome is composed exclusively from DecisionMoveSequence.
 * Forbidden: Interpretation → Outcome, Story → Outcome, Presentation → Outcome.
 */

export const DECISION_OUTCOME_SCHEMA_VERSION = 1 as const;

export type DecisionOutcomeStatus =
  | "in-progress"
  | "strong-fit"
  | "conditional-fit"
  | "weak-fit";

/**
 * Provenance pointing at the Move sequence that authored this Outcome.
 */
export type DecisionOutcomeMoveRef = {
  readonly storyId: string;
  readonly activeMoveId: string | null;
  readonly moveIds: readonly string[];
  readonly moveCount: number;
};

/**
 * Canonical Decision Outcome model (Runtime-owned).
 */
export type DecisionOutcome = {
  /** Deterministic Outcome identity derived from Move sequence. */
  readonly id: string;
  readonly schemaVersion: typeof DECISION_OUTCOME_SCHEMA_VERSION;
  /** Parent Story id carried through Moves (not a Story→Outcome input). */
  readonly storyId: string;
  readonly moveRef: DecisionOutcomeMoveRef;
  readonly status: DecisionOutcomeStatus;
  /** Current recommendation key. */
  readonly recommendation: string;
  /** Deterministic confidence in [0, 1], two decimal places. */
  readonly confidence: number;
  /** Ordered supporting rationale keys from Moves. */
  readonly rationale: readonly string[];
  readonly completedMoveIds: readonly string[];
  readonly unresolvedMoveIds: readonly string[];
  /** Unresolved semantic questions (pending / deferred objectives). */
  readonly unresolvedQuestions: readonly string[];
  /** Recommended next action from the active or terminal Move. */
  readonly recommendedNextAction: string;
};

/**
 * Public contract for Terminal, AI, CRM, and integrations.
 * Presentation consumes Outcome; never composes it.
 */
export type DecisionOutcomeContract = DecisionOutcome;
