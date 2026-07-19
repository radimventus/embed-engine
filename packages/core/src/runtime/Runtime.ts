import type { ExperienceModel } from "@embed-engine/model";

import type { Command } from "./Command";
import { ExecutionContext } from "./ExecutionContext";
import type { SceneGraph } from "./SceneGraph";
import { Workflow } from "./Workflow";

export class Runtime {
  private readonly sceneGraph: SceneGraph;
  private readonly executionContext: ExecutionContext;
  private readonly workflow: Workflow;

  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;

    this.executionContext = {
      currentSceneId: sceneGraph.start,
      answers: {},
    };

    this.workflow = new Workflow(this.executionContext);
  }

  get context(): ExecutionContext {
    return this.executionContext;
  }

  /**
   * Sole future public entry API for the Runtime Kernel.
   */
  dispatch(command: Command): ExperienceModel {
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

  /** @deprecated Legacy scene API — retained until Workflow replaces it. */
  answer(key: string, value: unknown): void {
    this.executionContext.answers[key] = value;
  }
}
