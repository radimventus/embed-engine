import type { DecisionEvent } from "./DecisionEvent";
import type { DecisionSession } from "./DecisionSession";
import { freezeDecisionSession } from "./DecisionSession";
import type { SessionRuntimeState } from "./SessionRuntimeState";

/** Stable serialization format version for DecisionSession. */
export const DECISION_SESSION_FORMAT = "decision-session" as const;
export const DECISION_SESSION_SCHEMA_VERSION = "1.0" as const;

export type SerializedDecisionSession = {
  readonly format: typeof DECISION_SESSION_FORMAT;
  readonly schemaVersion: typeof DECISION_SESSION_SCHEMA_VERSION;
  readonly objectId: string;
  readonly runtimeState: SessionRuntimeState;
  readonly events: readonly DecisionEvent[];
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type SerializeSessionResult =
  | { readonly ok: true; readonly data: SerializedDecisionSession }
  | { readonly ok: false; readonly message: string };

export type RestoreSessionResult =
  | { readonly ok: true; readonly session: DecisionSession }
  | { readonly ok: false; readonly message: string };

/**
 * Persistable session snapshot (in-memory / file / future API).
 * Does not include HousePackage — bind Object Package separately on restore+project.
 */
export function serializeDecisionSession(
  session: DecisionSession,
): SerializeSessionResult {
  return {
    ok: true,
    data: Object.freeze({
      format: DECISION_SESSION_FORMAT,
      schemaVersion: DECISION_SESSION_SCHEMA_VERSION,
      objectId: session.objectId,
      runtimeState: Object.freeze({ ...session.runtimeState }),
      events: Object.freeze(
        session.events.map((event) => Object.freeze({ ...event })),
      ),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }),
  };
}

export function serializeDecisionSessionToJson(
  session: DecisionSession,
): string {
  const result = serializeDecisionSession(session);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return JSON.stringify(result.data);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDecisionEvent(value: unknown): value is DecisionEvent {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }
  if (typeof value.at !== "number" || !Number.isFinite(value.at)) {
    return false;
  }
  switch (value.type) {
    case "RoomSelected":
      return typeof value.roomId === "string";
    case "PriorityChanged":
      return (
        Array.isArray(value.priorityIds) &&
        value.priorityIds.every((id) => typeof id === "string")
      );
    case "VariantSelected":
      return typeof value.variantId === "string";
    case "ScenarioActivated":
      return typeof value.scenarioId === "string";
    case "QuestionAnswered":
      return (
        typeof value.questionId === "string" &&
        typeof value.answerId === "string"
      );
    default:
      return false;
  }
}

/**
 * Restore a Decision Session from serialized data (no HousePackage required).
 */
export function restoreDecisionSession(
  raw: unknown,
): RestoreSessionResult {
  if (!isRecord(raw)) {
    return { ok: false, message: "Serialized session must be an object." };
  }
  if (raw.format !== DECISION_SESSION_FORMAT) {
    return {
      ok: false,
      message: `Unexpected format "${String(raw.format)}".`,
    };
  }
  if (raw.schemaVersion !== DECISION_SESSION_SCHEMA_VERSION) {
    return {
      ok: false,
      message: `Unsupported schemaVersion "${String(raw.schemaVersion)}".`,
    };
  }
  if (typeof raw.objectId !== "string" || raw.objectId.length === 0) {
    return { ok: false, message: "objectId is required." };
  }
  if (!isRecord(raw.runtimeState)) {
    return { ok: false, message: "runtimeState is required." };
  }
  const activeRoomId = raw.runtimeState.activeRoomId;
  const priorityIds = raw.runtimeState.priorityIds;
  const variantId = raw.runtimeState.variantId;
  const scenarioId = raw.runtimeState.scenarioId;
  if (
    !(activeRoomId === null || typeof activeRoomId === "string") ||
    typeof raw.runtimeState.version !== "number" ||
    !Array.isArray(priorityIds) ||
    !priorityIds.every((id) => typeof id === "string") ||
    !(variantId === null || typeof variantId === "string") ||
    !(scenarioId === null || typeof scenarioId === "string")
  ) {
    return { ok: false, message: "runtimeState shape is invalid." };
  }
  if (!Array.isArray(raw.events) || !raw.events.every(isDecisionEvent)) {
    return { ok: false, message: "events must be a DecisionEvent array." };
  }
  if (typeof raw.createdAt !== "number" || typeof raw.updatedAt !== "number") {
    return { ok: false, message: "createdAt/updatedAt must be numbers." };
  }

  return {
    ok: true,
    session: freezeDecisionSession({
      objectId: raw.objectId,
      runtimeState: {
        activeRoomId,
        priorityIds: Object.freeze([...priorityIds]),
        variantId,
        scenarioId,
        version: raw.runtimeState.version,
      },
      events: raw.events,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }),
  };
}

export function restoreDecisionSessionFromJson(
  text: string,
): RestoreSessionResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (cause) {
    return {
      ok: false,
      message: `Invalid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
    };
  }
  return restoreDecisionSession(parsed);
}

/** Structural clone — independent event array, same semantic content. */
export function cloneDecisionSession(session: DecisionSession): DecisionSession {
  return freezeDecisionSession({
    objectId: session.objectId,
    runtimeState: {
      ...session.runtimeState,
      priorityIds: [...session.runtimeState.priorityIds],
    },
    events: session.events.map((event) => ({ ...event })),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  });
}
