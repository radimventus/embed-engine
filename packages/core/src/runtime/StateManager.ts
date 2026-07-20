import {
  createInitialRuntimeState,
  type RuntimeListener,
  type RuntimeState,
} from "./RuntimeState";

export type Unsubscribe = () => void;

/**
 * Internal owner of RuntimeState.
 * Sole service allowed to replace state and notify listeners.
 */
export class StateManager {
  private state: RuntimeState = createInitialRuntimeState();
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

  replaceState(next: RuntimeState): void {
    this.state = next;
    this.notify();
  }

  clearListeners(): void {
    this.listeners.clear();
  }

  private snapshot(): RuntimeState {
    return Object.freeze({
      status: this.state.status,
      objectPackage: this.state.objectPackage,
      version: this.state.version,
    });
  }

  private notify(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
