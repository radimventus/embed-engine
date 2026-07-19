import type { ExperienceModel } from "@embed-engine/model";

import type { ExecutionContext } from "./ExecutionContext";

/**
 * Domain-agnostic interpretation contract.
 * Concrete interpreters live outside packages/core.
 */
export interface Interpreter {
  interpret(context: ExecutionContext): ExperienceModel;
}
