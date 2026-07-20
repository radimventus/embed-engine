import {
  createInitialRuntimeState,
  type RuntimeEvent,
  type RuntimeListener,
  type RuntimeObjectPackage,
  type RuntimeState,
} from "./RuntimeState";

/**
 * Platform Runtime skeleton.
 * Owns lifecycle and RuntimeState. No business logic in M1.2.
 */
export class Runtime {
  private state: RuntimeState = createInitialRuntimeState();
  private readonly listeners = new Set<RuntimeListener>();

  /**
   * Bind an Object Package to this Runtime instance.
   * Transitions: idle|ready → loading → ready.
   */
  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    this.assertNotDestroyed();

    this.replaceState({
      status: "loading",
      objectPackage: this.state.objectPackage,
      version: this.state.version + 1,
    });

    this.replaceState({
      status: "ready",
      objectPackage,
      version: this.state.version + 1,
    });
  }

  /**
   * Accept a runtime event.
   * TODO: route to Decision / Intelligence / modules.
   */
  async dispatch(_event: RuntimeEvent): Promise<void> {
    this.assertNotDestroyed();
    // Placeholder — no state change in M1.2.
  }

  getState(): RuntimeState {
    return this.snapshot();
  }

  /**
   * Subscribe to RuntimeState changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: RuntimeListener): () => void {
    this.assertNotDestroyed();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Transitions: * → destroyed.
   */
  destroy(): void {
    if (this.state.status === "destroyed") {
      return;
    }

    this.replaceState({
      status: "destroyed",
      objectPackage: this.state.objectPackage,
      version: this.state.version + 1,
    });

    this.listeners.clear();
  }

  private replaceState(next: RuntimeState): void {
    this.state = next;
    this.notify();
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

  private assertNotDestroyed(): void {
    if (this.state.status === "destroyed") {
      throw new Error("Runtime has been destroyed");
    }
  }
}
