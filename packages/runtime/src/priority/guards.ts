/**
 * Stage guards derived from Priority Experience Runtime Contract §4.2.
 * No content / Interpretation / House Mapping business logic.
 */

import type { PrioritySelection } from "@embed-engine/core/priority";
import type { PriorityRuntimeState } from "./PriorityRuntimeState";

export function isSelectionNonEmpty(selection: PrioritySelection): boolean {
  return (
    selection.selectedPriorityIds.length > 0 &&
    selection.dominantPriorityId.length > 0 &&
    selection.selectedPriorityIds.includes(selection.dominantPriorityId)
  );
}

export function hasConfirmedSelection(state: PriorityRuntimeState): boolean {
  return state.confirmation !== null && state.confirmation.accepted;
}

export function hasExperience(state: PriorityRuntimeState): boolean {
  return state.experience !== null;
}

export function hasHouseMapping(state: PriorityRuntimeState): boolean {
  return state.houseMapping !== null && state.houseMapping.entries.length > 0;
}
