import { Kernel } from "./Kernel";
import type {
  RuntimeEvent,
  RuntimeListener,
  RuntimeObjectPackage,
  RuntimeState,
} from "./RuntimeState";

/**
 * Platform Runtime.
 * Public façade: API and Kernel ownership.
 * State access delegates to Kernel → StateManager.
 */
export class Runtime {
  private readonly kernel: Kernel;

  constructor() {
    this.kernel = new Kernel();
  }

  /**
   * Bind an Object Package to this Runtime instance.
   */
  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.load(objectPackage);
  }

  /**
   * Accept a runtime event.
   */
  async dispatch(event: RuntimeEvent): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.dispatch(event);
  }

  getState(): RuntimeState {
    return this.kernel.getState();
  }

  /**
   * Subscribe to RuntimeState changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: RuntimeListener): () => void {
    this.assertNotDestroyed();
    return this.kernel.subscribe(listener);
  }

  destroy(): void {
    this.kernel.destroy();
  }

  private assertNotDestroyed(): void {
    if (this.kernel.getState().status === "destroyed") {
      throw new Error("Runtime has been destroyed");
    }
  }
}
