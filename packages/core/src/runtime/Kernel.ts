import { EventDispatcher } from "./EventDispatcher";
import { ModuleRegistry } from "./ModuleRegistry";
import { StateManager } from "./StateManager";
import type {
  RuntimeEvent,
  RuntimeListener,
  RuntimeObjectPackage,
  RuntimeState,
  Unsubscribe,
} from "./RuntimeState";

/**
 * Internal orchestrator owned by Runtime.
 * Coordinates EventDispatcher, StateManager, and ModuleRegistry.
 */
export class Kernel {
  private readonly eventDispatcher = new EventDispatcher();
  private readonly stateManager = new StateManager();
  private readonly moduleRegistry = new ModuleRegistry();

  getState(): RuntimeState {
    return this.stateManager.getState();
  }

  subscribe(listener: RuntimeListener): Unsubscribe {
    return this.stateManager.subscribe(listener);
  }

  /**
   * idle|ready → loading → ready
   */
  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    const current = this.stateManager.getState();

    this.stateManager.advance({
      status: "loading",
      objectPackage: current.objectPackage,
    });

    // Future: bind package; initialize registered modules.
    void this.moduleRegistry.getAll();

    this.stateManager.advance({
      status: "ready",
      objectPackage,
    });
  }

  async dispatch(event: RuntimeEvent): Promise<void> {
    await this.eventDispatcher.dispatch(event);
  }

  /**
   * * → destroyed
   */
  destroy(): void {
    const current = this.stateManager.getState();
    if (current.status === "destroyed") {
      return;
    }

    // Future: tear down registered modules.
    void this.moduleRegistry.getAll();

    this.stateManager.advance({
      status: "destroyed",
      objectPackage: current.objectPackage,
    });

    this.stateManager.clearListeners();
  }
}
