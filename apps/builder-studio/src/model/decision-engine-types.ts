/**
 * Decision Engine Foundation (EPIC-BLD-16).
 * Assembles a decision model from existing packages — no evaluation, Runtime, AI, or Story.
 */

export type DecisionEngineTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DecisionModelMetadata = {
  readonly title: string;
  readonly description: string;
  readonly status: 'Draft' | 'Validated' | 'Disposed';
};

export type DecisionNodeType =
  | 'knowledge'
  | 'priority'
  | 'rule'
  | 'signal'
  | 'experience';

export type DecisionNodeBase = {
  readonly id: string;
  readonly type: DecisionNodeType;
  readonly label: string;
  readonly sourceId: string;
};

export type KnowledgeNode = DecisionNodeBase & {
  readonly type: 'knowledge';
  readonly kind: 'fact' | 'entity' | 'faq' | 'document';
};

export type PriorityNode = DecisionNodeBase & {
  readonly type: 'priority';
  readonly priorityId: string;
};

export type RuleNode = DecisionNodeBase & {
  readonly type: 'rule';
  readonly condition: string;
  readonly outcome: string;
};

export type SignalNode = DecisionNodeBase & {
  readonly type: 'signal';
  readonly source: string;
  readonly signalType: string;
};

export type ExperienceNode = DecisionNodeBase & {
  readonly type: 'experience';
  readonly sceneId?: string;
  readonly moduleId?: string;
};

export type DecisionNode =
  | KnowledgeNode
  | PriorityNode
  | RuleNode
  | SignalNode
  | ExperienceNode;

export type DecisionEdge = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly relation: string;
};

export type DecisionGraph = {
  readonly nodes: readonly DecisionNode[];
  readonly edges: readonly DecisionEdge[];
  readonly metadata: {
    readonly title: string;
    readonly nodeCount: number;
    readonly edgeCount: number;
  };
};

export type DecisionModelInputs = {
  readonly knowledgeId: string | null;
  readonly decisionKnowledgeId: string | null;
  readonly experienceId: string | null;
  readonly learningId: string | null;
};

/**
 * Assembled decision model — data only, no evaluation.
 */
export type DecisionModel = {
  readonly id: string;
  readonly objectId: string;
  readonly knowledge: DecisionModelInputs['knowledgeId'];
  readonly decisionKnowledge: DecisionModelInputs['decisionKnowledgeId'];
  readonly experience: DecisionModelInputs['experienceId'];
  readonly learning: DecisionModelInputs['learningId'];
  readonly graph: DecisionGraph;
  readonly metadata: DecisionModelMetadata;
  readonly timestamps: DecisionEngineTimestamps;
  readonly validation: DecisionModelValidation | null;
};

export type DecisionModelValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type DecisionModelValidation = {
  readonly valid: boolean;
  readonly issues: readonly DecisionModelValidationIssue[];
  readonly validatedAt: string;
};

export type ResolvedDecisionInputs = {
  readonly knowledgeId: string | null;
  readonly decisionKnowledgeId: string | null;
  readonly experienceId: string | null;
  readonly learningId: string | null;
  readonly knowledgePresent: boolean;
  readonly decisionKnowledgePresent: boolean;
  readonly experiencePresent: boolean;
  readonly learningPresent: boolean;
};

export type BuildDecisionModelInput = {
  readonly objectId: string;
  readonly title?: string;
  readonly knowledgeId?: string | null;
  readonly decisionKnowledgeId?: string | null;
  readonly experienceId?: string | null;
  readonly learningId?: string | null;
  readonly knowledgeFacts?: readonly { readonly id: string; readonly title: string }[];
  readonly knowledgeFaqs?: readonly { readonly id: string; readonly question: string }[];
  readonly priorities?: readonly string[];
  readonly rules?: readonly {
    readonly id: string;
    readonly condition: string;
    readonly outcome: string;
  }[];
  readonly signals?: readonly {
    readonly id: string;
    readonly label: string;
    readonly source: string;
    readonly type: string;
  }[];
  readonly scenes?: readonly {
    readonly sceneId: string;
    readonly title: string;
    readonly modules: readonly string[];
  }[];
};

export type DecisionEngineEventType =
  | 'DecisionModelCreated'
  | 'DecisionModelValidated'
  | 'DecisionGraphBuilt';

export type DecisionEngineEvent = {
  readonly eventId: string;
  readonly type: DecisionEngineEventType;
  readonly decisionModelId: string;
  readonly objectId: string;
  readonly at: string;
  readonly message: string;
};
