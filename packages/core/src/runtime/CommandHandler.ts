import type { Command } from "./Command";
import type { ExecutionContext } from "./ExecutionContext";

/**
 * Domain-agnostic command handler contract.
 * Concrete handlers live outside packages/core (except demo Noop).
 */
export interface CommandHandler {
  execute(command: Command, context: ExecutionContext): void;
}
