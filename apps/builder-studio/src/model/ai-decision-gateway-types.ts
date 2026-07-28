/**
 * AI Decision Gateway (EPIC-BLD-28).
 * Prepares auditable AI Context from Knowledge Base — no LLM calls.
 *
 * Note: Spec AIContext / AIContextPackage clash with BLD-13 types.
 * TypeScript uses GatewayAIContext / GatewayAIContextPackage.
 */

export type GatewayAIContextReference = {
  readonly knowledgeEntryId: string;
  readonly relationship: 'includes' | 'supports' | 'filtered-from';
  readonly weight: number;
  readonly metadata: {
    readonly notes: string;
  };
};

export type GatewayAIContext = {
  readonly id: string;
  readonly knowledgeEntries: readonly string[];
  readonly references: readonly GatewayAIContextReference[];
  readonly confidence: number;
  readonly metadata: {
    readonly builderId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
    readonly maxEntries: number;
  };
  readonly createdAt: string;
};

export type GatewayAIContextPackage = {
  readonly id: string;
  readonly version: string;
  readonly context: GatewayAIContext;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly knowledgeBaseId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: GatewayAIContextValidation | null;
};

export type GatewayAIContextValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type GatewayAIContextValidation = {
  readonly valid: boolean;
  readonly issues: readonly GatewayAIContextValidationIssue[];
  readonly validatedAt: string;
};

export type BuildGatewayAIContextInput = {
  readonly knowledgeBaseId: string;
  readonly knowledgeBaseTitle: string;
  readonly title?: string;
  readonly maxEntries?: number;
  readonly minConfidence?: number;
  readonly entries: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly confidence: number;
    readonly sourceHeuristics: readonly string[];
  }[];
};

export type GatewayAIContextIndexEntry = {
  readonly packageId: string;
  readonly contextId: string;
  readonly knowledgeBaseId: string;
  readonly confidence: number;
  readonly entryCount: number;
};

export type AIDecisionGatewayEventType =
  | 'AIContextBuilt'
  | 'AIContextValidated'
  | 'AIContextPublished'
  | 'AIContextIndexed';

export type AIDecisionGatewayEvent = {
  readonly eventId: string;
  readonly type: AIDecisionGatewayEventType;
  readonly packageId: string;
  readonly contextId: string | null;
  readonly at: string;
  readonly message: string;
};
