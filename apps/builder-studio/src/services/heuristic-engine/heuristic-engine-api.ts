import type {
  DeriveHeuristicsInput,
  DerivedHeuristic,
  HeuristicCatalog,
} from '../../model';
import type { HeuristicEngine } from './heuristic-engine';

/**
 * Public Heuristic Engine API (EPIC-BLD-26).
 */
export type HeuristicEngineApi = {
  deriveHeuristics(input: DeriveHeuristicsInput): HeuristicCatalog;
  publishHeuristics(catalogId: string): HeuristicCatalog;
  previewHeuristics(catalogId: string): HeuristicCatalog | null;
  listHeuristics(catalogId?: string): readonly DerivedHeuristic[];
  validateHeuristics(catalogId: string): HeuristicCatalog;
};

export function createHeuristicEngineApi(
  engine: HeuristicEngine,
): HeuristicEngineApi {
  return {
    deriveHeuristics(input) {
      return engine.derive(input);
    },
    publishHeuristics(catalogId) {
      return engine.publish(catalogId);
    },
    previewHeuristics(catalogId) {
      return engine.preview(catalogId);
    },
    listHeuristics(catalogId) {
      return engine.listHeuristics(catalogId);
    },
    validateHeuristics(catalogId) {
      return engine.validate(catalogId);
    },
  };
}
