import type { DecisionDefinition } from "./DecisionDefinition";
import type { DecisionRegistry } from "./DecisionRegistry";

/**
 * Immutable in-memory DecisionRegistry.
 * Definitions are fixed at construction; not mutated during dispatch.
 */
export class DefaultDecisionRegistry implements DecisionRegistry {
  private readonly definitions: ReadonlyMap<string, DecisionDefinition>;

  constructor(definitions: readonly DecisionDefinition[] = []) {
    this.definitions = new Map(
      definitions.map((definition) => [definition.id, definition]),
    );
  }

  get(id: string): DecisionDefinition | undefined {
    return this.definitions.get(id);
  }
}
