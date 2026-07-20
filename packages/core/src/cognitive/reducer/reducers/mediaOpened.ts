import type { DecisionState } from "../../decision-state/DecisionState";
import type { Signal } from "../../signals/Signal";
import { readPayloadString, withFocusPatch } from "./focus-patch";

export function reduceMediaOpened(
  state: DecisionState,
  signal: Signal,
): DecisionState {
  const mediaId = readPayloadString(signal, "mediaId");
  if (mediaId === undefined) {
    return state;
  }

  return withFocusPatch(state, { mediaId });
}
