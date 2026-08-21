import type { DecisionEvent, Timestamp } from "../DecisionEvent";
import type { RuntimeCommand } from "./RuntimeCommand";

/**
 * A valid command produces exactly one semantic Decision Event.
 * Events express facts — not intent.
 */
export function commandToEvent(
  command: RuntimeCommand,
  at: Timestamp,
): DecisionEvent {
  switch (command.type) {
    case "SelectRoom":
      return { type: "RoomSelected", roomId: command.roomId, at };
    case "ChangePriority":
      return command.intensities === undefined
        ? {
            type: "PriorityChanged",
            priorityIds: [...command.priorityIds],
            at,
          }
        : {
            type: "PriorityChanged",
            priorityIds: [...command.priorityIds],
            intensities: command.intensities.map((item) => ({
              priorityId: item.priorityId,
              importance: item.importance,
            })),
            at,
          };
    case "SelectVariant":
      return { type: "VariantSelected", variantId: command.variantId, at };
    case "ActivateScenario":
      return { type: "ScenarioActivated", scenarioId: command.scenarioId, at };
    case "AnswerQuestion":
      return {
        type: "QuestionAnswered",
        questionId: command.questionId,
        answerId: command.answerId,
        at,
      };
    case "OpenQuestion":
      return command.prompt === undefined
        ? { type: "QuestionOpened", questionId: command.questionId, at }
        : {
            type: "QuestionOpened",
            questionId: command.questionId,
            prompt: command.prompt,
            at,
          };
    case "StartVideoPlayback":
      return {
        type: "VideoPlaybackStarted",
        mediaId: command.mediaId,
        at,
      };
    case "MarkVideoPlaybackMilestone":
      return {
        type: "VideoPlaybackMilestone",
        mediaId: command.mediaId,
        milestone: command.milestone,
        at,
      };
    case "ViewImage":
      return { type: "ImageViewed", mediaId: command.mediaId, at };
    case "EnterJourneyStage":
      return { type: "JourneyStageEntered", stageId: command.stageId, at };
    case "SubmitChatQuestion":
      return {
        type: "ChatQuestionSubmitted",
        questionId: command.questionId,
        at,
      };
    default: {
      const _exhaustive: never = command;
      throw new Error(`Unsupported command: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
