import type { RuntimeEvent } from "./RuntimeState";

/**
 * Routes RuntimeEvent instances.
 * No state mutation. No business logic.
 */
export class EventDispatcher {
  async dispatch(_event: RuntimeEvent): Promise<void> {
    // Future: route to handlers / pipeline.
  }
}
