import type { Interpretation } from "./Interpretation";
import {
  interpretationEngine,
  type InterpretObjectInput,
} from "./InterpretationEngine";

export type { InterpretObjectInput };

/**
 * Convenience entry for Interpretation production.
 * Delegates to InterpretationEngine (canonical producer).
 */
export function interpretObject(input: InterpretObjectInput): Interpretation {
  return interpretationEngine.interpret(input);
}
