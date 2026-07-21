import type { Signal } from "../cognitive/signals/Signal";
import type { Runtime } from "../runtime/Runtime";
import type { Unsubscribe } from "../runtime/RuntimeState";
import {
  toExperienceSessionSnapshot,
  type ExperienceSessionSnapshot,
} from "./ExperienceSessionSnapshot";

export type ExperienceSessionListener = (
  snapshot: ExperienceSessionSnapshot,
) => void;

/**
 * Framework-agnostic Experience binding (RI-003).
 * Runtime → Session snapshot → Experience; Signals → Runtime only.
 */
export type ExperienceBinding = {
  readonly getSessionSnapshot: () => ExperienceSessionSnapshot;
  readonly subscribeSession: (
    listener: ExperienceSessionListener,
  ) => Unsubscribe;
  readonly applySignal: (signal: Signal) => void;
};

export function createExperienceBinding(runtime: Runtime): ExperienceBinding {
  return {
    getSessionSnapshot: () => toExperienceSessionSnapshot(runtime.getState()),
    subscribeSession: (listener) =>
      runtime.subscribe((state) => {
        listener(toExperienceSessionSnapshot(state));
      }),
    applySignal: (signal) => {
      runtime.applySignal(signal);
    },
  };
}
