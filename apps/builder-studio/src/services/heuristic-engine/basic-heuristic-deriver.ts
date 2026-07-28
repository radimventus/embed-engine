import type {
  DeriveHeuristicsInput,
  DerivedHeuristic,
  HeuristicRule,
  HeuristicValidation,
  HeuristicValidationIssue,
} from '../../model';

/**
 * HeuristicDeriver (EPIC-BLD-26).
 * Deterministic derivation only — no AI/ML.
 */
export type HeuristicDeriver = {
  readonly id: string;
  supports(input: DeriveHeuristicsInput): boolean;
  derive(
    input: DeriveHeuristicsInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): readonly DerivedHeuristic[];
};

/**
 * BasicHeuristicDeriver — one heuristic per pattern + optional aggregate.
 */
export function createBasicHeuristicDeriver(): HeuristicDeriver {
  return {
    id: 'basic-heuristic-deriver',

    supports(input) {
      return input.patterns.length > 0;
    },

    derive(input, createId, now) {
      const stamp = now().toISOString();
      const heuristics: DerivedHeuristic[] = [];

      input.patterns.forEach((pattern, index) => {
        const rules: HeuristicRule[] = [
          {
            id: createId('heuristic-rule'),
            condition: `pattern:${pattern.id} confidence>=${pattern.confidence}`,
            outcome: `prefer:${pattern.name}`,
            weight: Math.round(pattern.confidence * 100) / 100,
            metadata: {
              notes: `Derived from ${pattern.sourceRecords.length} source record(s).`,
            },
          },
        ];

        if (pattern.sourceRecords.length >= 2) {
          rules.push({
            id: createId('heuristic-rule'),
            condition: `sources>=2 for ${pattern.name}`,
            outcome: 'reinforce-pattern-signal',
            weight: Math.min(1, 0.3 + pattern.sourceRecords.length * 0.1),
            metadata: {
              notes: 'Multi-source reinforcement rule.',
            },
          });
        }

        heuristics.push({
          id: createId('derived-heuristic'),
          name: `Heuristic: ${pattern.name}`,
          description: `Generalized rule from pattern "${pattern.name}". ${pattern.description}`,
          confidence: Math.round(pattern.confidence * 1000) / 1000,
          priority: index + 1,
          sourcePatterns: [pattern.id],
          rules,
          createdAt: stamp,
          metadata: {
            deriverId: 'basic-heuristic-deriver',
            status: 'Draft',
            notes: 'Deterministic single-pattern derivation.',
          },
        });
      });

      if (input.patterns.length >= 2) {
        const avgConfidence =
          input.patterns.reduce((sum, item) => sum + item.confidence, 0) /
          input.patterns.length;
        heuristics.push({
          id: createId('derived-heuristic'),
          name: 'Collection aggregate heuristic',
          description: `Aggregate guidance from ${input.patterns.length} patterns in "${input.collectionTitle}".`,
          confidence: Math.round(avgConfidence * 1000) / 1000,
          priority: input.patterns.length + 1,
          sourcePatterns: input.patterns.map((item) => item.id),
          rules: [
            {
              id: createId('heuristic-rule'),
              condition: `collection:${input.collectionId} patterns>=2`,
              outcome: 'apply-collection-guidance',
              weight: Math.round(avgConfidence * 100) / 100,
              metadata: {
                notes: 'Aggregate collection rule.',
              },
            },
          ],
          createdAt: stamp,
          metadata: {
            deriverId: 'basic-heuristic-deriver',
            status: 'Draft',
            notes: 'Deterministic multi-pattern aggregate.',
          },
        });
      }

      return heuristics;
    },
  };
}

/**
 * HeuristicValidator (EPIC-BLD-26).
 */
export type HeuristicValidator = {
  validate(heuristics: readonly DerivedHeuristic[]): HeuristicValidation;
  validateRules(
    heuristics: readonly DerivedHeuristic[],
  ): readonly HeuristicValidationIssue[];
  validateConfidence(
    heuristics: readonly DerivedHeuristic[],
  ): readonly HeuristicValidationIssue[];
};

export function createHeuristicValidator(options?: {
  readonly now?: () => Date;
}): HeuristicValidator {
  const now = options?.now ?? (() => new Date());

  const validateRules = (
    heuristics: readonly DerivedHeuristic[],
  ): HeuristicValidationIssue[] => {
    const issues: HeuristicValidationIssue[] = [];
    for (const heuristic of heuristics) {
      if (heuristic.rules.length === 0) {
        issues.push({
          code: 'empty-rules',
          severity: 'error',
          message: `Heuristic ${heuristic.id} has no rules.`,
        });
      }
      for (const rule of heuristic.rules) {
        if (!rule.condition.trim() || !rule.outcome.trim()) {
          issues.push({
            code: 'invalid-rule',
            severity: 'error',
            message: `Heuristic ${heuristic.id} has incomplete rule ${rule.id}.`,
          });
        }
        if (rule.weight < 0 || rule.weight > 1) {
          issues.push({
            code: 'invalid-rule-weight',
            severity: 'error',
            message: `Rule ${rule.id} weight out of range.`,
          });
        }
      }
    }
    return issues;
  };

  const validateConfidence = (
    heuristics: readonly DerivedHeuristic[],
  ): HeuristicValidationIssue[] => {
    const issues: HeuristicValidationIssue[] = [];
    for (const heuristic of heuristics) {
      if (heuristic.confidence < 0 || heuristic.confidence > 1) {
        issues.push({
          code: 'invalid-confidence',
          severity: 'error',
          message: `Heuristic ${heuristic.id} confidence out of range.`,
        });
      }
      if (heuristic.confidence < 0.25) {
        issues.push({
          code: 'low-confidence',
          severity: 'warning',
          message: `Heuristic ${heuristic.name} has low confidence (${heuristic.confidence}).`,
        });
      }
      if (heuristic.sourcePatterns.length === 0) {
        issues.push({
          code: 'empty-sources',
          severity: 'error',
          message: `Heuristic ${heuristic.id} has no sourcePatterns.`,
        });
      }
    }
    return issues;
  };

  return {
    validateRules,
    validateConfidence,
    validate(heuristics) {
      const issues = [
        ...validateRules(heuristics),
        ...validateConfidence(heuristics),
      ];
      if (heuristics.length === 0) {
        issues.push({
          code: 'empty-heuristics',
          severity: 'error',
          message: 'Heuristic catalog is empty.',
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
