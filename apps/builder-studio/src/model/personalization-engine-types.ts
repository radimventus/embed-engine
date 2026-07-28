/**
 * Personalization Engine (EPIC-BLD-29).
 * Deterministic personalized projection of AI Context for a Decision Session.
 * Never mutates Knowledge / AI Context / Runtime. Never calls LLM.
 */

export type PersonalizationRule = {
  readonly id: string;
  readonly condition: string;
  readonly adjustment: string;
  readonly weight: number;
  readonly metadata: {
    readonly notes: string;
  };
};

export type PersonalizedRankingItem = {
  readonly knowledgeEntryId: string;
  readonly score: number;
  readonly rank: number;
};

export type PersonalizedContext = {
  readonly id: string;
  readonly sessionId: string;
  readonly priorityProfile: readonly string[];
  readonly knowledgeEntries: readonly string[];
  readonly ranking: readonly PersonalizedRankingItem[];
  readonly confidence: number;
  readonly createdAt: string;
  readonly metadata: {
    readonly strategyId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
    readonly appliedRules: readonly string[];
  };
};

export type PersonalizationPackage = {
  readonly id: string;
  readonly version: string;
  readonly context: PersonalizedContext;
  readonly rules: readonly PersonalizationRule[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly aiContextPackageId: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: PersonalizationValidation | null;
};

export type PersonalizationValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PersonalizationValidation = {
  readonly valid: boolean;
  readonly issues: readonly PersonalizationValidationIssue[];
  readonly validatedAt: string;
};

export type PersonalizeInput = {
  readonly aiContextPackageId: string;
  readonly aiContextTitle: string;
  readonly sessionId: string;
  readonly title?: string;
  readonly priorityProfile?: readonly string[];
  readonly knowledgeEntries: readonly {
    readonly id: string;
    readonly confidence: number;
  }[];
  readonly sessionState?: string;
  readonly currentMoveIndex?: number;
};

export type PersonalizationIndexEntry = {
  readonly packageId: string;
  readonly contextId: string;
  readonly sessionId: string;
  readonly confidence: number;
  readonly entryCount: number;
};

export type PersonalizationEngineEventType =
  | 'PersonalizationCreated'
  | 'PersonalizationValidated'
  | 'PersonalizationPublished'
  | 'PersonalizationIndexed';

export type PersonalizationEngineEvent = {
  readonly eventId: string;
  readonly type: PersonalizationEngineEventType;
  readonly packageId: string;
  readonly contextId: string | null;
  readonly at: string;
  readonly message: string;
};
