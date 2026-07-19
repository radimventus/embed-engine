import type { DecisionDefinition } from "./DecisionDefinition";

/**
 * Lookup of known decision definitions and static graph edges.
 */
export interface DecisionRegistry {
  get(id: string): DecisionDefinition | undefined;
  getNext(id: string): string | undefined;
  getPrevious(id: string): string | undefined;
  /** All definitions in registration order (source for graph presentation). */
  list(): readonly DecisionDefinition[];
}
