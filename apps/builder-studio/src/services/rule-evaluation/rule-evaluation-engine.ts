import type {
  EvaluationEvent,
  EvaluationResult,
  EvaluationSummary,
  RuleEvaluationInput,
  RuleResult,
} from '../../model';
import {
  createBasicRuleEvaluator,
  type RuleEvaluator,
} from './basic-rule-evaluator';

const MAX_HISTORY = 40;

export type RuleEvaluationEngine = {
  evaluate(input: RuleEvaluationInput): EvaluationResult;
  validateRules(input: RuleEvaluationInput): {
    readonly valid: boolean;
    readonly issues: readonly string[];
  };
  dispose(evaluationId: string): void;
  load(evaluationId: string): EvaluationResult | null;
  preview(evaluationId: string): EvaluationResult | null;
  getEvents(evaluationId?: string): readonly EvaluationEvent[];
  getHistory(evaluationId?: string): readonly EvaluationEvent[];
  list(): readonly EvaluationResult[];
};

function summarize(results: readonly RuleResult[]): EvaluationSummary {
  const total = results.length;
  const passed = results.filter((item) => item.status === 'Passed').length;
  const failed = results.filter((item) => item.status === 'Failed').length;
  const skipped = results.filter((item) => item.status === 'Skipped').length;
  const averageScore =
    total === 0
      ? 0
      : Math.round(
          (results.reduce((sum, item) => sum + item.score, 0) / total) * 1000,
        ) / 1000;
  return { total, passed, failed, skipped, averageScore };
}

/**
 * RuleEvaluationEngine (EPIC-BLD-17).
 * Evaluates rules over DecisionModel inputs — does not mutate the model.
 */
export function createRuleEvaluationEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly evaluator?: RuleEvaluator;
}): RuleEvaluationEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const evaluator = options?.evaluator ?? createBasicRuleEvaluator();
  const results = new Map<string, EvaluationResult>();
  const events: EvaluationEvent[] = [];

  const pushEvent = (
    type: EvaluationEvent['type'],
    evaluationId: string,
    decisionModelId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('eval-event'),
      type,
      evaluationId,
      decisionModelId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  return {
    evaluate(input) {
      const stamp = now().toISOString();
      const id = `evaluation-${input.decisionModelId}`;

      pushEvent(
        'EvaluationStarted',
        id,
        input.decisionModelId,
        `Evaluation started for ${input.decisionModelId}`,
      );

      const ruleResults: RuleResult[] = [];
      for (const rule of input.rules) {
        if (!evaluator.supports(rule)) {
          const skipped: RuleResult = {
            ruleId: rule.id,
            status: 'Skipped',
            score: 0,
            matchedSignals: [],
            reason: `Evaluator ${evaluator.id} does not support this rule.`,
            metadata: {
              condition: rule.condition,
              outcome: rule.outcome,
            },
          };
          ruleResults.push(skipped);
          pushEvent(
            'RuleEvaluated',
            id,
            input.decisionModelId,
            `Rule ${rule.id} → Skipped`,
          );
          continue;
        }

        const result = evaluator.evaluate(rule, input.context);
        ruleResults.push(result);
        pushEvent(
          'RuleEvaluated',
          id,
          input.decisionModelId,
          `Rule ${rule.id} → ${result.status} (score ${result.score})`,
        );
      }

      const summary = summarize(ruleResults);
      const created: EvaluationResult = {
        id,
        decisionModelId: input.decisionModelId,
        ruleResults,
        summary,
        metadata: {
          title: input.title?.trim() || 'Rule Evaluation',
          description:
            'Deterministic evaluation over DecisionModel — no Story, Runtime, or AI.',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };

      results.set(created.id, created);
      pushEvent(
        'EvaluationCompleted',
        created.id,
        created.decisionModelId,
        `Evaluation completed: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`,
      );
      return created;
    },

    validateRules(input) {
      const issues: string[] = [];
      if (input.decisionModelId.trim() === '') {
        issues.push('decisionModelId is required.');
      }
      if (input.rules.length === 0) {
        issues.push('No rules to evaluate.');
      }
      for (const rule of input.rules) {
        if (rule.condition.trim() === '') {
          issues.push(`Rule ${rule.id} has empty condition.`);
        }
        if (rule.outcome.trim() === '') {
          issues.push(`Rule ${rule.id} has empty outcome.`);
        }
      }
      return {
        valid: issues.length === 0,
        issues,
      };
    },

    dispose(evaluationId) {
      results.delete(evaluationId);
    },

    load(evaluationId) {
      return results.get(evaluationId) ?? null;
    },

    preview(evaluationId) {
      return results.get(evaluationId) ?? null;
    },

    getEvents(evaluationId) {
      if (evaluationId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.evaluationId === evaluationId);
    },

    getHistory(evaluationId) {
      return this.getEvents(evaluationId);
    },

    list() {
      return Array.from(results.values());
    },
  };
}
