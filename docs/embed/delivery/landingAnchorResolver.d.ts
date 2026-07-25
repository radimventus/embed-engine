/**
 * Landing Anchor resolver — Delivery presentation only (no domain logic).
 * Maps ExperiencePresentationConfig.landingAnchorId → DOM id inside Studio.
 */
/** Known Experience Landing Anchor ids (EMB-01 / PILOT_SECTION_IDS + social-proof). */
export declare const KNOWN_LANDING_ANCHOR_IDS: readonly ["social-proof", "hero", "property-explorer", "walkthrough", "floor-plan", "priority-experience", "ai-advisor", "audit-lead-capture"];
export type KnownLandingAnchorId = (typeof KNOWN_LANDING_ANCHOR_IDS)[number];
export declare const LAUNCHER_DEFAULT_LANDING_ANCHOR: KnownLandingAnchorId;
export declare const INLINE_DEFAULT_LANDING_ANCHOR: KnownLandingAnchorId;
export type ResolveLandingAnchorInput = {
    readonly configuredId: string | undefined | null;
    readonly modeDefaultId: string;
};
export type ResolvedLandingAnchor = {
    /** DOM element id to query inside the Experience surface. */
    readonly elementId: string;
    /** True when configured id was missing/unknown and mode default was applied. */
    readonly usedDefault: boolean;
};
/**
 * Resolve configured Landing Anchor to a known element id.
 * Invalid / unknown config → mode default (no domain interpretation).
 */
export declare function resolveLandingAnchorId(input: ResolveLandingAnchorInput): ResolvedLandingAnchor;
export declare function landingAnchorSelector(elementId: string): string;
//# sourceMappingURL=landingAnchorResolver.d.ts.map