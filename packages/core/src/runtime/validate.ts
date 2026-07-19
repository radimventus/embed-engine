import type { Command } from "./Command";

export class InvalidCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCommandError";
  }
}

/**
 * Minimal command gate for the Workflow pipeline.
 */
export function validate(command: Command): Command {
  if (typeof command?.type !== "string" || command.type.length === 0) {
    throw new InvalidCommandError("Command.type is required");
  }

  return command;
}
