/**
 * CAP-OP-06 / PT-09 — Workflow ↔ Event Catalog integration interface.
 * Future catalog-driven status without UI refactor. No auto-switch in PT-09.
 */

import type { PilotTimelineEvent } from './pilotTimelineModel';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';
import type {
  PilotWorkflowStep,
  PilotWorkflowStepId,
} from './pilotWorkflowModel';

export type PilotWorkflowCatalogProjectionInput = {
  readonly activeCase: PilotWorkspaceCase | null;
  readonly events: readonly PilotTimelineEvent[];
};

/**
 * Optional projector — default runtime uses case status only.
 * PT-10+ may supply Event Catalog–aware projection.
 */
export type PilotWorkflowCatalogProjector = {
  readonly projectSteps: (
    input: PilotWorkflowCatalogProjectionInput,
  ) => readonly PilotWorkflowStep[];
};

export type PilotWorkflowNavigationEvent = {
  readonly type: 'workflow.step.navigated';
  readonly occurredAt: string;
  readonly stepId: PilotWorkflowStepId;
  readonly caseId: string | null;
  readonly terminalView: string;
};

import type { PilotWorkflowMessageIntegration } from './pilotWorkflowMessageEvents';

export type PilotWorkflowCatalogIntegration = {
  readonly projector?: PilotWorkflowCatalogProjector;
  readonly emitNavigationEvent?: (
    event: PilotWorkflowNavigationEvent,
  ) => Promise<void> | void;
} & PilotWorkflowMessageIntegration;

export function buildWorkflowNavigationEvent(input: {
  readonly stepId: PilotWorkflowStepId;
  readonly caseId: string | null;
  readonly terminalView: string;
  readonly occurredAt?: string;
}): PilotWorkflowNavigationEvent {
  return {
    type: 'workflow.step.navigated',
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    stepId: input.stepId,
    caseId: input.caseId,
    terminalView: input.terminalView,
  };
}
