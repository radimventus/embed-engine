/**
 * Decision Runtime Foundation (EPIC-BLD-16 / Runtime layer).
 * Prepares an executable representation from DecisionModel.
 * No evaluation, session, Story, AI, or persistence.
 */

export type DecisionRuntimeTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RuntimeState = 'Initialized' | 'Ready' | 'Disposed';

export type RuntimeModelMetadata = {
  readonly title: string;
  readonly description: string;
  readonly objectId: string;
};

export type RuntimeContextInputs = {
  readonly knowledgeId: string | null;
  readonly decisionKnowledgeId: string | null;
  readonly experienceId: string | null;
  readonly learningId: string | null;
};

export type RuntimeContext = {
  readonly inputs: RuntimeContextInputs;
  readonly environment: {
    readonly mode: 'builder-preview';
    readonly readonly: true;
  };
  readonly configuration: {
    readonly evaluateRules: false;
    readonly evaluateSignals: false;
    readonly enableStory: false;
    readonly enableAi: false;
  };
  readonly metadata: {
    readonly notes: string;
  };
};

export type RuntimeGraphNode = {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly sourceId: string;
};

export type RuntimeGraphEdge = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly relation: string;
};

export type RuntimeGraph = {
  readonly nodes: readonly RuntimeGraphNode[];
  readonly edges: readonly RuntimeGraphEdge[];
  readonly metadata: {
    readonly title: string;
    readonly nodeCount: number;
    readonly edgeCount: number;
    readonly projectedFrom: string;
  };
};

/**
 * Executable preparation model — data only, no evaluation.
 */
export type RuntimeModel = {
  readonly id: string;
  readonly decisionModelId: string;
  readonly status: RuntimeState;
  readonly graph: RuntimeGraph;
  readonly context: RuntimeContext;
  readonly metadata: RuntimeModelMetadata;
  readonly timestamps: DecisionRuntimeTimestamps;
  readonly validation: RuntimeValidation | null;
};

export type RuntimeValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeValidationIssue[];
  readonly validatedAt: string;
};

export type CreateRuntimeInput = {
  readonly decisionModelId: string;
  readonly objectId: string;
  readonly title?: string;
  readonly knowledgeId?: string | null;
  readonly decisionKnowledgeId?: string | null;
  readonly experienceId?: string | null;
  readonly learningId?: string | null;
  readonly graph: {
    readonly nodes: readonly {
      readonly id: string;
      readonly type: string;
      readonly label: string;
      readonly sourceId: string;
    }[];
    readonly edges: readonly {
      readonly id: string;
      readonly from: string;
      readonly to: string;
      readonly relation: string;
    }[];
  };
};

export type DecisionRuntimeEventType =
  | 'RuntimeCreated'
  | 'RuntimeValidated'
  | 'RuntimeDisposed';

export type DecisionRuntimeEvent = {
  readonly eventId: string;
  readonly type: DecisionRuntimeEventType;
  readonly runtimeId: string;
  readonly decisionModelId: string;
  readonly at: string;
  readonly message: string;
};
