import type { DecisionState } from "../../decision-state/DecisionState";
import type { Signal } from "../../signals/Signal";
import { readPayloadString, withFocusPatch } from "./focus-patch";

export function reduceQuestionOpened(
  state: DecisionState,
  signal: Signal,
): DecisionState {
  const questionId = readPayloadString(signal, "questionId");
  if (questionId === undefined) {
    return state;
  }

  return withFocusPatch(state, { questionId });
}
