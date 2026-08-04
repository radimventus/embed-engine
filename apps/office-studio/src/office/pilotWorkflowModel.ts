/**
 * PT-CJ-OS-01 — Workflow model = Commercial Journey (Office preview mode).
 * Replaces internal ops workflow. No business logic.
 */

import type { PilotWorkspaceCase } from './pilotWorkspaceModel';
import {
  activeCommercialJourneyStepId,
  buildCommercialJourneySteps,
  COMMERCIAL_JOURNEY_DEFAULT_STEP,
  COMMERCIAL_JOURNEY_STEP_DEFS,
  isCommercialJourneyStepId,
  type CommercialJourneyStepId,
  type CommercialJourneyStepState,
} from './commercialJourneyModel';

/** @deprecated Use CommercialJourneyStepId — alias for workflow runtime. */
export type PilotWorkflowStepId = CommercialJourneyStepId;

export type PilotWorkflowStepState = CommercialJourneyStepState;

export type PilotWorkflowStep = {
  readonly id: PilotWorkflowStepId;
  readonly label: string;
  readonly state: PilotWorkflowStepState;
  /** Always journey — Working Terminal renders production screen by step id. */
  readonly terminalView: 'journey';
};

/** Workshop catalog = Commercial Journey. */
export const PILOT_WORKFLOW_STEP_DEFS: readonly {
  readonly id: PilotWorkflowStepId;
  readonly label: string;
  readonly terminalView: 'journey';
}[] = Object.freeze(
  COMMERCIAL_JOURNEY_STEP_DEFS.map((step) => ({
    ...step,
    terminalView: 'journey' as const,
  })),
);

export function buildWorkflowSteps(
  activeCase: PilotWorkspaceCase | null,
): readonly PilotWorkflowStep[] {
  return buildCommercialJourneySteps(activeCase).map((step) => ({
    ...step,
    terminalView: 'journey' as const,
  }));
}

export function activeWorkflowStepId(
  steps: readonly PilotWorkflowStep[],
): PilotWorkflowStepId | null {
  return activeCommercialJourneyStepId(steps);
}

export function workflowStepById(
  steps: readonly PilotWorkflowStep[],
  stepId: PilotWorkflowStepId,
): PilotWorkflowStep | null {
  return steps.find((step) => step.id === stepId) ?? null;
}

export {
  COMMERCIAL_JOURNEY_DEFAULT_STEP,
  COMMERCIAL_JOURNEY_STEP_DEFS,
  isCommercialJourneyStepId,
};
