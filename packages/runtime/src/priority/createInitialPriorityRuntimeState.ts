/**
 * Create / reset Priority Runtime state.
 */

import type { ObjectRef, PrioritySelection } from "@embed-engine/core/priority";
import type { PriorityRuntimeState } from "./PriorityRuntimeState";

const EMPTY_SELECTION: PrioritySelection = {
  selectedPriorityIds: [],
  dominantPriorityId: "",
};

export function createInitialPriorityRuntimeState(
  object: ObjectRef,
): PriorityRuntimeState {
  return {
    object,
    stage: "Selection",
    selection: EMPTY_SELECTION,
    confirmation: null,
    transitionMessage: null,
    interpretation: null,
    experience: null,
    houseMapping: null,
    followUps: null,
    completed: false,
  };
}

/**
 * Reset Journey to Selection for the same object (active Experience only — ADR-007).
 */
export function resetPriorityRuntimeState(
  state: PriorityRuntimeState,
): PriorityRuntimeState {
  return createInitialPriorityRuntimeState(state.object);
}

export function isPriorityJourneyComplete(
  state: PriorityRuntimeState,
): boolean {
  return state.completed;
}
