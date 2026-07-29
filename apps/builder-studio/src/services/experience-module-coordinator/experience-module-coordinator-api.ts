import type { ExperienceModulePackage } from '../../model';
import type { ExperienceModuleCoordinator } from './experience-module-coordinator';

/**
 * Public Experience Module Coordinator API (EPIC-BLD-33).
 */
export type ExperienceModuleCoordinatorApi = {
  activateModule(
    packageId: string,
    moduleId: string,
  ): ExperienceModulePackage;
  transitionModule(packageId: string): ExperienceModulePackage;
  completeModule(packageId: string): ExperienceModulePackage;
  listModules(): readonly ExperienceModulePackage[];
  validateModules(packageId: string): ExperienceModulePackage;
};

export function createExperienceModuleCoordinatorApi(
  coordinator: ExperienceModuleCoordinator,
): ExperienceModuleCoordinatorApi {
  return {
    activateModule(packageId, moduleId) {
      return coordinator.activateModule(packageId, moduleId);
    },
    transitionModule(packageId) {
      return coordinator.transition(packageId);
    },
    completeModule(packageId) {
      return coordinator.complete(packageId);
    },
    listModules() {
      return coordinator.list();
    },
    validateModules(packageId) {
      return coordinator.validate(packageId);
    },
  };
}
