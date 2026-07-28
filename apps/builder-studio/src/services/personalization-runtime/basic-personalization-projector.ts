import type {
  PersonalizedDecisionContext,
  PersonalizationProjection,
  PersonalizationRuntimeValidation,
  PersonalizationRuntimeValidationIssue,
  ProjectDecisionContextInput,
} from '../../model';

/**
 * PersonalizationProjector (EPIC-BLD-30).
 * Deterministic projection only — no AI/LLM.
 */
export type PersonalizationProjector = {
  readonly id: string;
  supports(input: ProjectDecisionContextInput): boolean;
  project(
    input: ProjectDecisionContextInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): PersonalizedDecisionContext;
};

/**
 * BasicPersonalizationProjector — priority + behavior + decision profile.
 */
export function createBasicPersonalizationProjector(): PersonalizationProjector {
  return {
    id: 'basic-personalization-projector',

    supports(input) {
      return (
        input.knowledgeEntries.length > 0 && input.sessionId.trim().length > 0
      );
    },

    project(input, createId, now) {
      const stamp = now().toISOString();
      const priorityProfile =
        input.priorityProfile ?? (['price', 'layout', 'location'] as const);
      const behaviorProfile =
        input.behaviorProfile ??
        (input.behaviorSignals?.length
          ? input.behaviorSignals
          : (['attentive', 'exploring'] as const));
      const decisionProfile = input.decisionProfile ?? 'balanced';

      const projections: PersonalizationProjection[] = input.knowledgeEntries.map(
        (entry, index) => {
          let weight = entry.confidence;
          const reasons: string[] = ['ai-context-entry'];

          const priorityBoost =
            (priorityProfile.length - (index % priorityProfile.length)) * 0.03;
          weight += priorityBoost;
          reasons.push(`priority:${priorityProfile[index % priorityProfile.length]}`);

          if (behaviorProfile.includes('attentive') && index === 0) {
            weight += 0.05;
            reasons.push('behavior:attentive-boost');
          }
          if (behaviorProfile.includes('hesitant')) {
            weight -= 0.02;
            reasons.push('behavior:hesitant-dampen');
          }
          if (decisionProfile === 'price-first' && index === 0) {
            weight += 0.08;
            reasons.push('decision:price-first');
          }
          if (input.sessionState === 'Completed') {
            weight = Math.min(1, weight + 0.02);
            reasons.push('session:completed-stabilize');
          }

          return {
            knowledgeEntryId: entry.id,
            reason: reasons.join('+'),
            weight: Math.round(Math.min(1, Math.max(0, weight)) * 1000) / 1000,
            priority: index + 1,
            metadata: {
              notes: `Projected for session ${input.sessionId}.`,
            },
          };
        },
      );

      projections.sort((a, b) => b.weight - a.weight);
      const ranking = projections.map((item, rank) => ({
        ...item,
        priority: rank + 1,
      }));

      const confidence =
        ranking.length === 0
          ? 0
          : ranking.reduce((sum, item) => sum + item.weight, 0) /
            ranking.length;

      return {
        id: createId('personalized-decision-context'),
        sessionId: input.sessionId,
        priorityProfile: [...priorityProfile],
        behaviorProfile: [...behaviorProfile],
        knowledgeEntries: ranking.map((item) => item.knowledgeEntryId),
        ranking,
        confidence: Math.round(confidence * 1000) / 1000,
        metadata: {
          projectorId: 'basic-personalization-projector',
          status: 'Draft',
          notes:
            'Deterministic runtime projection — AI Context and Session unchanged.',
          decisionProfile,
        },
        createdAt: stamp,
      };
    },
  };
}

/**
 * PersonalizationRuntimeValidator (EPIC-BLD-30).
 */
export type PersonalizationRuntimeValidator = {
  validate(
    context: PersonalizedDecisionContext,
  ): PersonalizationRuntimeValidation;
  validateRanking(
    context: PersonalizedDecisionContext,
  ): readonly PersonalizationRuntimeValidationIssue[];
  validateConfidence(
    context: PersonalizedDecisionContext,
  ): readonly PersonalizationRuntimeValidationIssue[];
  validateReferences(
    context: PersonalizedDecisionContext,
  ): readonly PersonalizationRuntimeValidationIssue[];
};

export function createPersonalizationRuntimeValidator(options?: {
  readonly now?: () => Date;
}): PersonalizationRuntimeValidator {
  const now = options?.now ?? (() => new Date());

  const validateRanking = (
    context: PersonalizedDecisionContext,
  ): PersonalizationRuntimeValidationIssue[] => {
    const issues: PersonalizationRuntimeValidationIssue[] = [];
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
    const priorities = context.ranking
      .map((item) => item.priority)
      .sort((a, b) => a - b);
    for (let i = 0; i < priorities.length; i += 1) {
      if (priorities[i] !== i + 1) {
        issues.push({
          code: 'non-sequential-priorities',
          severity: 'warning',
          message: 'Projection priorities are not sequential.',
        });
        break;
      }
    }
    return issues;
  };

  const validateConfidence = (
    context: PersonalizedDecisionContext,
  ): PersonalizationRuntimeValidationIssue[] => {
    const issues: PersonalizationRuntimeValidationIssue[] = [];
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
    return issues;
  };

  const validateReferences = (
    context: PersonalizedDecisionContext,
  ): PersonalizationRuntimeValidationIssue[] => {
    const issues: PersonalizationRuntimeValidationIssue[] = [];
    if (!context.sessionId.trim()) {
      issues.push({
        code: 'missing-session',
        severity: 'error',
        message: `Context ${context.id} missing sessionId.`,
      });
    }
    for (const projection of context.ranking) {
      if (!projection.reason.trim()) {
        issues.push({
          code: 'missing-reason',
          severity: 'error',
          message: `Projection ${projection.knowledgeEntryId} missing reason.`,
        });
      }
      if (!context.knowledgeEntries.includes(projection.knowledgeEntryId)) {
        issues.push({
          code: 'orphan-projection',
          severity: 'error',
          message: `Projection ${projection.knowledgeEntryId} not in knowledgeEntries.`,
        });
      }
    }
    if (context.priorityProfile.length === 0) {
      issues.push({
        code: 'empty-priority-profile',
        severity: 'warning',
        message: 'Priority profile is empty.',
      });
    }
    if (context.behaviorProfile.length === 0) {
      issues.push({
        code: 'empty-behavior-profile',
        severity: 'warning',
        message: 'Behavior profile is empty.',
      });
    }
    return issues;
  };

  return {
    validateRanking,
    validateConfidence,
    validateReferences,
    validate(context) {
      const issues = [
        ...validateRanking(context),
        ...validateConfidence(context),
        ...validateReferences(context),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
