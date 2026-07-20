/**
 * Decision Experience Interpretation.
 * One derived mind — Priority, FAQ, and AI are renderers only.
 */
export type InterpretationPriority = {
  readonly id: string;
  readonly weight: number;
  /** Rank among elevated priorities (1 = strongest). */
  readonly rank?: number;
  /** Short human explanation when this priority is elevated. */
  readonly reason?: string;
  /** True when this priority is currently emphasized by Focus. */
  readonly highlighted?: boolean;
};

/** Timeline entry projected from DecisionState.signals. */
export type InterpretationEvent = {
  readonly id: string;
  readonly label: string;
  readonly signalType: string;
  readonly timestamp: number;
};

/** FAQ / topic recommendation projected for the Decision Experience. */
export type RecommendedQuestion = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly topicId: string;
  readonly why: string;
  readonly highlighted: boolean;
};

export type Interpretation = {
  readonly priorities: readonly InterpretationPriority[];
  readonly events: readonly InterpretationEvent[];
  readonly recommendedQuestions: readonly RecommendedQuestion[];
  readonly conversationContext: string;
  readonly recommendations: readonly string[];
  readonly activeTopic: string;
  readonly nextAction: string;
};
