/**
 * Decision Story Composer (EPIC-BLD-18).
 * Domain model interpreting EvaluationResult — no UI, Runtime, or AI.
 */

export type StoryTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type StoryMetadata = {
  readonly title: string;
  readonly description: string;
};

export type DecisionMoveType =
  | 'insight'
  | 'recommendation'
  | 'action'
  | 'summary';

export type DecisionMove = {
  readonly id: string;
  readonly type: DecisionMoveType;
  readonly title: string;
  readonly description: string;
  readonly priority: number;
  readonly references: readonly string[];
  readonly metadata: {
    readonly ruleId: string | null;
    readonly status: string | null;
  };
};

export type StoryNodeType =
  | 'insight'
  | 'recommendation'
  | 'action'
  | 'summary';

export type StoryNode = {
  readonly id: string;
  readonly type: StoryNodeType;
  readonly label: string;
  readonly moveId: string;
};

/** Alias node kinds required by the epic naming. */
export type InsightNode = StoryNode & { readonly type: 'insight' };
export type RecommendationNode = StoryNode & { readonly type: 'recommendation' };
export type ActionNode = StoryNode & { readonly type: 'action' };
export type SummaryNode = StoryNode & { readonly type: 'summary' };

export type StoryEdge = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly relation: string;
};

/**
 * Story flow graph — not DecisionGraph (logical relations).
 */
export type StoryGraph = {
  readonly nodes: readonly StoryNode[];
  readonly edges: readonly StoryEdge[];
  readonly metadata: {
    readonly title: string;
    readonly nodeCount: number;
    readonly edgeCount: number;
  };
};

export type DecisionStorySummary = {
  readonly moveCount: number;
  readonly insightCount: number;
  readonly recommendationCount: number;
  readonly actionCount: number;
  readonly passedRules: number;
  readonly failedRules: number;
};

export type DecisionStory = {
  readonly id: string;
  readonly decisionModelId: string;
  readonly evaluationId: string;
  readonly moves: readonly DecisionMove[];
  readonly graph: StoryGraph;
  readonly summary: DecisionStorySummary;
  readonly metadata: StoryMetadata;
  readonly timestamps: StoryTimestamps;
  readonly validation: StoryValidation | null;
};

export type StoryValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type StoryValidation = {
  readonly valid: boolean;
  readonly issues: readonly StoryValidationIssue[];
  readonly validatedAt: string;
};

export type ComposeStoryInput = {
  readonly decisionModelId: string;
  readonly evaluationId: string;
  readonly title?: string;
  readonly ruleResults: readonly {
    readonly ruleId: string;
    readonly status: 'Passed' | 'Failed' | 'Skipped';
    readonly score: number;
    readonly matchedSignals: readonly string[];
    readonly reason: string;
    readonly condition: string;
    readonly outcome: string;
  }[];
  readonly evaluationSummary: {
    readonly passed: number;
    readonly failed: number;
    readonly skipped: number;
    readonly averageScore: number;
  };
};

export type StoryEventType =
  | 'StoryComposed'
  | 'StoryValidated'
  | 'MoveAdded';

export type StoryEvent = {
  readonly eventId: string;
  readonly type: StoryEventType;
  readonly storyId: string;
  readonly evaluationId: string;
  readonly at: string;
  readonly message: string;
};
