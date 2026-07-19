import type { Command } from "./Command";
import type { ExecutionContext } from "./ExecutionContext";

/**
 * Domain-agnostic command handler contract.
 * Concrete handlers live outside this step.
 */
export interface CommandHandler {
  handle(command: Command, context: ExecutionContext): void;
}
