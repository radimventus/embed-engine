import type {
  EvaluationResult,
  RuleEvaluationInput,
} from '../../model';
import type { RuleEvaluationEngine } from './rule-evaluation-engine';

/**
 * Public Rule Evaluation API (EPIC-BLD-17).
 */
export type RuleEvaluationApi = {
  evaluateRules(input: RuleEvaluationInput): EvaluationResult;
  previewEvaluation(evaluationId: string): EvaluationResult | null;
  validateEvaluation(input: RuleEvaluationInput): {
    readonly valid: boolean;
    readonly issues: readonly string[];
  };
};

export function createRuleEvaluationApi(
  engine: RuleEvaluationEngine,
): RuleEvaluationApi {
  return {
    evaluateRules(input) {
      return engine.evaluate(input);
    },
    previewEvaluation(evaluationId) {
      return engine.preview(evaluationId);
    },
    validateEvaluation(input) {
      return engine.validateRules(input);
    },
  };
}
