import type {
  RuntimeListener,
  RuntimeState,
  RuntimeStatus,
  RuntimeObjectPackage,
  Unsubscribe,
} from "./RuntimeState";
import type { DecisionState } from "../cognitive/decision-state/DecisionState";
import type { Interpretation } from "../cognitive/interpretation/Interpretation";

function createInitialState(): RuntimeState {
  return {
    status: "idle",
    version: 0,
  };
}

/**
 * Sole owner of RuntimeState.
 * Performs atomic replacement and listener notification.
 */
export class StateManager {
  private state: RuntimeState = createInitialState();
  private readonly listeners = new Set<RuntimeListener>();

  getState(): RuntimeState {
    return this.snapshot();
  }

  subscribe(listener: RuntimeListener): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Replace the full state atomically and notify listeners.
   */
  replaceState(next: RuntimeState): void {
    this.state = next;
    this.notify();
  }

  /**
   * Advance status/package and bump version by one.
   * Preserves cognitive snapshots unless explicitly replaced.
   */
  advance(next: {
    readonly status: RuntimeStatus;
    readonly objectPackage?: RuntimeObjectPackage;
    readonly decisionState?: DecisionState;
    readonly interpretation?: Interpretation;
  }): void {
    this.replaceState({
      status: next.status,
      objectPackage: next.objectPackage,
      version: this.state.version + 1,
      decisionState:
        next.decisionState !== undefined
          ? next.decisionState
          : this.state.decisionState,
      interpretation:
        next.interpretation !== undefined
          ? next.interpretation
          : this.state.interpretation,
    });
  }

  clearListeners(): void {
    this.listeners.clear();
  }

  private snapshot(): RuntimeState {
    return Object.freeze({
      status: this.state.status,
      objectPackage: this.state.objectPackage,
      version: this.state.version,
      decisionState: this.state.decisionState,
      interpretation: this.state.interpretation,
    });
  }

  private notify(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
