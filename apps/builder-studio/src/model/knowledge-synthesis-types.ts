/**
 * Knowledge Synthesis Engine (EPIC-BLD-27).
 * Consolidates Heuristic Catalog into Knowledge Base — no AI / inference.
 *
 * Note: Spec KnowledgeReference clashes with BLD Knowledge Layers
 * KnowledgeReference — TypeScript uses SynthesizedKnowledgeReference.
 */

export type SynthesizedKnowledgeReference = {
  readonly heuristicId: string;
  readonly relationship: 'derived-from' | 'merged-from' | 'supports';
  readonly weight: number;
  readonly metadata: {
    readonly notes: string;
  };
};

export type KnowledgeEntry = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly confidence: number;
  readonly sourceHeuristics: readonly string[];
  readonly references: readonly SynthesizedKnowledgeReference[];
  readonly createdAt: string;
  readonly metadata: {
    readonly synthesizerId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
  };
};

export type SynthesizedKnowledgeBase = {
  readonly id: string;
  readonly version: string;
  readonly entries: readonly KnowledgeEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly catalogId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: KnowledgeSynthesisValidation | null;
};

export type KnowledgeSynthesisValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type KnowledgeSynthesisValidation = {
  readonly valid: boolean;
  readonly issues: readonly KnowledgeSynthesisValidationIssue[];
  readonly validatedAt: string;
};

export type SynthesizeKnowledgeInput = {
  readonly catalogId: string;
  readonly catalogTitle: string;
  readonly title?: string;
  readonly heuristics: readonly {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly confidence: number;
    readonly priority: number;
    readonly sourcePatterns: readonly string[];
  }[];
};

export type KnowledgeSynthesisIndexEntry = {
  readonly knowledgeBaseId: string;
  readonly entryId: string;
  readonly title: string;
  readonly confidence: number;
};

export type KnowledgeSynthesisEventType =
  | 'KnowledgeSynthesized'
  | 'KnowledgeMerged'
  | 'KnowledgeValidated'
  | 'KnowledgePublished';

export type KnowledgeSynthesisEvent = {
  readonly eventId: string;
  readonly type: KnowledgeSynthesisEventType;
  readonly knowledgeBaseId: string;
  readonly entryId: string | null;
  readonly at: string;
  readonly message: string;
};
