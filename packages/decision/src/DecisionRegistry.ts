import type { DecisionDefinition } from "./DecisionDefinition";

/**
 * Lookup of known decision definitions by id.
 */
export interface DecisionRegistry {
  get(id: string): DecisionDefinition | undefined;
}
