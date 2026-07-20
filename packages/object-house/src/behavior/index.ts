import { createPackStoryComposer } from "@embed-engine/core/decision-layer";
import type { DecisionStoryComposer } from "@embed-engine/core/decision-layer";

import { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";
import { spliceStairsWarnIfNeeded } from "./splice-stairs-warn";

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
export {
  STAIRS_WARN_MOVE_ID,
  spliceStairsWarnIfNeeded,
} from "./splice-stairs-warn";

/**
 * Disposition Layout Strategy composer.
 * Compose spine, then apply the single FLOOR_CHANGED stairs splice (Slice C).
 */
export function createDispositionLayoutComposer(): DecisionStoryComposer {
  const compose = createPackStoryComposer(DISPOSITION_LAYOUT_PACK);
  return (input) => spliceStairsWarnIfNeeded(compose(input), input);
}

export function getDispositionMove(moveId: string) {
  return DISPOSITION_LAYOUT_PACK.moves.find((move) => move.id === moveId);
}
