import type {
  DecisionEvent,
  DecisionSession,
  SessionExperience,
} from '@embed-engine/runtime';

/**
 * Operations projection for Manager Studio (MSCB-01).
 *
 * Pure presentation mapping from certified Runtime Experience + Session.
 * Does not interpret, score, or invent operational semantics.
 */
export type OperationsTimelineEntry = {
  readonly type: DecisionEvent['type'];
  readonly at: number;
};

export type OperationsOverview = {
  readonly objectId: string;
  readonly objectTitle: string;
  readonly sessionCreatedAt: number;
  readonly sessionUpdatedAt: number;
  readonly eventCount: number;
  readonly lastEventType: DecisionEvent['type'] | null;
  readonly priorityIds: readonly string[];
  readonly storyId: string | null;
  readonly outcomeStatus: string | null;
  readonly activeRoomId: string | null;
  readonly terminalId: string | null;
};

export type OperationsProjection = {
  readonly overview: OperationsOverview;
  readonly timeline: readonly OperationsTimelineEntry[];
};

export function projectOperationsOverview(input: {
  readonly experience: SessionExperience;
  readonly session: DecisionSession;
}): OperationsProjection {
  const { experience, session } = input;
  const decision = experience.context.decision;
  const lastEvent = session.events[session.events.length - 1] ?? null;

  return {
    overview: {
      objectId: experience.context.object.id,
      objectTitle: experience.context.object.title,
      sessionCreatedAt: session.createdAt,
      sessionUpdatedAt: session.updatedAt,
      eventCount: session.events.length,
      lastEventType: lastEvent?.type ?? null,
      priorityIds: experience.context.decision.priorityIds,
      storyId: decision.story?.id ?? null,
      outcomeStatus: decision.outcome?.status ?? null,
      activeRoomId: experience.context.activeRoom.id,
      terminalId: decision.terminal?.id ?? null,
    },
    timeline: session.events.map((event) => ({
      type: event.type,
      at: event.at,
    })),
  };
}
