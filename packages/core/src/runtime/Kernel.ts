import { EventDispatcher } from "./EventDispatcher";
import { ModuleRegistry } from "./ModuleRegistry";
import { StateManager } from "./StateManager";
import type { RuntimeEvent, RuntimeObjectPackage } from "./RuntimeState";

/**
 * Internal orchestration layer owned by Runtime.
 * Owns EventDispatcher, StateManager, and ModuleRegistry.
 */
export class Kernel {
  private readonly dispatcher: EventDispatcher;
  private readonly stateManager: StateManager;
  private readonly moduleRegistry: ModuleRegistry;

  constructor() {
    this.dispatcher = new EventDispatcher();
    this.stateManager = new StateManager();
    this.moduleRegistry = new ModuleRegistry();
  }

  /**
   * Internal registry for Kernel module wiring.
   * Not part of the public Runtime API.
   */
  getModules(): ModuleRegistry {
    return this.moduleRegistry;
  }

  getState() {
    return this.stateManager.getState();
  }

  subscribe(listener: Parameters<StateManager["subscribe"]>[0]) {
    return this.stateManager.subscribe(listener);
  }

  /**
   * Transitions: idle|ready → loading → ready.
   * TODO: initialize modules after package bind.
   */
  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    const current = this.stateManager.getState();

    this.stateManager.replaceState({
      status: "loading",
      objectPackage: current.objectPackage,
      version: current.version + 1,
    });

    // TODO: bind Object Package; initialize modules.

    this.stateManager.replaceState({
      status: "ready",
      objectPackage,
      version: this.stateManager.getState().version + 1,
    });
  }

  /**
   * Routes the event through EventDispatcher.
   */
  async dispatch(event: RuntimeEvent): Promise<void> {
    await this.dispatcher.dispatch(event);
  }

  /**
   * Transitions: * → destroyed.
   * TODO: tear down modules and pipeline resources.
   */
  destroy(): void {
    const current = this.stateManager.getState();
    if (current.status === "destroyed") {
      return;
    }

    // TODO: tear down modules and pipeline resources.

    this.stateManager.replaceState({
      status: "destroyed",
      objectPackage: current.objectPackage,
      version: current.version + 1,
    });

    this.stateManager.clearListeners();
  }
}
