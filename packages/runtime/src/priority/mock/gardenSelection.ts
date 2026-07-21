/**
 * Mock PrioritySelection for Garden Journey (priority-garden.md).
 */

import type { PrioritySelection } from "@embed-engine/core/priority";
import { GARDEN_PRIORITY_ID } from "./gardenContentPackage";

/** MVP: one dominant lens — Garden. */
export const gardenPrioritySelection: PrioritySelection = {
  selectedPriorityIds: [GARDEN_PRIORITY_ID],
  dominantPriorityId: GARDEN_PRIORITY_ID,
};
