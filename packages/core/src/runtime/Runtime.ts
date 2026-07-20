import { Kernel } from "./Kernel";
import type {
  RuntimeEvent,
  RuntimeListener,
  RuntimeObjectPackage,
  RuntimeState,
  Unsubscribe,
} from "./RuntimeState";

/**
 * Public Runtime façade.
 * Owns Kernel. Exposes lifecycle and state access only.
 */
export class Runtime {
  private readonly kernel = new Kernel();

  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.load(objectPackage);
  }

  async dispatch(event: RuntimeEvent): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.dispatch(event);
  }

  getState(): RuntimeState {
    return this.kernel.getState();
  }

  subscribe(listener: RuntimeListener): Unsubscribe {
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
