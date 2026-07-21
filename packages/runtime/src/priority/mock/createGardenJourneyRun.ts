/**
 * Mock Experience Composer adapter — Garden reference Journey.
 *
 * Builds deterministic PriorityJourneyRun / engine events from SSOT fixtures.
 * Does not implement a real Experience Composer, AI, or Kernel integration.
 */

import type {
  Confirmation,
  PriorityJourneyRun,
} from "@embed-engine/core/priority";
import type { PriorityEngineEvent } from "../PriorityEngineEvent";
import {
  GARDEN_OBJECT_ID,
  gardenContentPackage,
} from "./gardenContentPackage";
import { gardenExperience } from "./gardenExperience";
import {
  GARDEN_PRIMARY_FOLLOWUP_TARGET_ID,
  gardenFollowUps,
  gardenHouseMapping,
  gardenTransitionMessage,
} from "./gardenHouseMapping";
import { gardenInterpretation } from "./gardenInterpretation";
import { gardenPrioritySelection } from "./gardenSelection";

function gardenConfirmation(): Confirmation {
  return {
    selectionSnapshot: gardenPrioritySelection,
    accepted: true,
    presentationPayload: gardenContentPackage.stageMicrocopy.confirmation,
  };
}

/**
 * Complete Garden PriorityJourneyRun at FollowUp (reference snapshot for Renderer).
 */
export function createGardenJourneyRun(): PriorityJourneyRun {
  return {
    object: { objectId: GARDEN_OBJECT_ID },
    stage: "FollowUp",
    selection: gardenPrioritySelection,
    confirmation: gardenConfirmation(),
    transitionMessage: gardenTransitionMessage,
    interpretation: gardenInterpretation,
    experience: gardenExperience,
    houseMapping: gardenHouseMapping,
    followUps: gardenFollowUps,
  };
}

/**
 * Deterministic event sequence that replays Garden Journey through the Runtime Engine
 * to Completed, using the same static fixtures as {@link createGardenJourneyRun}.
 */
export function createGardenEngineEvents(): readonly PriorityEngineEvent[] {
  return [
    {
      type: "priority.selection.changed",
      selection: gardenPrioritySelection,
    },
    {
      type: "priority.confirmation.accepted",
      presentationPayload: gardenContentPackage.stageMicrocopy.confirmation,
    },
    {
      type: "priority.transition.completed",
      transitionMessage: gardenTransitionMessage,
    },
    {
      type: "priority.interpretation.ready",
      interpretation: gardenInterpretation,
      experience: gardenExperience,
    },
    {
      type: "priority.mapping.ready",
      houseMapping: gardenHouseMapping,
      followUps: gardenFollowUps,
    },
    {
      type: "priority.followup.selected",
      targetId: GARDEN_PRIMARY_FOLLOWUP_TARGET_ID,
    },
  ];
}
