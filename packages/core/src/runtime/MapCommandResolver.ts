import type { Command } from "./Command";
import type { CommandHandler } from "./CommandHandler";
import type { CommandResolver } from "./CommandResolver";

/**
 * Minimal in-memory CommandResolver.
 * Maps command.type → CommandHandler.
 */
export class MapCommandResolver implements CommandResolver {
  private readonly handlers = new Map<string, CommandHandler>();

  register(type: string, handler: CommandHandler): void {
    this.handlers.set(type, handler);
  }

  resolve(command: Command): CommandHandler | undefined {
    return this.handlers.get(command.type);
  }
}
