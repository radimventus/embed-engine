import type {
  Command,
  CommandHandler,
  ExecutionContext,
} from "@embed-engine/core";

import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { InvalidDecisionGraphError } from "./InvalidDecisionGraphError";
import { navigateToDecision } from "./navigateToDecision";
import { UnknownDecisionError } from "./UnknownDecisionError";

export const GO_NEXT_COMMAND_TYPE = "go-next";

export interface GoNextCommand extends Command {
  type: "go-next";
}

/**
 * Navigates to the static successor declared on the current decision.
 */
export class GoNextCommandHandler implements CommandHandler {
  private readonly registry: DecisionRegistry;

  constructor(registry: DecisionRegistry) {
    this.registry = registry;
  }

  execute(_command: Command, context: ExecutionContext): void {
    const state = context.state as DecisionState;
    const currentDecisionId = state.currentDecisionId;

    if (currentDecisionId === null) {
      throw new InvalidDecisionGraphError(
        "Cannot go next without a current decision",
      );
    }

    if (!this.registry.get(currentDecisionId)) {
      throw new UnknownDecisionError(currentDecisionId);
    }

    const nextDecisionId = this.registry.getNext(currentDecisionId);

    if (nextDecisionId === undefined) {
      throw new InvalidDecisionGraphError(
        `Decision "${currentDecisionId}" has no next edge`,
      );
    }

    if (!this.registry.get(nextDecisionId)) {
      throw new InvalidDecisionGraphError(
        `Decision "${currentDecisionId}" has next "${nextDecisionId}" which is not registered`,
      );
    }

    navigateToDecision(state, nextDecisionId);
  }
}
