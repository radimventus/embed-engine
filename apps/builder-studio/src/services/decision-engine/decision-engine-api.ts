import type {
  BuildDecisionModelInput,
  DecisionGraph,
  DecisionModel,
  DecisionModelValidation,
} from '../../model';
import type { DecisionEngine } from './decision-engine';

/**
 * Public Decision Engine API (EPIC-BLD-16).
 */
export type DecisionEngineApi = {
  buildDecisionModel(input: BuildDecisionModelInput): DecisionModel;
  validateDecision(id: string): DecisionModelValidation;
  previewDecisionGraph(id: string): DecisionGraph | null;
};

export function createDecisionEngineApi(
  engine: DecisionEngine,
): DecisionEngineApi {
  return {
    buildDecisionModel(input) {
      return engine.createDecisionModel(input);
    },
    validateDecision(id) {
      return engine.validateDecisionModel(id).validation!;
    },
    previewDecisionGraph(id) {
      return engine.previewDecisionGraph(id);
    },
  };
}
