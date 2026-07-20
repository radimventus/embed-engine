import { EventDispatcher } from "./EventDispatcher";
import type { RuntimeEvent, RuntimeObjectPackage } from "./RuntimeState";

/**
 * Internal orchestration layer owned by Runtime.
 * Owns EventDispatcher. No business logic in M1.4.
 */
export class Kernel {
  private readonly dispatcher: EventDispatcher;

  constructor() {
    this.dispatcher = new EventDispatcher();
  }

  /**
   * TODO: bind Object Package; initialize modules.
   */
  async load(_objectPackage: RuntimeObjectPackage): Promise<void> {}

  /**
   * Routes the event through EventDispatcher.
   */
  async dispatch(event: RuntimeEvent): Promise<void> {
    await this.dispatcher.dispatch(event);
  }

  /**
   * TODO: tear down modules and pipeline resources.
   */
  destroy(): void {}
}
