import {
  MapCommandResolver,
  Runtime,
  type ExecutionContext,
  type SceneGraph,
} from "@embed-engine/core";

import { CANONICAL_DECISION_FLOW } from "./canonical-decision-flow";
import { DecisionInterpreter } from "./DecisionInterpreter";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import {
  GO_BACK_COMMAND_TYPE,
  GoBackCommandHandler,
} from "./GoBackCommand";
import {
  GO_NEXT_COMMAND_TYPE,
  GoNextCommandHandler,
} from "./GoNextCommand";
import {
  GO_TO_DECISION_COMMAND_TYPE,
  GoToDecisionCommandHandler,
} from "./GoToDecisionCommand";
import {
  SET_ANSWER_COMMAND_TYPE,
  SetAnswerCommandHandler,
} from "./SetAnswerCommand";
import {
  START_DECISION_FLOW_COMMAND_TYPE,
  StartDecisionFlowCommandHandler,
} from "./StartDecisionFlowCommand";

/**
 * Composition root for a Decision-domain Runtime.
 * Populates DecisionRegistry from the canonical reference flow.
 */
export function createDecisionRuntime(sceneGraph: SceneGraph): Runtime {
  const decisionRegistry = new DefaultDecisionRegistry(CANONICAL_DECISION_FLOW);

  const decisionState: DecisionState = {
    answers: new Map(),
    currentDecisionId: null,
    history: [],
  };

  const executionContext: ExecutionContext = {
    currentSceneId: sceneGraph.start,
    state: decisionState,
  };

  const resolver = new MapCommandResolver();
  resolver.register(SET_ANSWER_COMMAND_TYPE, new SetAnswerCommandHandler());
  resolver.register(
    START_DECISION_FLOW_COMMAND_TYPE,
    new StartDecisionFlowCommandHandler(decisionRegistry),
  );
  resolver.register(
    GO_TO_DECISION_COMMAND_TYPE,
    new GoToDecisionCommandHandler(decisionRegistry),
  );
  resolver.register(
    GO_NEXT_COMMAND_TYPE,
    new GoNextCommandHandler(decisionRegistry),
  );
  resolver.register(GO_BACK_COMMAND_TYPE, new GoBackCommandHandler());

  return new Runtime(sceneGraph, {
    executionContext,
    resolver,
    interpreter: new DecisionInterpreter(decisionRegistry),
  });
}
