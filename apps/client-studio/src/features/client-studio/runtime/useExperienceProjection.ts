import { projectExperienceFromPriorityIds } from '../projection/projectDecisionStoryExperience';
import type { ExperienceProjection } from '../projection/projectDecisionStoryExperience';
import { useDecisionSessionRuntime } from './DecisionSessionRuntimeProvider';

/**
 * PT-002 — read-only Experience Projection from Runtime Decision Story.
 * Components must not invent primary/secondary; Runtime priorityIds are SSOT.
 */
export function useExperienceProjection(): ExperienceProjection {
  const { experience } = useDecisionSessionRuntime();
  return projectExperienceFromPriorityIds(
    experience.context.decision.priorityIds,
  );
}
