/**
 * Embed Delivery Layer — production mount configuration (Client Studio path).
 */
import type { PriorityJourneyRun } from "@embed-engine/core/priority";
import type { LaunchContext } from "./presentation";
export type EmbedLegacyFixtureId = "garden";
export type ExperienceMode = "standalone" | "launcher" | "inline";
/**
 * Production mount — Client Studio Experience.
 * `objectId` selects the Object Package (defaults to the pilot house).
 *
 * Modes (EMB-01):
 * - `inline` (default): mount into `target` immediately
 * - `launcher`: open overlay on CTA click; optional `target` mounts Embed Hero
 *   (PT-EMBED-01). `launcher` arms an existing host CTA when provided.
 * - `standalone`: same delivery path as inline for dedicated hosts
 */
export type EmbedProductionMountOptions = {
    readonly target?: string | HTMLElement;
    readonly mode?: ExperienceMode;
    /** Launcher CTA element (Launcher Mode). Optional when `target` mounts Embed Hero. */
    readonly launcher?: string | HTMLElement;
    readonly objectId?: string;
    /**
     * Optional base URL for Object / house-package media (no trailing slash).
     * When omitted, media URLs resolve from the host page origin.
     */
    readonly assetBase?: string;
    readonly hostId?: string;
    readonly entryPoint?: string;
    readonly launcherId?: string;
    readonly referrer?: string;
    readonly campaign?: Readonly<Record<string, string>>;
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
    readonly mode?: never;
    readonly launcher?: never;
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
    readonly mode?: never;
    readonly launcher?: never;
};
export type EmbedMountOptions = EmbedProductionMountOptions | EmbedLegacyMountOptions | EmbedLegacyExperienceMountOptions;
export declare function isLegacyGardenMount(options: EmbedMountOptions): options is EmbedLegacyMountOptions;
export declare function isLegacyExperienceMount(options: EmbedMountOptions): options is EmbedLegacyExperienceMountOptions;
export declare function isProductionMount(options: EmbedMountOptions): options is EmbedProductionMountOptions;
export declare function resolveExperienceMode(options: EmbedProductionMountOptions): ExperienceMode;
export declare function toLaunchContext(options: EmbedProductionMountOptions): LaunchContext;
//# sourceMappingURL=types.d.ts.map