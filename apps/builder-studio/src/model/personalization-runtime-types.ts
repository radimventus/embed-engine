/**
 * Personalization Runtime Engine (EPIC-BLD-30).
 * Projects AI Context + session/behavior/priority profiles into
 * Personalized Decision Context — no LLM, no Knowledge mutation.
 */

export type PersonalizationProjection = {
  readonly knowledgeEntryId: string;
  readonly reason: string;
  readonly weight: number;
  readonly priority: number;
  readonly metadata: {
    readonly notes: string;
  };
};

export type PersonalizedDecisionContext = {
  readonly id: string;
  readonly sessionId: string;
  readonly priorityProfile: readonly string[];
  readonly behaviorProfile: readonly string[];
  readonly knowledgeEntries: readonly string[];
  readonly ranking: readonly PersonalizationProjection[];
  readonly confidence: number;
  readonly metadata: {
    readonly projectorId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
    readonly decisionProfile: string;
  };
  readonly createdAt: string;
};

export type PersonalizedContextPackage = {
  readonly id: string;
  readonly version: string;
  readonly context: PersonalizedDecisionContext;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly aiContextPackageId: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: PersonalizationRuntimeValidation | null;
};

export type PersonalizationRuntimeValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PersonalizationRuntimeValidation = {
  readonly valid: boolean;
  readonly issues: readonly PersonalizationRuntimeValidationIssue[];
  readonly validatedAt: string;
};

export type ProjectDecisionContextInput = {
  readonly aiContextPackageId: string;
  readonly aiContextTitle: string;
  readonly sessionId: string;
  readonly title?: string;
  readonly decisionProfile?: string;
  readonly priorityProfile?: readonly string[];
  readonly behaviorProfile?: readonly string[];
  readonly knowledgeEntries: readonly {
    readonly id: string;
    readonly confidence: number;
  }[];
  readonly sessionState?: string;
  readonly behaviorSignals?: readonly string[];
};

export type PersonalizationRuntimeIndexEntry = {
  readonly packageId: string;
  readonly contextId: string;
  readonly sessionId: string;
  readonly confidence: number;
  readonly entryCount: number;
};

export type PersonalizationRuntimeEventType =
  | 'PersonalizedContextCreated'
  | 'PersonalizedContextValidated'
  | 'PersonalizedContextPublished'
  | 'PersonalizedContextIndexed';

export type PersonalizationRuntimeEvent = {
  readonly eventId: string;
  readonly type: PersonalizationRuntimeEventType;
  readonly packageId: string;
  readonly contextId: string | null;
  readonly at: string;
  readonly message: string;
};
