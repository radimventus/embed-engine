/**
 * Pattern Extraction Engine (EPIC-BLD-24).
 * Identifies recurring patterns from Learning Package — no heuristics or AI.
 *
 * Note: Spec name is Pattern; TypeScript uses ExtractedPattern to avoid clash
 * with BLD-15 Pattern (observations-based learning).
 */

export type ExtractedPattern = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sourceRecords: readonly string[];
  readonly confidence: number;
  readonly createdAt: string;
  readonly metadata: {
    readonly extractorId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
  };
};

export type PatternCollection = {
  readonly id: string;
  readonly patterns: readonly ExtractedPattern[];
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly packageId: string;
    readonly notes: string;
  };
  readonly validation: PatternValidation | null;
};

export type PatternValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PatternValidation = {
  readonly valid: boolean;
  readonly issues: readonly PatternValidationIssue[];
  readonly validatedAt: string;
};

export type ExtractPatternsInput = {
  readonly packageId: string;
  readonly packageName: string;
  readonly records: readonly {
    readonly recordId: string;
    readonly source: string;
    readonly note: string;
  }[];
  readonly title?: string;
};

export type PatternIndexEntry = {
  readonly collectionId: string;
  readonly patternId: string;
  readonly name: string;
  readonly confidence: number;
};

export type PatternEngineEventType =
  | 'PatternExtracted'
  | 'PatternValidated'
  | 'PatternPublished'
  | 'PatternIndexed';

export type PatternEngineEvent = {
  readonly eventId: string;
  readonly type: PatternEngineEventType;
  readonly collectionId: string;
  readonly patternId: string | null;
  readonly at: string;
  readonly message: string;
};
