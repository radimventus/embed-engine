/**
 * CAP-OP-06 / PT-09 — Workflow Runtime (projection + navigation selection).
 */

import type { PilotWorkspaceCase } from './pilotWorkspaceModel';
import {
  activeWorkflowStepId,
  buildWorkflowSteps,
  type PilotWorkflowStep,
  type PilotWorkflowStepId,
} from './pilotWorkflowModel';
import type { PilotWorkflowCatalogProjector } from './pilotWorkflowCatalog';
import type { PilotTimelineEvent } from './pilotTimelineModel';

export type PilotWorkflowRuntimeState = {
  readonly steps: readonly PilotWorkflowStep[];
  readonly projectedActiveStepId: PilotWorkflowStepId | null;
  /** User-highlighted step from navigator click (may differ from projected). */
  readonly highlightedStepId: PilotWorkflowStepId | null;
};

export type PilotWorkflowRuntimeAction =
  | {
      readonly type: 'project-case';
      readonly activeCase: PilotWorkspaceCase | null;
      readonly events?: readonly PilotTimelineEvent[];
      readonly projector?: PilotWorkflowCatalogProjector;
    }
  | {
      readonly type: 'highlight-step';
      readonly stepId: PilotWorkflowStepId | null;
    };

export function createInitialWorkflowRuntimeState(
  activeCase: PilotWorkspaceCase | null = null,
): PilotWorkflowRuntimeState {
  const steps = buildWorkflowSteps(activeCase);
  return {
    steps,
    projectedActiveStepId: activeWorkflowStepId(steps),
    highlightedStepId: activeWorkflowStepId(steps),
  };
}

export function reducePilotWorkflow(
  state: PilotWorkflowRuntimeState,
  action: PilotWorkflowRuntimeAction,
): PilotWorkflowRuntimeState {
  switch (action.type) {
    case 'project-case': {
      const steps =
        action.projector !== undefined
          ? action.projector.projectSteps({
              activeCase: action.activeCase,
              events: action.events ?? [],
            })
          : buildWorkflowSteps(action.activeCase);
      const projectedActiveStepId = activeWorkflowStepId(steps);
      return {
        steps,
        projectedActiveStepId,
        highlightedStepId: projectedActiveStepId,
      };
    }
    case 'highlight-step':
      return {
        ...state,
        highlightedStepId: action.stepId,
      };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
