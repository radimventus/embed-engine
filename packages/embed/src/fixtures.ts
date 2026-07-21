/**
 * Fixture resolution for Embed.mount — no content generation.
 *
 * TODO(ADR): remote / CMS / Object Package loading of Experience fixtures.
 */

import type { PriorityJourneyRun } from "@embed-engine/core/priority";
import type { PriorityEngineEvent } from "@embed-engine/runtime";
import {
  createGardenEngineEvents,
  createGardenJourneyRun,
} from "@embed-engine/runtime";

export type EmbedFixtureId = "garden";

export type EmbedMountOptions = {
  readonly target: string | HTMLElement;
} & (
  | {
      readonly fixture: EmbedFixtureId;
      readonly experience?: never;
    }
  | {
      readonly experience: PriorityJourneyRun;
      readonly fixture?: never;
    }
);

export function resolveJourneyFixture(
  options: EmbedMountOptions,
): PriorityJourneyRun {
  if ("fixture" in options && options.fixture === "garden") {
    return createGardenJourneyRun();
  }

  if ("experience" in options && options.experience) {
    return options.experience;
  }

  throw new Error(
    'Embed.mount requires either { fixture: "garden" } or { experience: PriorityJourneyRun }',
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
    // Drop terminal followup.selected — selected dynamically from UI targetId.
    return createGardenEngineEvents().filter(
      (event) => event.type !== "priority.followup.selected",
    );
  }

  return createEngineEventsFromJourneyRun(run);
}
