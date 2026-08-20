import { freezeDecisionSession, type DecisionSession } from "../DecisionSession";
import type { DecisionEvent, PriorityIntensity } from "../DecisionEvent";

function intensitiesFromEvent(
  intensities: readonly PriorityIntensity[] | undefined,
): Readonly<Record<string, number>> | null {
  if (intensities === undefined) {
    return null;
  }
  return Object.freeze(
    Object.fromEntries(
      intensities.map((item) => [item.priorityId, item.importance]),
    ),
  );
}

/**
 * Apply a semantic Decision Event to Runtime State.
 * This is the ONLY allowed Runtime mutation path.
 */
export function applyDecisionEvent(
  session: DecisionSession,
  event: DecisionEvent,
): DecisionSession {
  const baseState = session.runtimeState;
  let runtimeState = {
    ...baseState,
    version: baseState.version + 1,
  };

  switch (event.type) {
    case "RoomSelected":
      runtimeState = {
        ...runtimeState,
        activeRoomId: event.roomId,
      };
      break;
    case "PriorityChanged":
      runtimeState = {
        ...runtimeState,
        priorityIds: Object.freeze([...event.priorityIds]),
        priorityIntensities: intensitiesFromEvent(event.intensities),
      };
      break;
    case "VariantSelected":
      runtimeState = {
        ...runtimeState,
        variantId: event.variantId,
      };
      break;
    case "ScenarioActivated":
      runtimeState = {
        ...runtimeState,
        scenarioId: event.scenarioId,
      };
      break;
    case "QuestionAnswered":
    case "QuestionOpened":
      // Facts recorded in event log; state version advances for determinism.
      break;
    default: {
      const _exhaustive: never = event;
      throw new Error(`Unsupported event: ${JSON.stringify(_exhaustive)}`);
    }
  }

  return freezeDecisionSession({
    objectId: session.objectId,
    runtimeState,
    events: [...session.events, event],
    createdAt: session.createdAt,
    updatedAt: event.at,
  });
}
