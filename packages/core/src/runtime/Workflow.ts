import type { ExperienceModel } from "@embed-engine/model";

import type { Command } from "./Command";
import type { CommandResolver } from "./CommandResolver";
import type { ExecutionContext } from "./ExecutionContext";
import type { Interpreter } from "./Interpreter";
import { UnknownCommandError } from "./UnknownCommandError";
import { validate } from "./validate";

export interface WorkflowDependencies {
  readonly interpreter: Interpreter;
  readonly resolver: CommandResolver;
}

/**
 * Sole orchestrator of the Runtime pipeline.
 * Does not construct its own dependencies.
 */
export class Workflow {
  private readonly executionContext: ExecutionContext;
  private readonly interpreter: Interpreter;
  private readonly resolver: CommandResolver;

  constructor(
    executionContext: ExecutionContext,
    dependencies: WorkflowDependencies,
  ) {
    this.executionContext = executionContext;
    this.interpreter = dependencies.interpreter;
    this.resolver = dependencies.resolver;
  }

  run(command: Command): ExperienceModel {
    validate(command);

    const handler = this.resolver.resolve(command);

    if (!handler) {
      throw new UnknownCommandError(command.type);
    }

    handler.execute(command, this.executionContext);

    // TODO: publish events

    return this.interpreter.interpret(this.executionContext);
  }
}
