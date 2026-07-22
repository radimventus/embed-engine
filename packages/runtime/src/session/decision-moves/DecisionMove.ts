/**
 * Decision Move — atomic semantic progression unit (CAP-DST-002 / PT-005).
 * Deterministic Runtime artifact — never UI, never AI authorship.
 *
 * Invariant: Moves exist only as a decomposition of a Decision Story.
 * Composition input is DecisionStory alone — never Interpretation / Focus / Signals.
 */

export const DECISION_MOVE_SCHEMA_VERSION = 1 as const;

export type DecisionMoveStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "deferred";

/**
 * Single Decision Move — meaning step within a Story.
 */
export type DecisionMove = {
  /** Deterministic Move identity: storyId + order + chapter key. */
  readonly id: string;
  /** Parent Story — Moves MUST NOT exist without this. */
  readonly storyId: string;
  readonly order: number;
  /** Semantic objective (machine-readable). */
  readonly objective: string;
  /** Required semantic context keys for this step. */
  readonly requiredContext: readonly string[];
  /** Recommended Runtime / Experience action key. */
  readonly recommendedAction: string;
  /** Machine-readable completion criteria. */
  readonly completionCriteria: string;
  /** Next Move in the Story sequence, if any. */
  readonly successorMoveId: string | null;
  readonly status: DecisionMoveStatus;
  /** Source Story chapter kind. */
  readonly chapterKind: string;
  /** Source Story chapter key. */
  readonly chapterKey: string;
};

/**
 * Ordered Move sequence derived from one Decision Story.
 */
export type DecisionMoveSequence = {
  readonly schemaVersion: typeof DECISION_MOVE_SCHEMA_VERSION;
  /** Parent Story identity — sole semantic parent. */
  readonly storyId: string;
  readonly moves: readonly DecisionMove[];
  /** Cursor — active Move in the sequence. */
  readonly activeMoveId: string | null;
};

/**
 * Public contract for Experience modules.
 * Presentation consumes Moves; never composes them.
 */
export type DecisionMoveContract = DecisionMoveSequence;
