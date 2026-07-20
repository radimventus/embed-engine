import type { DecisionState } from "../decision-state/DecisionState";
import type { Focus } from "../focus/Focus";
import type { Interpretation, InterpretationPriority } from "./Interpretation";

/**
 * Priority ids consumed by Client Studio Priority Engine (vertical slice).
 */
export const INTERPRETATION_PRIORITY_IDS = [
  "energy",
  "operating-costs",
  "layout",
  "privacy",
  "design",
  "quality",
  "plot",
  "investment",
  "maintenance",
  "flexibility",
] as const;

export type InterpretationPriorityId =
  (typeof INTERPRETATION_PRIORITY_IDS)[number];

const BASE_WEIGHT = 0.35;

/**
 * Pure Focus → priority weight mapping for the visible MVP demo.
 */
function weightFor(id: InterpretationPriorityId, focus: Focus): number {
  if (focus.questionId === id) {
    return 1;
  }

  if (id === "layout" && focus.roomId !== undefined) {
    return 0.92;
  }

  if (id === "design" && focus.mediaId !== undefined) {
    return 0.9;
  }

  if (id === "plot" && focus.floorId !== undefined) {
    return 0.88;
  }

  return BASE_WEIGHT;
}

/**
 * Pure projector: DecisionState → Interpretation.
 * Deterministic. Stateless. Never mutates DecisionState.
 */
export function project(state: DecisionState): Interpretation {
  const priorities: InterpretationPriority[] = INTERPRETATION_PRIORITY_IDS.map(
    (id) =>
      Object.freeze({
        id,
        weight: weightFor(id, state.focus),
      }),
  );

  return Object.freeze({
    priorities: Object.freeze(priorities),
  });
}
