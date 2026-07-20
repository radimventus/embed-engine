import type { Signal } from "../cognitive/signals/Signal";
import type { DecisionStoryComposer } from "../decision-layer/composeDecisionStory";
import { Kernel } from "./Kernel";
import type {
  RuntimeEvent,
  RuntimeListener,
  RuntimeObjectPackage,
  RuntimeState,
  Unsubscribe,
} from "./RuntimeState";

export type RuntimeOptions = {
  readonly storyComposer?: DecisionStoryComposer;
};

/**
 * Public Runtime façade.
 * Owns Kernel. Exposes lifecycle, signal application, and state access.
 */
export class Runtime {
  private readonly kernel: Kernel;

  constructor(options: RuntimeOptions = {}) {
    this.kernel = new Kernel(options);
  }

  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.load(objectPackage);
  }

  async dispatch(event: RuntimeEvent): Promise<void> {
    this.assertNotDestroyed();
    await this.kernel.dispatch(event);
  }

  /**
   * Apply a Cognitive Signal through reduce → project → (optional) Strategy.
   */
  applySignal(signal: Signal): void {
    this.assertNotDestroyed();
    this.kernel.applySignal(signal);
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
