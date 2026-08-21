import type {
  JourneyStageId,
  MediaId,
  PriorityIntensity,
  RoomId,
  Timestamp,
  VideoPlaybackMilestone,
} from "../DecisionEvent";

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
    }
  | {
      readonly type: "OpenQuestion";
      readonly questionId: string;
      readonly prompt?: string;
    }
  | {
      readonly type: "StartVideoPlayback";
      readonly mediaId: MediaId;
    }
  | {
      readonly type: "MarkVideoPlaybackMilestone";
      readonly mediaId: MediaId;
      readonly milestone: VideoPlaybackMilestone;
    }
  | {
      readonly type: "ViewImage";
      readonly mediaId: MediaId;
    }
  | {
      readonly type: "EnterJourneyStage";
      readonly stageId: JourneyStageId;
    }
  | {
      readonly type: "SubmitChatQuestion";
      readonly questionId: string;
    };

export type RuntimeCommandType = RuntimeCommand["type"];

export type CommandContext = {
  readonly now: Timestamp;
};
