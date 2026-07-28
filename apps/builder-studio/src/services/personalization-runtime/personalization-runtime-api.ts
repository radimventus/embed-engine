import type {
  PersonalizedContextPackage,
  ProjectDecisionContextInput,
} from '../../model';
import type { PersonalizationRuntimeEngine } from './personalization-runtime-engine';

/**
 * Public Personalization Runtime API (EPIC-BLD-30).
 */
export type PersonalizationRuntimeApi = {
  projectDecisionContext(
    input: ProjectDecisionContextInput,
  ): PersonalizedContextPackage;
  publishDecisionContext(packageId: string): PersonalizedContextPackage;
  previewDecisionContext(
    packageId: string,
  ): PersonalizedContextPackage | null;
  listDecisionContexts(): readonly PersonalizedContextPackage[];
  validateDecisionContext(packageId: string): PersonalizedContextPackage;
};

export function createPersonalizationRuntimeApi(
  engine: PersonalizationRuntimeEngine,
): PersonalizationRuntimeApi {
  return {
    projectDecisionContext(input) {
      return engine.project(input);
    },
    publishDecisionContext(packageId) {
      return engine.publish(packageId);
    },
    previewDecisionContext(packageId) {
      return engine.preview(packageId);
    },
    listDecisionContexts() {
      return engine.list();
    },
    validateDecisionContext(packageId) {
      return engine.validate(packageId);
    },
  };
}
