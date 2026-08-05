/**
 * PT-CJ-02 — Visual-only selected program for lean Commercial Journey preview.
 * No sales registry · no order mutation.
 */

import type { CommercialPilotProgramId } from './commercialPilotProgramCatalog';

let selectedProgramId: CommercialPilotProgramId | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function getCommercialJourneySelectedProgramId(): CommercialPilotProgramId | null {
  return selectedProgramId;
}

export function setCommercialJourneySelectedProgramId(
  programId: CommercialPilotProgramId | null,
): void {
  if (selectedProgramId === programId) return;
  selectedProgramId = programId;
  emit();
}

export function subscribeCommercialJourneySelection(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test helper. */
export function resetCommercialJourneySelectionForTests(): void {
  selectedProgramId = null;
  emit();
}
