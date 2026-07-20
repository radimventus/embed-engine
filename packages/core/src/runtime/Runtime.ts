import type {
  RuntimeEvent,
  RuntimeListener,
  RuntimeObjectPackage,
  RuntimeState,
} from "./RuntimeState";

/**
 * Platform Runtime skeleton.
 * Owns lifecycle and state. No business logic in M1.1.
 */
export class Runtime {
  private state: RuntimeState = { loaded: false };
  private readonly listeners = new Set<RuntimeListener>();
  private destroyed = false;

  /**
   * Bind an Object Package to this Runtime instance.
   * TODO: validate and store package; initialize modules.
   */
  async load(_objectPackage: RuntimeObjectPackage): Promise<void> {
    this.assertActive();
    this.state = { loaded: true };
    this.notify();
  }

  /**
   * Accept a runtime event.
   * TODO: route to Decision / Intelligence / modules.
   */
  async dispatch(_event: RuntimeEvent): Promise<void> {
    this.assertActive();
    // Placeholder — no behavior in M1.1.
    this.notify();
  }

  getState(): RuntimeState {
    this.assertActive();
    return this.state;
  }

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: RuntimeListener): () => void {
    this.assertActive();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.listeners.clear();
    this.destroyed = true;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private assertActive(): void {
    if (this.destroyed) {
      throw new Error("Runtime has been destroyed");
    }
  }
}
