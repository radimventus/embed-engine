import type {
  EvaluableRule,
  EvaluationContext,
  RuleResult,
} from '../../model';

/**
 * RuleEvaluator (EPIC-BLD-17).
 * Pluggable evaluator interface — no Story / Runtime.
 */
export type RuleEvaluator = {
  readonly id: string;
  supports(rule: EvaluableRule): boolean;
  evaluate(rule: EvaluableRule, context: EvaluationContext): RuleResult;
};

/**
 * BasicRuleEvaluator — simple deterministic matching.
 * No complex algorithms.
 */
export function createBasicRuleEvaluator(): RuleEvaluator {
  return {
    id: 'basic-rule-evaluator',

    supports() {
      return true;
    },

    evaluate(rule, context) {
      const condition = rule.condition.toLowerCase();

      const matchedPriorities = context.priorities.filter((priorityId) =>
        condition.includes(priorityId.toLowerCase()),
      );

      const matchedSignals = context.signals
        .filter((signal) => {
          const sourceToken = `signal.${signal.source.toLowerCase()}`;
          return (
            condition.includes(sourceToken) ||
            condition.includes(signal.id.toLowerCase())
          );
        })
        .map((signal) => signal.id);

      const asksPriority = condition.includes('priority');
      const asksSignal = condition.includes('signal.');

      if (context.priorities.length === 0 && context.signals.length === 0) {
        return {
          ruleId: rule.id,
          status: 'Skipped',
          score: 0,
          matchedSignals: [],
          reason: 'No priorities or signals available in EvaluationContext.',
          metadata: {
            condition: rule.condition,
            outcome: rule.outcome,
          },
        };
      }

      let passed = false;
      if (asksPriority && !asksSignal) {
        passed = matchedPriorities.length > 0;
      } else if (asksSignal && !asksPriority) {
        passed = matchedSignals.length > 0;
      } else if (asksPriority && asksSignal) {
        passed =
          matchedPriorities.length > 0 && matchedSignals.length > 0;
      } else {
        passed =
          matchedPriorities.length > 0 || matchedSignals.length > 0;
      }

      const coverage =
        (matchedPriorities.length > 0 ? 0.5 : 0) +
        (matchedSignals.length > 0 ? 0.5 : 0);
      const score = passed
        ? Math.min(1, Math.round(coverage * rule.weight * 1000) / 1000)
        : 0;

      if (passed) {
        return {
          ruleId: rule.id,
          status: 'Passed',
          score,
          matchedSignals,
          reason: `Matched priorities=[${matchedPriorities.join(', ') || '—'}], signals=${matchedSignals.length}.`,
          metadata: {
            condition: rule.condition,
            outcome: rule.outcome,
          },
        };
      }

      return {
        ruleId: rule.id,
        status: 'Failed',
        score: 0,
        matchedSignals,
        reason: 'Condition did not match available priorities or signals.',
        metadata: {
          condition: rule.condition,
          outcome: rule.outcome,
        },
      };
    },
  };
}
