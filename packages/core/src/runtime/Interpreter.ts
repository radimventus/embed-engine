import type { ExperienceModel } from "@embed-engine/model";

import type { ExecutionContext } from "./ExecutionContext";

/**
 * Domain-agnostic interpretation contract.
 * Converts ExecutionContext into ExperienceModel.
 */
export interface Interpreter {
  interpret(context: ExecutionContext): ExperienceModel;
}
