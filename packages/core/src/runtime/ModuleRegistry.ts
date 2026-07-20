import type { RuntimeModule } from "./RuntimeModule";

/**
 * Internal Kernel service for module registration and lookup.
 * No orchestration or business logic in M1.6.
 */
export class ModuleRegistry {
  private readonly modules = new Map<string, RuntimeModule>();

  register(module: RuntimeModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module already registered: ${module.id}`);
    }
    this.modules.set(module.id, module);
  }

  get(id: string): RuntimeModule | undefined {
    return this.modules.get(id);
  }

  getAll(): readonly RuntimeModule[] {
    return [...this.modules.values()];
  }
}
