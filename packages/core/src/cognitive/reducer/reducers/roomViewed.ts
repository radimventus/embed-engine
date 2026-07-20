import type { DecisionState } from "../../decision-state/DecisionState";
import type { Signal } from "../../signals/Signal";
import { readPayloadString, withFocusPatch } from "./focus-patch";

export function reduceRoomViewed(
  state: DecisionState,
  signal: Signal,
): DecisionState {
  const roomId = readPayloadString(signal, "roomId");
  if (roomId === undefined) {
    return state;
  }

  return withFocusPatch(state, { roomId });
}
