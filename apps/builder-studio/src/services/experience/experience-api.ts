import type { Experience, UpdateExperienceInput } from '../../model';
import type { ExperienceComposerService } from './experience-composer-service';

/**
 * Public Composer API (EPIC-BLD-09).
 */
export type ExperienceComposerApi = {
  createExperience(input: {
    readonly objectId: string;
    readonly title?: string;
    readonly description?: string;
  }): Experience;
  loadExperience(experienceId: string): Experience | null;
  updateExperience(
    experienceId: string,
    patch: UpdateExperienceInput,
  ): Experience;
};

export function createExperienceComposerApi(
  service: ExperienceComposerService,
): ExperienceComposerApi {
  return {
    createExperience(input) {
      return service.createExperience(input);
    },
    loadExperience(experienceId) {
      return service.loadExperience(experienceId);
    },
    updateExperience(experienceId, patch) {
      return service.updateExperience(experienceId, patch);
    },
  };
}
