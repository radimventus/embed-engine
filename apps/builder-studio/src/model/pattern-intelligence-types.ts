/**
 * Pattern Intelligence Engine (EPIC-BLD-25).
 * Creates verified patterns from Learning Records — no heuristics or AI.
 *
 * Note: Spec name is Pattern; TypeScript uses IntelligencePattern to avoid clash
 * with BLD-15 Pattern and BLD-24 ExtractedPattern.
 */

export type IntelligencePatternType =
  | 'source-frequency'
  | 'pipeline-derived'
  | 'multi-record'
  | 'merged';

export type PatternEvidence = {
  readonly recordId: string;
  readonly snapshotId: string;
  readonly weight: number;
  readonly timestamp: string;
  readonly metadata: {
    readonly source: string;
    readonly note: string;
  };
};

export type IntelligencePattern = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: IntelligencePatternType;
  readonly confidence: number;
  readonly occurrences: number;
  readonly sources: readonly string[];
  readonly evidence: readonly PatternEvidence[];
  readonly createdAt: string;
  readonly metadata: {
    readonly matcherId: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
    readonly notes: string;
  };
};

export type PatternCatalog = {
  readonly id: string;
  readonly version: string;
  readonly patterns: readonly IntelligencePattern[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly packageId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: PatternIntelligenceValidation | null;
};

export type PatternIntelligenceValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PatternIntelligenceValidation = {
  readonly valid: boolean;
  readonly issues: readonly PatternIntelligenceValidationIssue[];
  readonly validatedAt: string;
};

export type PatternIntelligenceInput = {
  readonly packageId: string;
  readonly packageName: string;
  readonly snapshotId?: string;
  readonly title?: string;
  readonly records: readonly {
    readonly recordId: string;
    readonly source: string;
    readonly note: string;
    readonly timestamp?: string;
  }[];
};

export type PatternIntelligenceIndexEntry = {
  readonly catalogId: string;
  readonly patternId: string;
  readonly name: string;
  readonly type: IntelligencePatternType;
  readonly confidence: number;
};

export type PatternIntelligenceEventType =
  | 'PatternDetected'
  | 'PatternMerged'
  | 'PatternValidated'
  | 'PatternPublished';

export type PatternIntelligenceEvent = {
  readonly eventId: string;
  readonly type: PatternIntelligenceEventType;
  readonly catalogId: string;
  readonly patternId: string | null;
  readonly at: string;
  readonly message: string;
};
