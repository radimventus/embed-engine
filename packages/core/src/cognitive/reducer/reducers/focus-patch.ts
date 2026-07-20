import type { DecisionState } from "../../decision-state/DecisionState";
import type { Focus } from "../../focus/Focus";
import type { Signal } from "../../signals/Signal";

/**
 * Returns a new DecisionState with Focus patched.
 * Unchanged sub-aggregates are reused by reference.
 */
export function withFocusPatch(
  state: DecisionState,
  patch: Focus,
): DecisionState {
  return Object.freeze({
    ...state,
    focus: Object.freeze({
      ...state.focus,
      ...patch,
    }),
  });
}

export function readPayloadString(
  signal: Signal,
  key: string,
): string | undefined {
  const value = signal.payload[key];
  return typeof value === "string" ? value : undefined;
}
