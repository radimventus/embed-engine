import type {
  DecisionKnowledgePackage,
  UpdateDecisionKnowledgeInput,
} from '../../model';
import type { DecisionKnowledgeService } from './decision-knowledge-service';

/**
 * Public Decision Knowledge API (EPIC-BLD-12).
 */
export type DecisionKnowledgeApi = {
  loadDecisionKnowledge(id: string): DecisionKnowledgePackage | null;
  saveDecisionKnowledge(id: string): DecisionKnowledgePackage;
  updateDecisionKnowledge(
    id: string,
    patch: UpdateDecisionKnowledgeInput,
  ): DecisionKnowledgePackage;
};

export function createDecisionKnowledgeApi(
  service: DecisionKnowledgeService,
): DecisionKnowledgeApi {
  return {
    loadDecisionKnowledge(id) {
      return service.load(id);
    },
    saveDecisionKnowledge(id) {
      return service.save(id);
    },
    updateDecisionKnowledge(id, patch) {
      return service.update(id, patch);
    },
  };
}
