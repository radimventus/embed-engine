import type { ExperienceHouse, ExperienceHouseRoom } from "@embed-engine/model";

import type { DecisionFocus } from "./decision-focus";
import type { DecisionStoryContract } from "./decision-story";
import type {
  FocusRoom,
  RecommendedMediaRef,
} from "./interpretation";
import type { PrioritySignal } from "./priority-signals";

/**
 * Object metadata slice of Experience Context (CAP-HP-003.5 Experience Context).
 * Grouping only — no business logic.
 */
export type ExperienceObjectContext = {
  readonly id: string;
  readonly title: string;
  readonly reference: string;
  readonly city: string;
  readonly district: string;
  readonly usableArea: number;
  readonly energyClass: string;
  readonly construction: string;
};

/**
 * Active / focus room slice.
 */
export type ExperienceActiveRoomContext = {
  readonly id: string | null;
  readonly room: ExperienceHouseRoom | null;
  readonly focusRoom: FocusRoom | null;
};

/**
 * Navigation capabilities and room hierarchy.
 */
export type ExperienceNavigationContext = {
  readonly floors: readonly string[];
  readonly currentFloor: string | null;
  readonly rooms: readonly ExperienceHouseRoom[];
  readonly roomImportanceRank: readonly string[];
  readonly canSelectRoom: boolean;
  readonly canSelectFloor: boolean;
};

/**
 * Decision / interpretation semantic slice.
 */
export type ExperienceDecisionContext = {
  readonly priorityIds: readonly string[];
  readonly prioritySignals: readonly PrioritySignal[];
  readonly variantId: string | null;
  readonly scenarioId: string | null;
  readonly primaryReason: string;
  readonly highlights: readonly string[];
  readonly recommendedMedia: readonly RecommendedMediaRef[];
  readonly interpretationSummary: string;
  readonly rulesetId: string;
  readonly rulesetVersion: number;
  readonly appliedRuleIds: readonly string[];
  /** Canonical decision attention entry point (CAP-PRI-002). */
  readonly focus: DecisionFocus;
  /** Canonical Decision Story narrative (CAP-DST-001 / PT-004). */
  readonly story: DecisionStoryContract;
};

/**
 * Canonical semantic view model for Experience modules.
 * Aggregates Runtime projection fields — does not invent meaning.
 */
export type ExperienceContext = {
  readonly activeRoom: ExperienceActiveRoomContext;
  readonly object: ExperienceObjectContext;
  readonly navigation: ExperienceNavigationContext;
  readonly decision: ExperienceDecisionContext;
};

function floorKey(floor: number): string {
  return String(floor);
}

export type ProjectExperienceContextInput = {
  readonly house: ExperienceHouse;
  readonly activeRoomId: string | null;
  readonly activeRoom: ExperienceHouseRoom | null;
  readonly focusRoom: FocusRoom | null;
  readonly priorityIds: readonly string[];
  readonly prioritySignals: readonly PrioritySignal[];
  readonly variantId: string | null;
  readonly scenarioId: string | null;
  readonly primaryReason: string;
  readonly highlights: readonly string[];
  readonly recommendedMedia: readonly RecommendedMediaRef[];
  readonly interpretationSummary: string;
  readonly roomImportanceRank: readonly string[];
  readonly appliedRuleIds: readonly string[];
  readonly rulesetId: string;
  readonly rulesetVersion: number;
  readonly decisionFocus: DecisionFocus;
  readonly decisionStory: DecisionStoryContract;
};

/**
 * Project Experience Context from already-interpreted Experience fields.
 * Deterministic grouping + defaults only.
 */
export function projectExperienceContext(
  input: ProjectExperienceContextInput,
): ExperienceContext {
  const floors = Object.freeze([
    ...new Set(input.house.rooms.map((room) => floorKey(room.floor))),
  ]);

  let currentFloor: string | null = floors[0] ?? null;
  if (input.activeRoom !== null) {
    currentFloor = floorKey(input.activeRoom.floor);
  } else if (input.focusRoom !== null) {
    const focus = input.house.rooms.find(
      (room) => room.id === input.focusRoom!.id,
    );
    if (focus !== undefined) {
      currentFloor = floorKey(focus.floor);
    }
  }

  return Object.freeze({
    activeRoom: Object.freeze({
      id: input.activeRoomId,
      room: input.activeRoom,
      focusRoom: input.focusRoom,
    }),
    object: Object.freeze({
      id: input.house.id,
      title: input.house.title,
      reference: input.house.reference,
      city: input.house.city,
      district: input.house.district,
      usableArea: input.house.usableArea,
      energyClass: input.house.energyClass,
      construction: input.house.construction,
    }),
    navigation: Object.freeze({
      floors,
      currentFloor,
      rooms: input.house.rooms,
      roomImportanceRank: input.roomImportanceRank,
      canSelectRoom: input.house.rooms.length > 0,
      canSelectFloor: floors.length > 0,
    }),
    decision: Object.freeze({
      priorityIds: input.priorityIds,
      prioritySignals: input.prioritySignals,
      variantId: input.variantId,
      scenarioId: input.scenarioId,
      primaryReason: input.primaryReason,
      highlights: input.highlights,
      recommendedMedia: input.recommendedMedia,
      interpretationSummary: input.interpretationSummary,
      rulesetId: input.rulesetId,
      rulesetVersion: input.rulesetVersion,
      appliedRuleIds: input.appliedRuleIds,
      focus: input.decisionFocus,
      story: input.decisionStory,
    }),
  });
}
