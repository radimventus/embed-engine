import type { DecisionDefinition } from "./DecisionDefinition";
import type { DecisionRegistry } from "./DecisionRegistry";
import { InvalidDecisionGraphError } from "./InvalidDecisionGraphError";

/**
 * Immutable in-memory DecisionRegistry.
 * Definitions and graph edges are fixed at construction.
 */
export class DefaultDecisionRegistry implements DecisionRegistry {
  private readonly definitions: ReadonlyMap<string, DecisionDefinition>;
  private readonly ordered: readonly DecisionDefinition[];

  constructor(definitions: readonly DecisionDefinition[] = []) {
    this.ordered = [...definitions];
    this.definitions = new Map(
      definitions.map((definition) => [definition.id, definition]),
    );

    for (const definition of this.definitions.values()) {
      if (definition.next !== undefined && !this.definitions.has(definition.next)) {
        throw new InvalidDecisionGraphError(
          `Decision "${definition.id}" has next "${definition.next}" which is not registered`,
        );
      }

      if (
        definition.previous !== undefined &&
        !this.definitions.has(definition.previous)
      ) {
        throw new InvalidDecisionGraphError(
          `Decision "${definition.id}" has previous "${definition.previous}" which is not registered`,
        );
      }
    }
  }

  get(id: string): DecisionDefinition | undefined {
    return this.definitions.get(id);
  }

  getNext(id: string): string | undefined {
    return this.definitions.get(id)?.next;
  }

  getPrevious(id: string): string | undefined {
    return this.definitions.get(id)?.previous;
  }

  list(): readonly DecisionDefinition[] {
    return this.ordered;
  }
}
