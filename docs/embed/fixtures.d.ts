/**
 * Fixture resolution for Embed.mount — no content generation.
 *
 * TODO(ADR): remote / CMS / Object Package loading of Experience fixtures.
 */
import type { PriorityJourneyRun } from "@embed-engine/core/priority";
import type { PriorityEngineEvent } from "@embed-engine/runtime";
export type EmbedFixtureId = "garden";
export type EmbedMountOptions = {
    readonly target: string | HTMLElement;
} & ({
    readonly fixture: EmbedFixtureId;
    readonly experience?: never;
} | {
    readonly experience: PriorityJourneyRun;
    readonly fixture?: never;
});
export declare function resolveJourneyFixture(options: EmbedMountOptions): PriorityJourneyRun;
/**
 * Build Runtime event catalog from a Journey run snapshot.
 * Used to wire UI actions → engine.dispatch without business logic.
 */
export declare function createEngineEventsFromJourneyRun(run: PriorityJourneyRun): readonly PriorityEngineEvent[];
export declare function resolveEngineEvents(options: EmbedMountOptions, run: PriorityJourneyRun): readonly PriorityEngineEvent[];
//# sourceMappingURL=fixtures.d.ts.map