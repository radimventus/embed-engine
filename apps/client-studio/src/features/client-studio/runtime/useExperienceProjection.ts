import { useDecisionContext } from './useDecisionContext';
import { projectExperienceFromDecisionContext } from '../projection/projectDecisionStoryExperience';
import type { ExperienceProjection } from '../projection/projectDecisionStoryExperience';

/**
 * PT-002 / PT-003 — Experience view model from Decision Context only.
 */
export function useExperienceProjection(): ExperienceProjection {
  return projectExperienceFromDecisionContext(useDecisionContext());
}
