import type { Command } from "./Command";
import type { CommandHandler } from "./CommandHandler";

/**
 * Resolves which component is responsible for a command.
 * Domain-agnostic — knows nothing about Priority, Finance, Lead, or Decision.
 */
export interface CommandResolver {
  resolve(command: Command): CommandHandler | undefined;
}
