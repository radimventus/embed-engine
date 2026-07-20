import type { RuntimeEvent } from "./RuntimeState";

/**
 * Internal Kernel service for routing runtime events.
 * Not an event bus. No business logic in M1.4.
 */
export class EventDispatcher {
  /**
   * TODO: route RuntimeEvent to future handlers / pipeline.
   */
  async dispatch(_event: RuntimeEvent): Promise<void> {}
}
