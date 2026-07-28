import type {
  BehaviorEvaluation,
  BehaviorSignal,
  EvaluateBehaviorInput,
} from '../../model';
import type { BehaviorEngine } from './behavior-engine';

/**
 * Public Behavior API (EPIC-BLD-20).
 */
export type BehaviorApi = {
  evaluateBehavior(input: EvaluateBehaviorInput): BehaviorEvaluation;
  previewBehavior(sessionId: string): BehaviorEvaluation | null;
  listBehaviorSignals(sessionId?: string): readonly BehaviorSignal[];
};

export function createBehaviorApi(engine: BehaviorEngine): BehaviorApi {
  return {
    evaluateBehavior(input) {
      return engine.evaluate(input);
    },
    previewBehavior(sessionId) {
      return engine.preview(sessionId);
    },
    listBehaviorSignals(sessionId) {
      return engine.listSignals(sessionId);
    },
  };
}
