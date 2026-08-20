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
    default: {
      const _exhaustive: never = command;
      throw new Error(`Unsupported command: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
