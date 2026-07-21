import type { Interpretation } from "./Interpretation";
import {
  interpretationEngine,
  toInterpretInput,
  type InterpretObjectInput,
} from "./InterpretationEngine";

export type { InterpretObjectInput };

/**
 * Convenience entry for Interpretation production.
 * Adapts legacy { objectId, priorityIds } into Object + DecisionContext.
 */
export function interpretObject(input: InterpretObjectInput): Interpretation {
  return interpretationEngine.interpret(toInterpretInput(input));
}
