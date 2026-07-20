import { createPackStoryComposer } from "@embed-engine/core/decision-layer";
import type { DecisionStoryComposer } from "@embed-engine/core/decision-layer";

import { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";

export { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";
export {
  HOUSEHOLD_CHOICES,
  HOUSEHOLD_PROFILES,
  HOUSEHOLD_PROFILE_FACT_KEY,
  isHouseholdProfile,
  recommendPromptFor,
  resolveDispositionOutcome,
  type HouseholdChoice,
  type HouseholdProfile,
} from "./household-outcome";

/** Decision Strategy composer for the Disposition Layout pack. */
export function createDispositionLayoutComposer(): DecisionStoryComposer {
  return createPackStoryComposer(DISPOSITION_LAYOUT_PACK);
}

export function getDispositionMove(moveId: string) {
  return DISPOSITION_LAYOUT_PACK.moves.find((move) => move.id === moveId);
}
