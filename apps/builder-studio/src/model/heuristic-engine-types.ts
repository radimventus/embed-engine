/**
 * Heuristic Engine (EPIC-BLD-26).
 * Derives decision heuristics from Pattern Collection — no Knowledge / AI.
 *
 * Note: Spec name is Heuristic; TypeScript uses DerivedHeuristic to avoid clash
 * with BLD-15 Heuristic (learning package).
 */

export type HeuristicRule = {
  readonly id: string;
  readonly condition: string;
  readonly outcome: string;
  readonly weight: number;
  readonly metadata: {
    readonly notes: string;
  };
};

export type DerivedHeuristic = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly confidence: number;
  readonly priority: number;
  readonly sourcePatterns: readonly string[];
  readonly rules: readonly HeuristicRule[];
  readonly createdAt: string;
  readonly metadata: {
    readonly deriverId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
  };
};

export type HeuristicCatalog = {
  readonly id: string;
  readonly version: string;
  readonly heuristics: readonly DerivedHeuristic[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly collectionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: HeuristicValidation | null;
};

export type HeuristicValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type HeuristicValidation = {
  readonly valid: boolean;
  readonly issues: readonly HeuristicValidationIssue[];
  readonly validatedAt: string;
};

export type DeriveHeuristicsInput = {
  readonly collectionId: string;
  readonly collectionTitle: string;
  readonly title?: string;
  readonly patterns: readonly {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly confidence: number;
    readonly sourceRecords: readonly string[];
  }[];
};

export type HeuristicIndexEntry = {
  readonly catalogId: string;
  readonly heuristicId: string;
  readonly name: string;
  readonly confidence: number;
  readonly priority: number;
};

export type HeuristicEngineEventType =
  | 'HeuristicDerived'
  | 'HeuristicValidated'
  | 'HeuristicPublished'
  | 'HeuristicIndexed';

export type HeuristicEngineEvent = {
  readonly eventId: string;
  readonly type: HeuristicEngineEventType;
  readonly catalogId: string;
  readonly heuristicId: string | null;
  readonly at: string;
  readonly message: string;
};
