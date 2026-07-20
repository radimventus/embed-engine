import type { DecisionState } from "../decision-state/DecisionState";
import type { Focus } from "../focus/Focus";
import type { Signal } from "../signals/Signal";
import { SignalType } from "../signals/SignalType";
import type {
  Interpretation,
  InterpretationEvent,
  InterpretationPriority,
} from "./Interpretation";

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

const PRIORITY_TITLES: Record<InterpretationPriorityId, string> = {
  energy: "Energy",
  "operating-costs": "Operating costs",
  layout: "Layout",
  privacy: "Privacy",
  design: "Design",
  quality: "Quality",
  plot: "Plot",
  investment: "Investment",
  maintenance: "Maintenance",
  flexibility: "Flexibility",
};

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

function reasonFor(
  id: InterpretationPriorityId,
  focus: Focus,
  weight: number,
): string | undefined {
  if (weight <= BASE_WEIGHT) {
    return undefined;
  }

  if (focus.questionId === id) {
    return `You selected ${PRIORITY_TITLES[id]} as a decision focus.`;
  }

  if (id === "layout" && focus.roomId !== undefined) {
    return "Because you explored a room / floor plan.";
  }

  if (id === "design" && focus.mediaId !== undefined) {
    return "Because you opened gallery or media.";
  }

  if (id === "plot" && focus.floorId !== undefined) {
    return "Because you switched floors / spatial levels.";
  }

  return undefined;
}

function isHighlighted(id: InterpretationPriorityId, focus: Focus): boolean {
  if (focus.questionId === id) {
    return true;
  }

  if (id === "layout" && focus.roomId !== undefined) {
    return true;
  }

  if (id === "design" && focus.mediaId !== undefined) {
    return true;
  }

  if (id === "plot" && focus.floorId !== undefined) {
    return true;
  }

  return false;
}

function eventLabel(signal: Signal): string {
  const labeled = signal.payload.label;
  if (typeof labeled === "string" && labeled.length > 0) {
    return labeled;
  }

  switch (signal.type) {
    case SignalType.ROOM_VIEWED:
      return typeof signal.payload.roomId === "string"
        ? `Room: ${signal.payload.roomId}`
        : "Room viewed";
    case SignalType.MEDIA_OPENED:
      return typeof signal.payload.mediaId === "string"
        ? `Media: ${signal.payload.mediaId}`
        : "Media opened";
    case SignalType.FLOOR_CHANGED:
      return typeof signal.payload.floorId === "string"
        ? `Floor: ${signal.payload.floorId}`
        : "Floor changed";
    case SignalType.QUESTION_OPENED:
      return typeof signal.payload.questionId === "string"
        ? `Priority: ${signal.payload.questionId}`
        : "Question opened";
    default:
      return signal.type;
  }
}

function projectEvents(signals: readonly Signal[]): readonly InterpretationEvent[] {
  const events = signals.map((signal) =>
    Object.freeze({
      id: signal.id,
      label: eventLabel(signal),
      signalType: signal.type,
      timestamp: signal.timestamp,
    }),
  );

  return Object.freeze(events.slice(-8).reverse());
}

/**
 * Pure projector: DecisionState → Interpretation.
 * Deterministic. Stateless. Never mutates DecisionState.
 */
export function project(state: DecisionState): Interpretation {
  const priorities: InterpretationPriority[] = INTERPRETATION_PRIORITY_IDS.map(
    (id) => {
      const weight = weightFor(id, state.focus);

      return Object.freeze({
        id,
        weight,
        reason: reasonFor(id, state.focus, weight),
        highlighted: isHighlighted(id, state.focus),
      });
    },
  );

  return Object.freeze({
    priorities: Object.freeze(priorities),
    events: projectEvents(state.signals),
  });
}
