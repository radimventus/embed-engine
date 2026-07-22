import type { HousePackage } from "@embed-engine/object-house";

import type { PrioritySignal } from "../priority-signals";
import type { SessionRuntimeState } from "../SessionRuntimeState";
import type { InterpretationRuleset } from "./InterpretationRule";

/**
 * Inputs to Interpretation Rules evaluation.
 * Never includes UI state.
 * Priority intent arrives only as Priority Signals (CAP-PRI-001).
 */
export type InterpretationContext = {
  readonly housePackage: HousePackage;
  readonly runtimeState: SessionRuntimeState;
  readonly rules: InterpretationRuleset;
  readonly prioritySignals: readonly PrioritySignal[];
};

export function createInterpretationContext(input: {
  readonly housePackage: HousePackage;
  readonly runtimeState: SessionRuntimeState;
  readonly rules: InterpretationRuleset;
  readonly prioritySignals?: readonly PrioritySignal[];
}): InterpretationContext {
  return Object.freeze({
    housePackage: input.housePackage,
    runtimeState: input.runtimeState,
    rules: input.rules,
    prioritySignals: Object.freeze([...(input.prioritySignals ?? [])]),
  });
}
