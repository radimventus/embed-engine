import type { RecommendedMediaRole } from "../interpretation";

/**
 * Decision Focus — canonical attention entry point for the Experience (CAP-PRI-002).
 * Deterministic semantic object — never UI state, never AI.
 */
export type DecisionFocus = {
  readonly focusRoomId: string | null;
  readonly focusRoomName: string | null;
  readonly focusReason: string;
  /** Strongest priority id driving this focus, if any. */
  readonly focusPriorityId: string | null;
  /** Strongest priority signal kind, if any. */
  readonly focusSignalKind: string | null;
  /** Deterministic confidence in [0, 1], two decimal places. */
  readonly confidence: number;
  /** Machine action key for guided decision flow. */
  readonly recommendedAction: string;
  /** Preferred media role for Gallery / Media Explorer ordering. */
  readonly recommendedMediaRole: RecommendedMediaRole;
};
