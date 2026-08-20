import type { RoomId } from "./DecisionEvent";

/**
 * Session-owned Runtime State for Decision Session execution.
 * Presentation / UI state MUST NOT appear here.
 * Mutations MUST originate only from Decision Events (CAP-HP-002.5).
 */
export type SessionRuntimeState = {
  /** Active room focus (ADR-013 — semantic RoomId only). */
  readonly activeRoomId: RoomId | null;
  /** Selected priority ids (semantic, not UI). */
  readonly priorityIds: readonly string[];
  /**
   * Captured Client-scale importance keyed by priorityId.
   * Null when the latest PriorityChanged carried ids only (legacy sessions).
   */
  readonly priorityIntensities: Readonly<Record<string, number>> | null;
  /** Selected variant id, if any. */
  readonly variantId: string | null;
  /** Active scenario id, if any. */
  readonly scenarioId: string | null;
  /** Monotonic mutation counter for the session. */
  readonly version: number;
};

export function createInitialSessionRuntimeState(): SessionRuntimeState {
  return Object.freeze({
    activeRoomId: null,
    priorityIds: Object.freeze([]) as readonly string[],
    priorityIntensities: null,
    variantId: null,
    scenarioId: null,
    version: 0,
  });
}
