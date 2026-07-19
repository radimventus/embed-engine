import type {
  Command,
  CommandHandler,
  ExecutionContext,
} from "@embed-engine/core";

import type { DecisionState } from "./DecisionState";

export const GO_BACK_COMMAND_TYPE = "go-back";

export interface GoBackCommand extends Command {
  type: "go-back";
}

/**
 * Navigates to the previous decision in history.
 * No-op when history is empty.
 */
export class GoBackCommandHandler implements CommandHandler {
  execute(_command: Command, context: ExecutionContext): void {
    const state = context.state as DecisionState;

    if (state.history.length === 0) {
      return;
    }

    const previousDecisionId = state.history.pop();
    state.currentDecisionId = previousDecisionId ?? null;
  }
}
