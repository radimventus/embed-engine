/**
 * Decision Layer — Runtime MVP types.
 * Vocabulary SSOT: docs/architecture/decision-layer/README.md
 */
export type MoveIntent =
  | "confirm"
  | "discover"
  | "interpret"
  | "compare"
  | "recommend";

export type MoveSlotStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "deferred";

export type DecisionOutcomeStatus =
  | "strong-fit"
  | "conditional-fit"
  | "weak-fit"
  | "in-progress";

export type DecisionMoveDefinition = {
  readonly id: string;
  readonly intent: MoveIntent;
  readonly purpose: string;
  /** Advisor language for Decision Terminal (Experience projection of Pack meaning). */
  readonly advisorPrompt: string;
  readonly tradeOff?: string;
  /** Optional Terminal primary CTA label (Pack presentation). */
  readonly ctaLabel?: string;
  /** Optional reactive “why now” line (Pack presentation). */
  readonly whyNow?: string;
};

export type DecisionMoveSlot = {
  readonly moveId: string;
  readonly status: MoveSlotStatus;
};

export type DecisionOutcome = {
  readonly status: DecisionOutcomeStatus;
  readonly summary: string;
};

/**
 * Strategy output — ordered Moves + cursor. Not an Interpretation field.
 */
export type DecisionStory = {
  readonly id: string;
  readonly packId: string;
  readonly slots: readonly DecisionMoveSlot[];
  readonly activeMoveId: string | null;
  readonly outcome: DecisionOutcome | null;
};

export type DecisionStoryComposeInput = {
  readonly interpretationActiveTopic: string;
  readonly focusQuestionId?: string;
  readonly focusRoomId?: string;
  readonly focusFloorId?: string;
  readonly focusMediaId?: string;
  readonly signalType: string;
  readonly signalPayload: Readonly<Record<string, unknown>>;
  /** Session DecisionState facts (e.g. household.profile) — not persisted. */
  readonly facts?: Readonly<Record<string, unknown>>;
  readonly previous: DecisionStory | null;
};
