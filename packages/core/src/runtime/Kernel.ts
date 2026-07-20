import type { RuntimeEvent, RuntimeObjectPackage } from "./RuntimeState";

/**
 * Internal orchestration layer owned by Runtime.
 * Placeholder skeleton — no business logic in M1.3.
 */
export class Kernel {
  /**
   * TODO: bind Object Package; initialize modules.
   */
  async load(_objectPackage: RuntimeObjectPackage): Promise<void> {}

  /**
   * TODO: event orchestration / intelligence pipeline.
   */
  async dispatch(_event: RuntimeEvent): Promise<void> {}

  /**
   * TODO: tear down modules and pipeline resources.
   */
  destroy(): void {}
}
