import type {
  PersonalizationPackage,
  PersonalizeInput,
} from '../../model';
import type { PersonalizationEngine } from './personalization-engine';

/**
 * Public Personalization Engine API (EPIC-BLD-29).
 */
export type PersonalizationEngineApi = {
  personalize(input: PersonalizeInput): PersonalizationPackage;
  publishPersonalization(packageId: string): PersonalizationPackage;
  previewPersonalization(packageId: string): PersonalizationPackage | null;
  listPersonalizations(): readonly PersonalizationPackage[];
  validatePersonalization(packageId: string): PersonalizationPackage;
};

export function createPersonalizationEngineApi(
  engine: PersonalizationEngine,
): PersonalizationEngineApi {
  return {
    personalize(input) {
      return engine.personalize(input);
    },
    publishPersonalization(packageId) {
      return engine.publish(packageId);
    },
    previewPersonalization(packageId) {
      return engine.preview(packageId);
    },
    listPersonalizations() {
      return engine.list();
    },
    validatePersonalization(packageId) {
      return engine.validate(packageId);
    },
  };
}
