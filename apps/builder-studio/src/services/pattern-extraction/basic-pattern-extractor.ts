import type {
  ExtractPatternsInput,
  ExtractedPattern,
  PatternValidation,
  PatternValidationIssue,
} from '../../model';

/**
 * PatternExtractor (EPIC-BLD-24).
 * Pluggable deterministic extractor — no AI/ML.
 */
export type PatternExtractor = {
  readonly id: string;
  supports(input: ExtractPatternsInput): boolean;
  extract(
    input: ExtractPatternsInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): readonly ExtractedPattern[];
};

/**
 * BasicPatternExtractor — frequency/source deterministic rules only.
 */
export function createBasicPatternExtractor(): PatternExtractor {
  return {
    id: 'basic-pattern-extractor',

    supports(input) {
      return input.records.length > 0;
    },

    extract(input, createId, now) {
      const stamp = now().toISOString();
      const patterns: ExtractedPattern[] = [];
      const bySource = new Map<string, string[]>();

      for (const record of input.records) {
        const list = bySource.get(record.source) ?? [];
        list.push(record.recordId);
        bySource.set(record.source, list);
      }

      for (const [source, recordIds] of bySource) {
        if (recordIds.length < 2) {
          continue;
        }
        const confidence = Math.min(1, recordIds.length / 5);
        patterns.push({
          id: createId('extracted-pattern'),
          name: `Repeated source: ${source}`,
          description: `${recordIds.length} Learning Records share source "${source}".`,
          sourceRecords: recordIds,
          confidence: Math.round(confidence * 1000) / 1000,
          createdAt: stamp,
          metadata: {
            extractorId: 'basic-pattern-extractor',
            status: 'Draft',
            notes: 'Deterministic frequency pattern.',
          },
        });
      }

      if (input.records.length >= 3) {
        patterns.push({
          id: createId('extracted-pattern'),
          name: 'Multi-record package',
          description: `Package "${input.packageName}" contains ${input.records.length} record references.`,
          sourceRecords: input.records.map((item) => item.recordId),
          confidence: Math.min(1, input.records.length / 6),
          createdAt: stamp,
          metadata: {
            extractorId: 'basic-pattern-extractor',
            status: 'Draft',
            notes: 'Package size threshold pattern.',
          },
        });
      }

      const pipelineDerived = input.records.filter((item) =>
        `${item.source} ${item.note}`.toLowerCase().includes('pipeline'),
      );
      if (pipelineDerived.length >= 1) {
        patterns.push({
          id: createId('extracted-pattern'),
          name: 'Pipeline-derived records',
          description: `${pipelineDerived.length} record(s) reference Learning Pipeline.`,
          sourceRecords: pipelineDerived.map((item) => item.recordId),
          confidence: Math.min(1, 0.4 + pipelineDerived.length * 0.15),
          createdAt: stamp,
          metadata: {
            extractorId: 'basic-pattern-extractor',
            status: 'Draft',
            notes: 'Source/note token match.',
          },
        });
      }

      if (patterns.length === 0 && input.records.length > 0) {
        patterns.push({
          id: createId('extracted-pattern'),
          name: 'Sparse package signal',
          description:
            'Insufficient repetition for strong patterns — sparse candidate retained.',
          sourceRecords: input.records.map((item) => item.recordId),
          confidence: 0.2,
          createdAt: stamp,
          metadata: {
            extractorId: 'basic-pattern-extractor',
            status: 'Draft',
            notes: 'Fallback low-confidence pattern.',
          },
        });
      }

      return patterns;
    },
  };
}

/**
 * PatternValidator (EPIC-BLD-24).
 */
export type PatternValidator = {
  validate(patterns: readonly ExtractedPattern[]): PatternValidation;
  validateConfidence(
    patterns: readonly ExtractedPattern[],
  ): readonly PatternValidationIssue[];
  validateSources(
    patterns: readonly ExtractedPattern[],
  ): readonly PatternValidationIssue[];
};

export function createPatternValidator(options?: {
  readonly now?: () => Date;
}): PatternValidator {
  const now = options?.now ?? (() => new Date());

  const validateConfidence = (
    patterns: readonly ExtractedPattern[],
  ): PatternValidationIssue[] => {
    const issues: PatternValidationIssue[] = [];
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

  const validateSources = (
    patterns: readonly ExtractedPattern[],
  ): PatternValidationIssue[] => {
    const issues: PatternValidationIssue[] = [];
    for (const pattern of patterns) {
      if (pattern.sourceRecords.length === 0) {
        issues.push({
          code: 'empty-sources',
          severity: 'error',
          message: `Pattern ${pattern.id} has no sourceRecords.`,
        });
      }
    }
    return issues;
  };

  return {
    validateConfidence,
    validateSources,
    validate(patterns) {
      const issues = [
        ...validateConfidence(patterns),
        ...validateSources(patterns),
      ];
      if (patterns.length === 0) {
        issues.push({
          code: 'empty-patterns',
          severity: 'error',
          message: 'Pattern collection is empty.',
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
