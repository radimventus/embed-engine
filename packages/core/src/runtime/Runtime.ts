import { Kernel } from "./Kernel";
import {
  createInitialRuntimeState,
  type RuntimeEvent,
  type RuntimeListener,
  type RuntimeObjectPackage,
  type RuntimeState,
} from "./RuntimeState";

/**
 * Platform Runtime.
 * Public façade: API, lifecycle, state ownership.
 * Orchestration is delegated to Kernel.
 */
export class Runtime {
  private state: RuntimeState = createInitialRuntimeState();
  private readonly listeners = new Set<RuntimeListener>();
  private readonly kernel: Kernel;

  constructor() {
    this.kernel = new Kernel();
  }

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

    await this.kernel.load(objectPackage);

    this.replaceState({
      status: "ready",
      objectPackage,
      version: this.state.version + 1,
    });
  }

  /**
   * Accept a runtime event.
   * Delegates orchestration to Kernel.
   */
  async dispatch(event: RuntimeEvent): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.dispatch(event);
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

    this.kernel.destroy();

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
