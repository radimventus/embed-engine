/**
 * Fixture resolution for Embed.mount — legacy Priority Journey path only.
 *
 * Production Client Studio mounts resolve Object Packages via
 * `delivery/resolveObjectPackage` — not this module.
 */

import type { PriorityJourneyRun } from "@embed-engine/core/priority";
import type { PriorityEngineEvent } from "@embed-engine/runtime";
import {
  createGardenEngineEvents,
  createGardenJourneyRun,
} from "@embed-engine/runtime";

import type {
  EmbedLegacyExperienceMountOptions,
  EmbedLegacyMountOptions,
  EmbedMountOptions,
} from "./delivery/types";

/** @deprecated Use EmbedLegacyFixtureId — kept for declaration compatibility. */
export type EmbedFixtureId = "garden";

export type { EmbedMountOptions } from "./delivery/types";

export function resolveJourneyFixture(
  options: EmbedLegacyMountOptions | EmbedLegacyExperienceMountOptions,
): PriorityJourneyRun {
  if ("fixture" in options && options.fixture === "garden") {
    return createGardenJourneyRun();
  }

  if ("experience" in options && options.experience) {
    return options.experience;
  }

  throw new Error(
    'Embed legacy mount requires either { fixture: "garden" } or { experience: PriorityJourneyRun }',
  );
}

/**
 * Build Runtime event catalog from a Journey run snapshot.
 * Used to wire UI actions → engine.dispatch without business logic.
 */
export function createEngineEventsFromJourneyRun(
  run: PriorityJourneyRun,
): readonly PriorityEngineEvent[] {
  if (!run.confirmation?.presentationPayload) {
    throw new Error(
      "Embed.mount experience requires confirmation.presentationPayload",
    );
  }
  if (!run.interpretation || !run.experience) {
    throw new Error(
      "Embed.mount experience requires interpretation and experience artifacts",
    );
  }
  if (!run.houseMapping || !run.followUps || run.followUps.length === 0) {
    throw new Error(
      "Embed.mount experience requires houseMapping and at least one followUp",
    );
  }

  return [
    {
      type: "priority.selection.changed",
      selection: run.selection,
    },
    {
      type: "priority.confirmation.accepted",
      presentationPayload: run.confirmation.presentationPayload,
    },
    {
      type: "priority.transition.completed",
      transitionMessage: run.transitionMessage ?? undefined,
    },
    {
      type: "priority.interpretation.ready",
      interpretation: run.interpretation,
      experience: run.experience,
    },
    {
      type: "priority.mapping.ready",
      houseMapping: run.houseMapping,
      followUps: run.followUps,
    },
  ];
}

export function resolveEngineEvents(
  options: EmbedMountOptions,
  run: PriorityJourneyRun,
): readonly PriorityEngineEvent[] {
  if ("fixture" in options && options.fixture === "garden") {
    return createGardenEngineEvents().filter(
      (event) => event.type !== "priority.followup.selected",
    );
  }

  return createEngineEventsFromJourneyRun(run);
}
