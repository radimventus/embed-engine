/**
 * CAP-OP-06 / PT-09 — Workflow Runtime domain.
 * Projection of commercial-case state — no owned data · no persistence.
 */

import type {
  PilotTerminalViewId,
  PilotWorkspaceCase,
  PilotWorkspaceCaseStatus,
} from './pilotWorkspaceModel';

export type PilotWorkflowStepId =
  | 'offer'
  | 'order'
  | 'proforma'
  | 'qr_payment'
  | 'pilot_ready'
  | 'builder'
  | 'active_partner';

/** dokončeno · aktivní · čekající */
export type PilotWorkflowStepState = 'done' | 'active' | 'waiting';

export type PilotWorkflowStep = {
  readonly id: PilotWorkflowStepId;
  readonly label: string;
  readonly state: PilotWorkflowStepState;
  readonly terminalView: PilotTerminalViewId;
  readonly contextHint: string;
};

export const PILOT_WORKFLOW_STEP_DEFS: readonly {
  readonly id: PilotWorkflowStepId;
  readonly label: string;
  readonly terminalView: PilotTerminalViewId;
  readonly contextHint: string;
}[] = Object.freeze([
  {
    id: 'offer',
    label: 'Nabídka',
    terminalView: 'detail',
    contextHint: 'Detail nabídky a balíčku',
  },
  {
    id: 'order',
    label: 'Objednávka',
    terminalView: 'detail',
    contextHint: 'Detail objednávky a kontaktů',
  },
  {
    id: 'proforma',
    label: 'Proforma',
    terminalView: 'timeline',
    contextHint: 'Timeline · obchodní události proformy',
  },
  {
    id: 'qr_payment',
    label: 'QR Platba',
    terminalView: 'timeline',
    contextHint: 'Timeline · platba a QR',
  },
  {
    id: 'pilot_ready',
    label: 'Pilot Ready',
    terminalView: 'timeline',
    contextHint: 'Timeline · Pilot Ready',
  },
  {
    id: 'builder',
    label: 'Builder',
    terminalView: 'workflow',
    contextHint: 'Workflow plocha · Builder handoff',
  },
  {
    id: 'active_partner',
    label: 'Active Partner',
    terminalView: 'detail',
    contextHint: 'Detail · Partner Environment',
  },
]);

export const PILOT_WORKFLOW_STEP_STATE_LABELS: Readonly<
  Record<PilotWorkflowStepState, string>
> = Object.freeze({
  done: 'dokončeno',
  active: 'aktivní',
  waiting: 'čekající',
});

/**
 * Commercial status → active step index among the first five commercial steps.
 * Builder / Active Partner follow Partner Environment after Pilot Ready.
 */
const STATUS_TO_COMMERCIAL_INDEX: Readonly<
  Record<PilotWorkspaceCaseStatus, number>
> = Object.freeze({
  offer: 0,
  checkout: 1,
  waiting_payment: 3,
  paid: 4,
  pilot_ready: 4,
});

function stateForIndex(
  index: number,
  activeIndex: number,
): PilotWorkflowStepState {
  if (index < activeIndex) return 'done';
  if (index === activeIndex) return 'active';
  return 'waiting';
}

/**
 * Build workflow projection from case status — no Event Catalog auto-drive.
 */
export function buildWorkflowSteps(
  activeCase: PilotWorkspaceCase | null,
): readonly PilotWorkflowStep[] {
  if (activeCase === null) {
    return PILOT_WORKFLOW_STEP_DEFS.map((step) => ({
      ...step,
      state: 'waiting' as const,
    }));
  }

  const commercialActive = STATUS_TO_COMMERCIAL_INDEX[activeCase.status];
  const pe = activeCase.partnerEnvironment.state;

  let builderState: PilotWorkflowStepState = 'waiting';
  let partnerState: PilotWorkflowStepState = 'waiting';

  if (activeCase.status === 'pilot_ready' || commercialActive >= 4) {
    if (activeCase.status === 'pilot_ready') {
      // Pilot Ready commercial step is done; PE drives builder / partner.
      if (pe === 'not_prepared' || pe === 'preparing') {
        builderState = 'active';
        partnerState = 'waiting';
      } else if (pe === 'ready') {
        builderState = 'done';
        partnerState = 'active';
      } else {
        builderState = 'done';
        partnerState = 'done';
      }
    } else if (activeCase.status === 'paid') {
      builderState = 'waiting';
      partnerState = 'waiting';
    }
  }

  return PILOT_WORKFLOW_STEP_DEFS.map((step, index) => {
    if (step.id === 'builder') {
      return { ...step, state: builderState };
    }
    if (step.id === 'active_partner') {
      return { ...step, state: partnerState };
    }

    // Commercial steps 0..4
    let activeIndex = commercialActive;
    if (activeCase.status === 'pilot_ready') {
      // Mark Pilot Ready as done when PE progression starts.
      activeIndex = 5;
    }
    return {
      ...step,
      state: stateForIndex(index, activeIndex),
    };
  });
}

export function activeWorkflowStepId(
  steps: readonly PilotWorkflowStep[],
): PilotWorkflowStepId | null {
  return steps.find((step) => step.state === 'active')?.id ?? null;
}

export function workflowStepById(
  steps: readonly PilotWorkflowStep[],
  stepId: PilotWorkflowStepId,
): PilotWorkflowStep | null {
  return steps.find((step) => step.id === stepId) ?? null;
}
