import type { ExperienceModel } from "@embed-engine/model";

import type { ExecutionContext } from "./ExecutionContext";
import type { Interpreter } from "./Interpreter";

/**
 * Minimal domain-agnostic Interpreter.
 * Returns an empty ExperienceModel shaped projection.
 */
export class DefaultInterpreter implements Interpreter {
  interpret(context: ExecutionContext): ExperienceModel {
    return {
      currentSceneId: context.currentSceneId,
      answers: {},
      decisions: [],
      currentDecisionId: null,
      history: [],
      currentDecision: null,
      decisionFlow: [],
      house: null,
      decisionFilter: null,
      highlights: [],
      recommendedRooms: [],
      summaryReady: false,
    };
  }
}
