import { createPackStoryComposer } from "@embed-engine/core/decision-layer";
import type { DecisionStoryComposer } from "@embed-engine/core/decision-layer";

import { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";

export { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";

/** CAP-P03 — Decision Strategy for the Disposition Layout pack. */
export function createDispositionLayoutComposer(): DecisionStoryComposer {
  return createPackStoryComposer(DISPOSITION_LAYOUT_PACK);
}

export function getDispositionMove(moveId: string) {
  return DISPOSITION_LAYOUT_PACK.moves.find((move) => move.id === moveId);
}
