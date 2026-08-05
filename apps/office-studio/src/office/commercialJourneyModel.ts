/**
 * PT-CJ-05 — Commercial Journey v1.0 catalog (partner purchase path).
 * Navigation + display only — no Business Automation · no Office handoff UI.
 */

import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export type CommercialJourneyStepId =
  | 'welcome'
  | 'pilot_program'
  | 'complete_order'
  | 'payment'
  | 'conis_studio';

export type CommercialJourneyStepState = 'done' | 'active' | 'waiting';

export type CommercialJourneyStep = {
  readonly id: CommercialJourneyStepId;
  readonly label: string;
  readonly state: CommercialJourneyStepState;
};

/** Partner-facing Commercial Journey — five steps only. */
export const COMMERCIAL_JOURNEY_STEP_DEFS: readonly {
  readonly id: CommercialJourneyStepId;
  readonly label: string;
}[] = Object.freeze([
  { id: 'welcome', label: 'Vítejte' },
  { id: 'pilot_program', label: 'Pilotní program' },
  { id: 'complete_order', label: 'Dokončit objednávku' },
  { id: 'payment', label: 'Platba' },
  { id: 'conis_studio', label: 'CONIS Studio' },
]);

/**
 * Soft projection of case status → active journey index (preview hint only).
 */
const STATUS_TO_JOURNEY_INDEX: Readonly<
  Record<PilotWorkspaceCase['status'], number>
> = Object.freeze({
  offer: 1,
  checkout: 2,
  waiting_payment: 3,
  paid: 4,
  pilot_ready: 4,
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
