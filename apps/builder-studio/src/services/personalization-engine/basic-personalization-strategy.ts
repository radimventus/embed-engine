import type {
  PersonalizedContext,
  PersonalizationRule,
  PersonalizationValidation,
  PersonalizationValidationIssue,
  PersonalizeInput,
} from '../../model';

/**
 * PersonalizationStrategy (EPIC-BLD-29).
 * Deterministic personalization only — no LLM.
 */
export type PersonalizationStrategy = {
  readonly id: string;
  supports(input: PersonalizeInput): boolean;
  apply(
    input: PersonalizeInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly context: PersonalizedContext;
    readonly rules: readonly PersonalizationRule[];
  };
};

/**
 * BasicPersonalizationStrategy — priority boost + session-state adjustments.
 */
export function createBasicPersonalizationStrategy(): PersonalizationStrategy {
  return {
    id: 'basic-personalization-strategy',

    supports(input) {
      return (
        input.knowledgeEntries.length > 0 && input.sessionId.trim().length > 0
      );
    },

    apply(input, createId, now) {
      const stamp = now().toISOString();
      const priorityProfile =
        input.priorityProfile ??
        (['price', 'layout', 'location'] as const);

      const rules: PersonalizationRule[] = [
        {
          id: createId('personalization-rule'),
          condition: 'priority-profile-present',
          adjustment: 'boost-by-profile-order',
          weight: 0.4,
          metadata: {
            notes: `Profile: ${priorityProfile.join(' > ')}.`,
          },
        },
        {
          id: createId('personalization-rule'),
          condition: `session:${input.sessionId}`,
          adjustment: 'scope-to-session',
          weight: 0.3,
          metadata: {
            notes: 'Bind projection to Decision Session.',
          },
        },
      ];

      if ((input.currentMoveIndex ?? 0) > 0) {
        rules.push({
          id: createId('personalization-rule'),
          condition: `moveIndex>=${input.currentMoveIndex}`,
          adjustment: 'prefer-progress-aligned-entries',
          weight: 0.2,
          metadata: {
            notes: 'Session progress bias.',
          },
        });
      }

      if (input.sessionState === 'Completed') {
        rules.push({
          id: createId('personalization-rule'),
          condition: 'sessionState=Completed',
          adjustment: 'stabilize-ranking',
          weight: 0.15,
          metadata: {
            notes: 'Completed session — stable projection.',
          },
        });
      }

      const scored = input.knowledgeEntries.map((entry, index) => {
        let score = entry.confidence;
        score += (priorityProfile.length - (index % priorityProfile.length)) * 0.02;
        if ((input.currentMoveIndex ?? 0) > 0 && index === 0) {
          score += 0.05;
        }
        if (input.sessionState === 'Completed') {
          score = Math.min(1, score + 0.03);
        }
        return {
          knowledgeEntryId: entry.id,
          score: Math.round(Math.min(1, score) * 1000) / 1000,
        };
      });

      scored.sort((a, b) => b.score - a.score);
      const ranking = scored.map((item, rank) => ({
        ...item,
        rank: rank + 1,
      }));

      const confidence =
        ranking.length === 0
          ? 0
          : ranking.reduce((sum, item) => sum + item.score, 0) / ranking.length;

      return {
        rules,
        context: {
          id: createId('personalized-context'),
          sessionId: input.sessionId,
          priorityProfile,
          knowledgeEntries: ranking.map((item) => item.knowledgeEntryId),
          ranking,
          confidence: Math.round(confidence * 1000) / 1000,
          createdAt: stamp,
          metadata: {
            strategyId: 'basic-personalization-strategy',
            status: 'Draft',
            notes:
              'Deterministic personalization from AI Context + Decision Session.',
            appliedRules: rules.map((rule) => rule.id),
          },
        },
      };
    },
  };
}

/**
 * PersonalizationValidator (EPIC-BLD-29).
 */
export type PersonalizationValidator = {
  validate(
    context: PersonalizedContext,
    rules: readonly PersonalizationRule[],
  ): PersonalizationValidation;
  validateRules(
    rules: readonly PersonalizationRule[],
  ): readonly PersonalizationValidationIssue[];
  validateRanking(
    context: PersonalizedContext,
  ): readonly PersonalizationValidationIssue[];
  validateConfidence(
    context: PersonalizedContext,
  ): readonly PersonalizationValidationIssue[];
};

export function createPersonalizationValidator(options?: {
  readonly now?: () => Date;
}): PersonalizationValidator {
  const now = options?.now ?? (() => new Date());

  const validateRules = (
    rules: readonly PersonalizationRule[],
  ): PersonalizationValidationIssue[] => {
    const issues: PersonalizationValidationIssue[] = [];
    if (rules.length === 0) {
      issues.push({
        code: 'empty-rules',
        severity: 'error',
        message: 'Personalization has no rules.',
      });
    }
    for (const rule of rules) {
      if (!rule.condition.trim() || !rule.adjustment.trim()) {
        issues.push({
          code: 'invalid-rule',
          severity: 'error',
          message: `Rule ${rule.id} is incomplete.`,
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
    return issues;
  };

  const validateRanking = (
    context: PersonalizedContext,
  ): PersonalizationValidationIssue[] => {
    const issues: PersonalizationValidationIssue[] = [];
    if (context.ranking.length === 0) {
      issues.push({
        code: 'empty-ranking',
        severity: 'error',
        message: `Context ${context.id} has empty ranking.`,
      });
    }
    if (context.ranking.length !== context.knowledgeEntries.length) {
      issues.push({
        code: 'ranking-mismatch',
        severity: 'error',
        message: `Context ${context.id} ranking/entries length mismatch.`,
      });
    }
    const ranks = context.ranking.map((item) => item.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i += 1) {
      if (ranks[i] !== i + 1) {
        issues.push({
          code: 'non-sequential-ranks',
          severity: 'warning',
          message: 'Ranking ranks are not sequential.',
        });
        break;
      }
    }
    return issues;
  };

  const validateConfidence = (
    context: PersonalizedContext,
  ): PersonalizationValidationIssue[] => {
    const issues: PersonalizationValidationIssue[] = [];
    if (context.confidence < 0 || context.confidence > 1) {
      issues.push({
        code: 'invalid-confidence',
        severity: 'error',
        message: `Context ${context.id} confidence out of range.`,
      });
    }
    if (context.confidence < 0.25) {
      issues.push({
        code: 'low-confidence',
        severity: 'warning',
        message: `Context ${context.id} has low confidence (${context.confidence}).`,
      });
    }
    if (!context.sessionId.trim()) {
      issues.push({
        code: 'missing-session',
        severity: 'error',
        message: `Context ${context.id} missing sessionId.`,
      });
    }
    return issues;
  };

  return {
    validateRules,
    validateRanking,
    validateConfidence,
    validate(context, rules) {
      const issues = [
        ...validateRules(rules),
        ...validateRanking(context),
        ...validateConfidence(context),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
