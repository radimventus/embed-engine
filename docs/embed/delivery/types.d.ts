/**
 * Embed Delivery Layer — production mount configuration (Client Studio path).
 */
import type { PriorityJourneyRun } from "@embed-engine/core/priority";
export type EmbedLegacyFixtureId = "garden";
/**
 * Production mount — Client Studio Experience.
 * `objectId` selects the Object Package (defaults to the pilot house).
 */
export type EmbedProductionMountOptions = {
    readonly target: string | HTMLElement;
    readonly objectId?: string;
    /**
     * Optional base URL for Object / house-package media (no trailing slash).
     * When omitted, media URLs resolve from the host page origin.
     */
    readonly assetBase?: string;
    readonly fixture?: never;
    readonly experience?: never;
};
/**
 * Legacy mount — Priority Journey HTML + Garden fixture (explicit opt-in only).
 */
export type EmbedLegacyMountOptions = {
    readonly target: string | HTMLElement;
    readonly fixture: EmbedLegacyFixtureId;
    readonly objectId?: never;
    readonly assetBase?: never;
    readonly experience?: never;
};
/**
 * Legacy mount — pre-built PriorityJourneyRun (tests / tooling).
 */
export type EmbedLegacyExperienceMountOptions = {
    readonly target: string | HTMLElement;
    readonly experience: PriorityJourneyRun;
    readonly fixture?: never;
    readonly objectId?: never;
    readonly assetBase?: never;
};
export type EmbedMountOptions = EmbedProductionMountOptions | EmbedLegacyMountOptions | EmbedLegacyExperienceMountOptions;
export declare function isLegacyGardenMount(options: EmbedMountOptions): options is EmbedLegacyMountOptions;
export declare function isLegacyExperienceMount(options: EmbedMountOptions): options is EmbedLegacyExperienceMountOptions;
export declare function isProductionMount(options: EmbedMountOptions): options is EmbedProductionMountOptions;
//# sourceMappingURL=types.d.ts.map