import type { RoomId } from "./DecisionEvent";

/**
 * Session-owned Runtime State for Decision Session execution.
 * Presentation / UI state MUST NOT appear here.
 */
export type SessionRuntimeState = {
  /** Active room focus (ADR-013 — semantic RoomId only). */
  readonly activeRoomId: RoomId | null;
  /** Monotonic mutation counter for the session. */
  readonly version: number;
};

export function createInitialSessionRuntimeState(): SessionRuntimeState {
  return Object.freeze({
    activeRoomId: null,
    version: 0,
  });
}
