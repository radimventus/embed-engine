import type { LearningPackage, Pattern } from '../../model';
import type { LearningService } from './learning-service';

/**
 * Public Learning API (EPIC-BLD-15).
 */
export type LearningApi = {
  loadLearning(id?: string): LearningPackage | null;
  saveLearning(id: string): LearningPackage;
  listPatterns(id?: string): readonly Pattern[];
};

export function createLearningApi(service: LearningService): LearningApi {
  return {
    loadLearning(id) {
      return service.load(id);
    },
    saveLearning(id) {
      return service.save(id);
    },
    listPatterns(id) {
      return service.listPatterns(id);
    },
  };
}
