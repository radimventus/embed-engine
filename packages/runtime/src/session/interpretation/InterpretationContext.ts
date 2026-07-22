import type { HousePackage } from "@embed-engine/object-house";

import type { SessionRuntimeState } from "../SessionRuntimeState";
import type { InterpretationRuleset } from "./InterpretationRule";

/**
 * Inputs to Interpretation Rules evaluation.
 * Never includes UI state.
 */
export type InterpretationContext = {
  readonly housePackage: HousePackage;
  readonly runtimeState: SessionRuntimeState;
  readonly rules: InterpretationRuleset;
};

export function createInterpretationContext(input: {
  readonly housePackage: HousePackage;
  readonly runtimeState: SessionRuntimeState;
  readonly rules: InterpretationRuleset;
}): InterpretationContext {
  return Object.freeze({
    housePackage: input.housePackage,
    runtimeState: input.runtimeState,
    rules: input.rules,
  });
}
