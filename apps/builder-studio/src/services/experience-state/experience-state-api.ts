import type {
  CreateExperienceStateInput,
  ExperienceStatePackage,
  UpdateExperienceStateInput,
} from '../../model';
import type { ExperienceStateManager } from './experience-state-manager';

/**
 * Public Experience State API (EPIC-BLD-35).
 */
export type ExperienceStateApi = {
  createState(input: CreateExperienceStateInput): ExperienceStatePackage;
  updateState(
    packageId: string,
    patch: UpdateExperienceStateInput,
  ): ExperienceStatePackage;
  createCheckpoint(
    packageId: string,
    reason?: string,
  ): ExperienceStatePackage;
  restoreState(
    packageId: string,
    checkpointId: string,
  ): ExperienceStatePackage;
  listStates(): readonly ExperienceStatePackage[];
  validateState(packageId: string): ExperienceStatePackage;
};

export function createExperienceStateApi(
  manager: ExperienceStateManager,
): ExperienceStateApi {
  return {
    createState(input) {
      return manager.createState(input);
    },
    updateState(packageId, patch) {
      return manager.updateState(packageId, patch);
    },
    createCheckpoint(packageId, reason) {
      return manager.createCheckpoint(packageId, reason);
    },
    restoreState(packageId, checkpointId) {
      return manager.restore(packageId, checkpointId);
    },
    listStates() {
      return manager.list();
    },
    validateState(packageId) {
      return manager.validate(packageId);
    },
  };
}
