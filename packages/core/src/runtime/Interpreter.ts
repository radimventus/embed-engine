import type { ReactExperienceModel } from "@embed-engine/model";

import type { ExecutionContext } from "./ExecutionContext";

/**
 * Domain-agnostic interpretation contract.
 * Converts ExecutionContext into ReactExperienceModel.
 */
export interface Interpreter {
  interpret(context: ExecutionContext): ReactExperienceModel;
}
