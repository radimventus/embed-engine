import type { InterpretationPriorityId } from "../cognitive/interpretation/project";

/**
 * Priority identifiers — same set as Interpretation / Priority Engine cards.
 */
export type PriorityId = InterpretationPriorityId;

/**
 * Current Priority Engine selection.
 * Domain input to ExperienceComposer — not a UI model.
 */
export type PrioritySelection = {
  readonly selected: readonly PriorityId[];
};

export function createEmptyPrioritySelection(): PrioritySelection {
  return Object.freeze({
    selected: Object.freeze([] as PriorityId[]),
  });
}
