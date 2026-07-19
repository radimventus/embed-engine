import type {
  Command,
  CommandHandler,
  ExecutionContext,
} from "@embed-engine/core";

import type { DecisionState } from "./DecisionState";

export const SET_ANSWER_COMMAND_TYPE = "set-answer";

export interface SetAnswerCommand extends Command {
  type: "set-answer";
  decisionId: string;
  value: unknown;
}

/**
 * Stores a user answer in DecisionState.
 * No validation, scoring, or recommendations.
 */
export class SetAnswerCommandHandler implements CommandHandler {
  execute(command: Command, context: ExecutionContext): void {
    const { decisionId, value } = command as SetAnswerCommand;
    const state = context.state as DecisionState;
    state.answers.set(decisionId, value);
  }
}
