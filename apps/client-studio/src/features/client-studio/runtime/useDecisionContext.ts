import {
  buildDecisionContext,
  projectPriorityPipelineStory,
  type DecisionContext,
} from '@embed-engine/runtime';

import { useDecisionSessionRuntime } from './DecisionSessionRuntimeProvider';

/**
 * PT-003 — Decision Context for Experience modules.
 * Sole interpretive input: Runtime DecisionContext (not Decision Story copy).
 */
export function useDecisionContext(): DecisionContext {
  const { experience } = useDecisionSessionRuntime();
  const story = projectPriorityPipelineStory(
    experience.context.decision.priorityIds,
    0,
  );
  return buildDecisionContext(story);
}
