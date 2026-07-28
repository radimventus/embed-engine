import type {
  KnowledgePackage,
  UpdateKnowledgeInput,
} from '../../model';
import type { KnowledgeService } from './knowledge-service';

/**
 * Public Knowledge API (EPIC-BLD-11).
 */
export type KnowledgeApi = {
  loadKnowledge(knowledgeId: string): KnowledgePackage | null;
  saveKnowledge(knowledgeId: string): KnowledgePackage;
  updateKnowledge(
    knowledgeId: string,
    patch: UpdateKnowledgeInput,
  ): KnowledgePackage;
};

export function createKnowledgeApi(service: KnowledgeService): KnowledgeApi {
  return {
    loadKnowledge(knowledgeId) {
      return service.loadKnowledge(knowledgeId);
    },
    saveKnowledge(knowledgeId) {
      return service.saveKnowledge(knowledgeId);
    },
    updateKnowledge(knowledgeId, patch) {
      return service.updateKnowledge(knowledgeId, patch);
    },
  };
}
