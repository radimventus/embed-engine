import {
  MapCommandResolver,
  Runtime,
  type ExecutionContext,
  type SceneGraph,
} from "@embed-engine/core";

import { DecisionInterpreter } from "./DecisionInterpreter";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import {
  SET_ANSWER_COMMAND_TYPE,
  SetAnswerCommandHandler,
} from "./SetAnswerCommand";

/**
 * Composition root for a Decision-domain Runtime.
 * Keeps packages/core free of Decision types and wiring.
 */
export function createDecisionRuntime(sceneGraph: SceneGraph): Runtime {
  const decisionRegistry = new DefaultDecisionRegistry([
    {
      id: "kitchen-type",
      question: "Kitchen type",
      type: "single-choice",
    },
  ]);

  const decisionState: DecisionState = {
    answers: new Map(),
  };

  const executionContext: ExecutionContext = {
    currentSceneId: sceneGraph.start,
    state: decisionState,
  };

  const resolver = new MapCommandResolver();
  resolver.register(SET_ANSWER_COMMAND_TYPE, new SetAnswerCommandHandler());

  return new Runtime(sceneGraph, {
    executionContext,
    resolver,
    interpreter: new DecisionInterpreter(decisionRegistry),
  });
}
