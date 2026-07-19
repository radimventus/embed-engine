import type { ReactExperienceModel } from "@embed-engine/model";

import type { Command } from "./Command";
import type { CommandResolver } from "./CommandResolver";
import { ExecutionContext } from "./ExecutionContext";
import type { Interpreter } from "./Interpreter";
import type { SceneGraph } from "./SceneGraph";
import { Workflow } from "./Workflow";

export interface RuntimeOptions {
  readonly executionContext: ExecutionContext;
  readonly resolver: CommandResolver;
  readonly interpreter: Interpreter;
}

export class Runtime {
  private readonly sceneGraph: SceneGraph;
  private readonly executionContext: ExecutionContext;
  private readonly workflow: Workflow;

  constructor(sceneGraph: SceneGraph, options: RuntimeOptions) {
    this.sceneGraph = sceneGraph;
    this.executionContext = options.executionContext;

    this.workflow = new Workflow(this.executionContext, {
      resolver: options.resolver,
      interpreter: options.interpreter,
    });
  }

  get context(): ExecutionContext {
    return this.executionContext;
  }

  /**
   * Sole future public entry API for the Runtime Kernel.
   */
  dispatch(command: Command): ReactExperienceModel {
    return this.workflow.run(command);
  }

  /** @deprecated Legacy scene API — retained until Workflow replaces it. */
  start(): void {
    this.executionContext.currentSceneId = this.sceneGraph.start;
  }

  /** @deprecated Legacy scene API — retained until Workflow replaces it. */
  next(): void {
    const current =
      this.sceneGraph.scenes[this.executionContext.currentSceneId];

    if (!current?.next) {
      return;
    }

    this.executionContext.currentSceneId = current.next;
  }

  /**
   * @deprecated Legacy scene API — use dispatch with a domain command instead.
   * Domain answers are owned by DecisionState outside Core.
   */
  answer(_key: string, _value: unknown): void {}
}
