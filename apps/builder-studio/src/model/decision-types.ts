/**
 * Decision Knowledge (EPIC-BLD-12).
 * Authoring model for how to interpret object knowledge in decisions.
 * Not Knowledge Package. No evaluation, no Runtime, no AI, no Story.
 */

export type DecisionTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DecisionKnowledgeMetadata = {
  readonly title: string;
  readonly description: string;
  readonly status: 'Draft' | 'Active' | 'Archived';
};

export type DecisionRule = {
  readonly id: string;
  readonly condition: string;
  readonly outcome: string;
  readonly priority: number;
  readonly weight: number;
  readonly metadata: {
    readonly notes: string;
  };
};

export type DecisionSignalSource =
  | 'priority'
  | 'faq'
  | 'navigation'
  | 'ai'
  | 'form';

export type DecisionSignalType =
  | 'intent'
  | 'constraint'
  | 'preference'
  | 'risk'
  | 'opportunity';

export type DecisionSignal = {
  readonly id: string;
  readonly source: DecisionSignalSource;
  readonly type: DecisionSignalType;
  readonly importance: number;
  readonly tags: readonly string[];
  readonly label: string;
};

export type PriorityId =
  | 'energy'
  | 'layout'
  | 'privacy'
  | 'investment'
  | 'quality'
  | 'design'
  | 'maintenance'
  | 'flexibility'
  | 'operating-costs'
  | 'land';

export type PriorityDefinition = {
  readonly id: PriorityId;
  readonly label: string;
  readonly description: string;
};

export type DecisionStrategy = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetSignals: readonly string[];
  readonly metadata: {
    readonly notes: string;
  };
};

/**
 * Decision Knowledge Package — authoring only.
 * Belonging to Object Package, separate from Knowledge Package.
 */
export type DecisionKnowledgePackage = {
  readonly id: string;
  readonly objectId: string;
  readonly version: string;
  readonly decisionRules: readonly DecisionRule[];
  readonly decisionSignals: readonly DecisionSignal[];
  readonly priorities: readonly PriorityId[];
  readonly strategies: readonly DecisionStrategy[];
  readonly metadata: DecisionKnowledgeMetadata;
  readonly timestamps: DecisionTimestamps;
};

export type CreateDecisionKnowledgeInput = {
  readonly objectId: string;
  readonly title?: string;
  readonly description?: string;
};

export type UpdateDecisionKnowledgeInput = {
  readonly title?: string;
  readonly description?: string;
  readonly status?: DecisionKnowledgeMetadata['status'];
};

export type AddDecisionRuleInput = {
  readonly condition: string;
  readonly outcome: string;
  readonly priority?: number;
  readonly weight?: number;
  readonly notes?: string;
};

export type AddDecisionSignalInput = {
  readonly source: DecisionSignalSource;
  readonly type?: DecisionSignalType;
  readonly importance?: number;
  readonly tags?: readonly string[];
  readonly label: string;
};

export type AddDecisionStrategyInput = {
  readonly title: string;
  readonly description: string;
  readonly targetSignals?: readonly string[];
  readonly notes?: string;
};

export type DecisionEventType =
  | 'RuleAdded'
  | 'SignalAdded'
  | 'StrategyAdded'
  | 'PriorityRegistered';

export type DecisionEvent = {
  readonly eventId: string;
  readonly type: DecisionEventType;
  readonly decisionKnowledgeId: string;
  readonly objectId: string;
  readonly at: string;
  readonly message: string;
};
