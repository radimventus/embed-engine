import type {
  IntelligencePattern,
  PatternEvidence,
  PatternIntelligenceInput,
  PatternIntelligenceValidation,
  PatternIntelligenceValidationIssue,
} from '../../model';

/**
 * PatternMatcher (EPIC-BLD-25).
 * Deterministic matching only — no AI/ML.
 */
export type PatternMatcher = {
  readonly id: string;
  supports(input: PatternIntelligenceInput): boolean;
  match(
    input: PatternIntelligenceInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): readonly IntelligencePattern[];
};

function toEvidence(
  record: PatternIntelligenceInput['records'][number],
  snapshotId: string,
  weight: number,
  stamp: string,
): PatternEvidence {
  return {
    recordId: record.recordId,
    snapshotId,
    weight,
    timestamp: record.timestamp ?? stamp,
    metadata: {
      source: record.source,
      note: record.note,
    },
  };
}

/**
 * BasicPatternMatcher — frequency / source / pipeline rules.
 */
export function createBasicPatternMatcher(): PatternMatcher {
  return {
    id: 'basic-pattern-matcher',

    supports(input) {
      return input.records.length > 0;
    },

    match(input, createId, now) {
      const stamp = now().toISOString();
      const snapshotId = input.snapshotId ?? `snapshot-${input.packageId}`;
      const patterns: IntelligencePattern[] = [];
      const bySource = new Map<
        string,
        PatternIntelligenceInput['records'][number][]
      >();

      for (const record of input.records) {
        const list = bySource.get(record.source) ?? [];
        list.push(record);
        bySource.set(record.source, list);
      }

      for (const [source, records] of bySource) {
        if (records.length < 2) {
          continue;
        }
        const confidence = Math.min(1, records.length / 5);
        patterns.push({
          id: createId('intelligence-pattern'),
          name: `Repeated source: ${source}`,
          description: `${records.length} Learning Records share source "${source}".`,
          type: 'source-frequency',
          confidence: Math.round(confidence * 1000) / 1000,
          occurrences: records.length,
          sources: [source],
          evidence: records.map((record) =>
            toEvidence(record, snapshotId, 1 / records.length, stamp),
          ),
          createdAt: stamp,
          metadata: {
            matcherId: 'basic-pattern-matcher',
            status: 'Draft',
            notes: 'Deterministic source-frequency match.',
          },
        });
      }

      if (input.records.length >= 3) {
        patterns.push({
          id: createId('intelligence-pattern'),
          name: 'Multi-record package',
          description: `Package "${input.packageName}" contains ${input.records.length} Learning Records.`,
          type: 'multi-record',
          confidence: Math.min(1, input.records.length / 6),
          occurrences: input.records.length,
          sources: Array.from(bySource.keys()),
          evidence: input.records.map((record) =>
            toEvidence(record, snapshotId, 1 / input.records.length, stamp),
          ),
          createdAt: stamp,
          metadata: {
            matcherId: 'basic-pattern-matcher',
            status: 'Draft',
            notes: 'Package size threshold match.',
          },
        });
      }

      const pipelineDerived = input.records.filter((item) =>
        `${item.source} ${item.note}`.toLowerCase().includes('pipeline'),
      );
      if (pipelineDerived.length >= 1) {
        patterns.push({
          id: createId('intelligence-pattern'),
          name: 'Pipeline-derived records',
          description: `${pipelineDerived.length} record(s) reference Learning Pipeline.`,
          type: 'pipeline-derived',
          confidence: Math.min(1, 0.4 + pipelineDerived.length * 0.15),
          occurrences: pipelineDerived.length,
          sources: Array.from(
            new Set(pipelineDerived.map((item) => item.source)),
          ),
          evidence: pipelineDerived.map((record) =>
            toEvidence(
              record,
              snapshotId,
              1 / pipelineDerived.length,
              stamp,
            ),
          ),
          createdAt: stamp,
          metadata: {
            matcherId: 'basic-pattern-matcher',
            status: 'Draft',
            notes: 'Source/note token match.',
          },
        });
      }

      return patterns;
    },
  };
}

/**
 * PatternValidator for Intelligence patterns (EPIC-BLD-25).
 */
export type PatternIntelligenceValidator = {
  validate(
    patterns: readonly IntelligencePattern[],
  ): PatternIntelligenceValidation;
  validateEvidence(
    patterns: readonly IntelligencePattern[],
  ): readonly PatternIntelligenceValidationIssue[];
  validateConfidence(
    patterns: readonly IntelligencePattern[],
  ): readonly PatternIntelligenceValidationIssue[];
};

export function createPatternIntelligenceValidator(options?: {
  readonly now?: () => Date;
}): PatternIntelligenceValidator {
  const now = options?.now ?? (() => new Date());

  const validateEvidence = (
    patterns: readonly IntelligencePattern[],
  ): PatternIntelligenceValidationIssue[] => {
    const issues: PatternIntelligenceValidationIssue[] = [];
    for (const pattern of patterns) {
      if (pattern.evidence.length === 0) {
        issues.push({
          code: 'empty-evidence',
          severity: 'error',
          message: `Pattern ${pattern.id} has no evidence.`,
        });
      }
      if (pattern.evidence.length !== pattern.occurrences) {
        issues.push({
          code: 'evidence-mismatch',
          severity: 'warning',
          message: `Pattern ${pattern.name} evidence count differs from occurrences.`,
        });
      }
    }
    return issues;
  };

  const validateConfidence = (
    patterns: readonly IntelligencePattern[],
  ): PatternIntelligenceValidationIssue[] => {
    const issues: PatternIntelligenceValidationIssue[] = [];
    for (const pattern of patterns) {
      if (pattern.confidence < 0 || pattern.confidence > 1) {
        issues.push({
          code: 'invalid-confidence',
          severity: 'error',
          message: `Pattern ${pattern.id} confidence out of range.`,
        });
      }
      if (pattern.confidence < 0.25) {
        issues.push({
          code: 'low-confidence',
          severity: 'warning',
          message: `Pattern ${pattern.name} has low confidence (${pattern.confidence}).`,
        });
      }
    }
    return issues;
  };

  return {
    validateEvidence,
    validateConfidence,
    validate(patterns) {
      const issues = [
        ...validateEvidence(patterns),
        ...validateConfidence(patterns),
      ];
      if (patterns.length === 0) {
        issues.push({
          code: 'empty-patterns',
          severity: 'error',
          message: 'Pattern catalog is empty.',
        });
      }
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
