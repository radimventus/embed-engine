import type { HousePackage } from "@embed-engine/object-house";

import type {
  FocusRoom,
  InterpretedSemantics,
  RecommendedMediaRef,
  RecommendedMediaRole,
} from "../interpretation";
import type { PrioritySignal } from "../priority-signals";
import type { DecisionFocus } from "./DecisionFocus";

export type EvaluateDecisionFocusInput = {
  readonly housePackage: HousePackage;
  readonly activeRoomId: string | null;
  readonly prioritySignals: readonly PrioritySignal[];
  readonly semantics: InterpretedSemantics;
};

const ACTION_BY_SIGNAL_KIND: Readonly<Record<string, string>> = {
  "emphasize-value": "inspect-value-drivers",
  "emphasize-outdoor": "inspect-outdoor-connection",
  "emphasize-space": "inspect-spatial-volume",
  "emphasize-privacy": "inspect-privacy-zones",
  "priority-generic": "compare-priority-tradeoffs",
};

const MEDIA_BY_SIGNAL_KIND: Readonly<Record<string, RecommendedMediaRole>> = {
  "emphasize-value": "hero",
  "emphasize-outdoor": "gallery",
  "emphasize-space": "video",
  "emphasize-privacy": "hero",
  "priority-generic": "gallery",
};

function roundConfidence(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

function resolveFocusRoom(
  input: EvaluateDecisionFocusInput,
): FocusRoom | null {
  const { activeRoomId, housePackage, semantics } = input;

  if (activeRoomId !== null) {
    const active = housePackage.rooms.find((room) => room.id === activeRoomId);
    if (active !== undefined) {
      return { id: active.id, name: active.name };
    }
  }

  if (semantics.focusRoom !== null) {
    return semantics.focusRoom;
  }

  const topId = semantics.roomImportanceRank[0];
  if (topId === undefined) {
    return null;
  }
  const top = housePackage.rooms.find((room) => room.id === topId);
  return top === undefined ? null : { id: top.id, name: top.name };
}

function resolveRecommendedMediaRole(
  strongest: PrioritySignal | undefined,
  semantics: InterpretedSemantics,
): RecommendedMediaRole {
  if (strongest !== undefined) {
    const fromSignal = MEDIA_BY_SIGNAL_KIND[strongest.kind];
    if (fromSignal !== undefined) {
      return fromSignal;
    }
  }
  return semantics.recommendedMedia[0]?.role ?? "hero";
}

/**
 * Decision Focus Engine (CAP-PRI-002).
 * Priority Signals + Interpretation + Object → deterministic DecisionFocus.
 */
export function evaluateDecisionFocus(
  input: EvaluateDecisionFocusInput,
): DecisionFocus {
  const strongest = input.prioritySignals[0];
  const focusRoom = resolveFocusRoom(input);
  const focusReason = input.semantics.primaryReason;
  const recommendedAction =
    strongest !== undefined
      ? (ACTION_BY_SIGNAL_KIND[strongest.kind] ?? "explore-primary-room")
      : "explore-house-structure";
  const recommendedMediaRole = resolveRecommendedMediaRole(
    strongest,
    input.semantics,
  );

  let confidence = 0.35;
  if (strongest !== undefined) {
    confidence += 0.4 * strongest.strength;
  }
  if (focusRoom !== null) {
    confidence += 0.1;
  }
  if (
    focusRoom !== null &&
    input.semantics.roomImportanceRank[0] === focusRoom.id
  ) {
    confidence += 0.1;
  }
  if (
    input.activeRoomId !== null &&
    focusRoom !== null &&
    input.activeRoomId === focusRoom.id
  ) {
    confidence += 0.05;
  }

  return Object.freeze({
    focusRoomId: focusRoom?.id ?? null,
    focusRoomName: focusRoom?.name ?? null,
    focusReason,
    focusPriorityId: strongest?.priorityId ?? null,
    focusSignalKind: strongest?.kind ?? null,
    confidence: roundConfidence(confidence),
    recommendedAction,
    recommendedMediaRole,
  });
}

/**
 * Reorder recommended media so Decision Focus role leads.
 */
export function orderMediaByDecisionFocus(
  media: readonly RecommendedMediaRef[],
  focus: DecisionFocus,
): readonly RecommendedMediaRef[] {
  const preferred = focus.recommendedMediaRole;
  const leading = media.filter((item) => item.role === preferred);
  const rest = media.filter((item) => item.role !== preferred);
  const merged = [...leading, ...rest].map((item, index) =>
    Object.freeze({
      ...item,
      rank: index + 1,
      reason:
        item.role === preferred
          ? `decision-focus:${focus.recommendedAction}`
          : item.reason,
    }),
  );
  return Object.freeze(merged);
}

/**
 * Reorder highlights so focus-aligned keys surface first (deterministic).
 */
export function orderHighlightsByDecisionFocus(
  highlights: readonly string[],
  focus: DecisionFocus,
): readonly string[] {
  if (highlights.length === 0) {
    return highlights;
  }

  const preferredKeys: string[] = [];
  if (focus.focusSignalKind === "emphasize-value") {
    preferredKeys.push("value-efficiency");
  }
  if (focus.focusSignalKind === "emphasize-outdoor") {
    preferredKeys.push("outdoor-connection");
  }
  if (focus.focusSignalKind === "emphasize-space") {
    preferredKeys.push("spatial-generosity");
  }
  if (focus.focusSignalKind === "emphasize-privacy") {
    preferredKeys.push("privacy");
  }

  const preferred = preferredKeys.filter((key) => highlights.includes(key));
  const rest = highlights.filter((key) => !preferred.includes(key));
  return Object.freeze([...preferred, ...rest]);
}
