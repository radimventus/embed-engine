import type {
  Command,
  CommandHandler,
  ExecutionContext,
} from "@embed-engine/core";

import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { UnknownDecisionError } from "./UnknownDecisionError";

export const START_DECISION_FLOW_COMMAND_TYPE = "start-decision-flow";

export interface StartDecisionFlowCommand extends Command {
  type: "start-decision-flow";
  decisionId: string;
}

/**
 * Starts a decision flow at a known decision.
 * Resets navigation history; leaves answers unchanged.
 */
export class StartDecisionFlowCommandHandler implements CommandHandler {
  private readonly registry: DecisionRegistry;

  constructor(registry: DecisionRegistry) {
    this.registry = registry;
  }

  execute(command: Command, context: ExecutionContext): void {
    const { decisionId } = command as StartDecisionFlowCommand;

    if (!this.registry.get(decisionId)) {
      throw new UnknownDecisionError(decisionId);
    }

    const state = context.state as DecisionState;
    state.history = [];
    state.currentDecisionId = decisionId;
  }
}
