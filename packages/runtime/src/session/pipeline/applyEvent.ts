import { freezeDecisionSession, type DecisionSession } from "../DecisionSession";
import type { DecisionEvent } from "../DecisionEvent";

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
