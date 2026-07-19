import type { ExperienceModel } from "@embed-engine/model";

import type { Command } from "./Command";
import type { CommandResolver } from "./CommandResolver";
import type { ExecutionContext } from "./ExecutionContext";
import type { Interpreter } from "./Interpreter";
import { MapCommandResolver } from "./MapCommandResolver";
import { validate } from "./validate";

export interface WorkflowDependencies {
  readonly interpreter?: Interpreter;
  readonly resolver?: CommandResolver;
}

/**
 * Sole orchestrator of the Runtime pipeline.
 */
export class Workflow {
  private readonly executionContext: ExecutionContext;
  private readonly interpreter: Interpreter | undefined;
  private readonly resolver: CommandResolver;

  constructor(
    executionContext: ExecutionContext,
    dependencies: WorkflowDependencies = {},
  ) {
    this.executionContext = executionContext;
    this.interpreter = dependencies.interpreter;
    this.resolver = dependencies.resolver ?? new MapCommandResolver();
  }

  run(command: Command): ExperienceModel {
    validate(command);

    const handler = this.resolver.resolve(command);

    // TODO: execute handler
    // TODO: interpretation (Interpreter)
    // TODO: build experience
    // TODO: publish events

    void handler;
    void this.executionContext;
    void this.interpreter;

    const experience: ExperienceModel = {};
    return experience;
  }
}
