import type { DecisionState } from "../../decision-state/DecisionState";
import type { Signal } from "../../signals/Signal";
import { readPayloadString, withFocusPatch } from "./focus-patch";

export function reduceFloorChanged(
  state: DecisionState,
  signal: Signal,
): DecisionState {
  const floorId = readPayloadString(signal, "floorId");
  if (floorId === undefined) {
    return state;
  }

  return withFocusPatch(state, { floorId });
}
