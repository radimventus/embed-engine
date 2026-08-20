import type { PriorityIntensity, RoomId, Timestamp } from "../DecisionEvent";

/**
 * Semantic Runtime Commands — express user intent only.
 * Commands MUST NEVER mutate Runtime State (CAP-HP-002.5).
 */
export type RuntimeCommand =
  | {
      readonly type: "SelectRoom";
      readonly roomId: RoomId;
    }
  | {
      readonly type: "ChangePriority";
      readonly priorityIds: readonly string[];
      readonly intensities?: readonly PriorityIntensity[];
    }
  | {
      readonly type: "SelectVariant";
      readonly variantId: string;
    }
  | {
      readonly type: "ActivateScenario";
      readonly scenarioId: string;
    }
  | {
      readonly type: "AnswerQuestion";
      readonly questionId: string;
      readonly answerId: string;
    };

export type RuntimeCommandType = RuntimeCommand["type"];

export type CommandContext = {
  readonly now: Timestamp;
};
