/**
 * Semantic Decision Session events (PT-003 / ADR-013).
 * MUST NEVER record UI gestures (ButtonClicked, AccordionOpened, …).
 * QuestionOpened is a decision-interest fact (which question the Client opened),
 * not a UI accordion gesture.
 */

export type Timestamp = number;

export type ObjectId = string;

export type RoomId = string;

/** Captured Client-scale importance for one selected priority. Optional on older events. */
export type PriorityIntensity = {
  readonly priorityId: string;
  readonly importance: number;
};

export type DecisionEvent =
  | {
      readonly type: "RoomSelected";
      readonly roomId: RoomId;
      readonly at: Timestamp;
    }
  | {
      readonly type: "PriorityChanged";
      readonly priorityIds: readonly string[];
      readonly intensities?: readonly PriorityIntensity[];
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
    }
  | {
      readonly type: "QuestionOpened";
      readonly questionId: string;
      readonly prompt?: string;
      readonly at: Timestamp;
    };

export type DecisionEventType = DecisionEvent["type"];
