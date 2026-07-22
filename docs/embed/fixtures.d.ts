/**
 * Fixture resolution for Embed.mount — legacy Priority Journey path only.
 *
 * Production Client Studio mounts resolve Object Packages via
 * `delivery/resolveObjectPackage` — not this module.
 */
import type { PriorityJourneyRun } from "@embed-engine/core/priority";
import type { PriorityEngineEvent } from "@embed-engine/runtime";
import type { EmbedLegacyExperienceMountOptions, EmbedLegacyMountOptions, EmbedMountOptions } from "./delivery/types";
/** @deprecated Use EmbedLegacyFixtureId — kept for declaration compatibility. */
export type EmbedFixtureId = "garden";
export type { EmbedMountOptions } from "./delivery/types";
export declare function resolveJourneyFixture(options: EmbedLegacyMountOptions | EmbedLegacyExperienceMountOptions): PriorityJourneyRun;
/**
 * Build Runtime event catalog from a Journey run snapshot.
 * Used to wire UI actions → engine.dispatch without business logic.
 */
export declare function createEngineEventsFromJourneyRun(run: PriorityJourneyRun): readonly PriorityEngineEvent[];
export declare function resolveEngineEvents(options: EmbedMountOptions, run: PriorityJourneyRun): readonly PriorityEngineEvent[];
//# sourceMappingURL=fixtures.d.ts.map