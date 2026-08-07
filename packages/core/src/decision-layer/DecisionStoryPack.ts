import type {
  DecisionMoveDefinition,
  DecisionStoryComposeInput,
  DecisionOutcome,
} from "./DecisionStory";

export type DecisionStoryPack = {
  readonly id: string;
  readonly storyId: string;
  /** QUESTION_OPENED questionIds that start this Story (e.g. layout priority). */
  readonly startQuestionIds: readonly string[];
  readonly moves: readonly DecisionMoveDefinition[];
  readonly spine: readonly string[];
  readonly isMoveComplete: (
    moveId: string,
    input: DecisionStoryComposeInput,
  ) => boolean;
  readonly resolveOutcome: (input: DecisionStoryComposeInput) => DecisionOutcome;
};
