import type {
  Command,
  CommandHandler,
  ExecutionContext,
} from "@embed-engine/core";

import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { navigateToDecision } from "./navigateToDecision";
import { UnknownDecisionError } from "./UnknownDecisionError";

export const GO_TO_DECISION_COMMAND_TYPE = "go-to-decision";

export interface GoToDecisionCommand extends Command {
  type: "go-to-decision";
  decisionId: string;
}

/**
 * Navigates to a known decision and records the previous one in history.
 */
export class GoToDecisionCommandHandler implements CommandHandler {
  private readonly registry: DecisionRegistry;

  constructor(registry: DecisionRegistry) {
    this.registry = registry;
  }

  execute(command: Command, context: ExecutionContext): void {
    const { decisionId } = command as GoToDecisionCommand;

    if (!this.registry.get(decisionId)) {
      throw new UnknownDecisionError(decisionId);
    }

    navigateToDecision(context.state as DecisionState, decisionId);
  }
}
