import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionSession } from "../DecisionSession";

/**
 * Session Interpretation — meaning derived from Object Package + Runtime State.
 * Never validates commands. Never projects UI.
 */
export type SessionInterpretation = {
  readonly objectId: string;
  readonly activeRoomId: string | null;
  readonly activeRoomName: string | null;
  readonly priorityIds: readonly string[];
  readonly variantId: string | null;
  readonly scenarioId: string | null;
  readonly runtimeVersion: number;
  /** Deterministic meaning summary for reproducibility checks. */
  readonly summary: string;
};

export function interpretDecisionSession(
  session: DecisionSession,
  housePackage: HousePackage,
): SessionInterpretation {
  const activeRoomId = session.runtimeState.activeRoomId;
  const activeRoomName =
    activeRoomId === null
      ? null
      : (housePackage.rooms.find((room) => room.id === activeRoomId)?.name ??
        null);

  const priorityIds = session.runtimeState.priorityIds;
  const variantId = session.runtimeState.variantId;
  const scenarioId = session.runtimeState.scenarioId;

  const summary = [
    `object:${session.objectId}`,
    `room:${activeRoomId ?? "none"}`,
    `priorities:${priorityIds.join(",") || "none"}`,
    `variant:${variantId ?? "none"}`,
    `scenario:${scenarioId ?? "none"}`,
    `v:${session.runtimeState.version}`,
  ].join("|");

  return Object.freeze({
    objectId: session.objectId,
    activeRoomId,
    activeRoomName,
    priorityIds: Object.freeze([...priorityIds]),
    variantId,
    scenarioId,
    runtimeVersion: session.runtimeState.version,
    summary,
  });
}
