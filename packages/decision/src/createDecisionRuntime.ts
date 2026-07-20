import {
  MapCommandResolver,
  CommandRuntime,
  type ExecutionContext,
  type SceneGraph,
} from "@embed-engine/core";
import {
  HOUSE_DECISION_FLOW,
  REFERENCE_HOUSE_PACKAGE,
} from "@embed-engine/object-house";

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
 * Composition root for the House Decision Experience.
 * Object Package is injected into projection — never exposed to renderers.
 */
export function createDecisionRuntime(sceneGraph: SceneGraph): CommandRuntime {
  const decisionRegistry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);

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

  return new CommandRuntime(sceneGraph, {
    executionContext,
    resolver,
    interpreter: new DecisionInterpreter(
      decisionRegistry,
      REFERENCE_HOUSE_PACKAGE,
    ),
  });
}
