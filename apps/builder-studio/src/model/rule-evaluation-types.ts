/**
 * Rule Evaluation Engine (EPIC-BLD-17).
 * Deterministic rule evaluation over DecisionModel — no Story, Runtime, or AI.
 */

export type EvaluationTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EvaluationMetadata = {
  readonly title: string;
  readonly description: string;
};

export type RuleResultStatus = 'Passed' | 'Failed' | 'Skipped';

export type RuleResult = {
  readonly ruleId: string;
  readonly status: RuleResultStatus;
  readonly score: number;
  readonly matchedSignals: readonly string[];
  readonly reason: string;
  readonly metadata: {
    readonly condition: string;
    readonly outcome: string;
  };
};

export type EvaluationSummary = {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly averageScore: number;
};

export type EvaluationResult = {
  readonly id: string;
  readonly decisionModelId: string;
  readonly ruleResults: readonly RuleResult[];
  readonly summary: EvaluationSummary;
  readonly metadata: EvaluationMetadata;
  readonly timestamps: EvaluationTimestamps;
};

export type EvaluationContext = {
  readonly knowledge: {
    readonly knowledgeId: string | null;
    readonly factIds: readonly string[];
    readonly faqIds: readonly string[];
  };
  readonly decisionKnowledge: {
    readonly decisionKnowledgeId: string | null;
    readonly ruleIds: readonly string[];
  };
  readonly signals: readonly {
    readonly id: string;
    readonly source: string;
    readonly label: string;
    readonly type: string;
    readonly importance: number;
  }[];
  readonly priorities: readonly string[];
  readonly metadata: {
    readonly objectId: string;
    readonly notes: string;
  };
};

export type EvaluableRule = {
  readonly id: string;
  readonly condition: string;
  readonly outcome: string;
  readonly priority: number;
  readonly weight: number;
};

export type RuleEvaluationInput = {
  readonly decisionModelId: string;
  readonly objectId: string;
  readonly title?: string;
  readonly context: EvaluationContext;
  readonly rules: readonly EvaluableRule[];
};

export type EvaluationEventType =
  | 'EvaluationStarted'
  | 'RuleEvaluated'
  | 'EvaluationCompleted';

export type EvaluationEvent = {
  readonly eventId: string;
  readonly type: EvaluationEventType;
  readonly evaluationId: string;
  readonly decisionModelId: string;
  readonly at: string;
  readonly message: string;
};
