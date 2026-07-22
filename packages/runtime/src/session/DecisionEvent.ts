/**
 * Semantic Decision Session events (PT-003 / ADR-013).
 * MUST NEVER record UI gestures (ButtonClicked, AccordionOpened, …).
 */

export type Timestamp = number;

export type ObjectId = string;

export type RoomId = string;

export type DecisionEvent =
  | {
      readonly type: "RoomSelected";
      readonly roomId: RoomId;
      readonly at: Timestamp;
    }
  | {
      readonly type: "PriorityChanged";
      readonly priorityIds: readonly string[];
      readonly at: Timestamp;
    }
  | {
      readonly type: "VariantSelected";
      readonly variantId: string;
      readonly at: Timestamp;
    }
  | {
      readonly type: "ScenarioActivated";
      readonly scenarioId: string;
      readonly at: Timestamp;
    }
  | {
      readonly type: "QuestionAnswered";
      readonly questionId: string;
      readonly answerId: string;
      readonly at: Timestamp;
    };

export type DecisionEventType = DecisionEvent["type"];
