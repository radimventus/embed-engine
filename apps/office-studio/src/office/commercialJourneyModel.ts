/**
 * PT-CJ-OS-01 — Commercial Journey catalog (Office production preview).
 * Navigation + display only — no business logic · no state mutations.
 */

import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export type CommercialJourneyStepId =
  | 'welcome'
  | 'pilot_program'
  | 'order_confirmation'
  | 'payment'
  | 'pilot_confirmed'
  | 'office_handoff';

export type CommercialJourneyStepState = 'done' | 'active' | 'waiting';

export type CommercialJourneyStep = {
  readonly id: CommercialJourneyStepId;
  readonly label: string;
  readonly state: CommercialJourneyStepState;
};

/** Commercial Journey — partner-facing production path. */
export const COMMERCIAL_JOURNEY_STEP_DEFS: readonly {
  readonly id: CommercialJourneyStepId;
  readonly label: string;
}[] = Object.freeze([
  { id: 'welcome', label: 'Welcome' },
  { id: 'pilot_program', label: 'Pilot Program' },
  { id: 'order_confirmation', label: 'Order Confirmation' },
  { id: 'payment', label: 'Payment' },
  { id: 'pilot_confirmed', label: 'Pilot Confirmed' },
  { id: 'office_handoff', label: 'Office Handoff' },
]);

/**
 * Soft projection of case status → active journey index (preview hint only).
 * Does not mutate commercial state.
 */
const STATUS_TO_JOURNEY_INDEX: Readonly<
  Record<PilotWorkspaceCase['status'], number>
> = Object.freeze({
  offer: 1,
  checkout: 2,
  waiting_payment: 3,
  paid: 4,
  pilot_ready: 5,
});

function stateForIndex(
  index: number,
  activeIndex: number,
): CommercialJourneyStepState {
  if (index < activeIndex) return 'done';
  if (index === activeIndex) return 'active';
  return 'waiting';
}

export function buildCommercialJourneySteps(
  activeCase: PilotWorkspaceCase | null,
): readonly CommercialJourneyStep[] {
  if (activeCase === null) {
    return COMMERCIAL_JOURNEY_STEP_DEFS.map((step) => ({
      ...step,
      state: 'waiting' as const,
    }));
  }

  const activeIndex = STATUS_TO_JOURNEY_INDEX[activeCase.status];
  return COMMERCIAL_JOURNEY_STEP_DEFS.map((step, index) => ({
    ...step,
    state: stateForIndex(index, activeIndex),
  }));
}

export function activeCommercialJourneyStepId(
  steps: readonly CommercialJourneyStep[],
): CommercialJourneyStepId | null {
  return steps.find((step) => step.state === 'active')?.id ?? null;
}

export function isCommercialJourneyStepId(
  value: string,
): value is CommercialJourneyStepId {
  return COMMERCIAL_JOURNEY_STEP_DEFS.some((step) => step.id === value);
}

export const COMMERCIAL_JOURNEY_DEFAULT_STEP: CommercialJourneyStepId =
  'welcome';
