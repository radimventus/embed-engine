/**
 * Landing Anchor resolver — Delivery presentation only (no domain logic).
 * Maps ExperiencePresentationConfig.landingAnchorId → DOM id inside Studio.
 */

/** Known Experience Landing Anchor ids (EMB-01 / PILOT_SECTION_IDS + social-proof). */
export const KNOWN_LANDING_ANCHOR_IDS = Object.freeze([
  "social-proof",
  "hero",
  "property-explorer",
  "walkthrough",
  "floor-plan",
  "priority-experience",
  "ai-advisor",
  "audit-lead-capture",
] as const);

export type KnownLandingAnchorId = (typeof KNOWN_LANDING_ANCHOR_IDS)[number];

export const LAUNCHER_DEFAULT_LANDING_ANCHOR: KnownLandingAnchorId =
  "social-proof";

export const INLINE_DEFAULT_LANDING_ANCHOR: KnownLandingAnchorId = "hero";

const KNOWN_SET = new Set<string>(KNOWN_LANDING_ANCHOR_IDS);

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
export function resolveLandingAnchorId(
  input: ResolveLandingAnchorInput,
): ResolvedLandingAnchor {
  const configured = input.configuredId?.trim() ?? "";
  if (configured.length > 0 && KNOWN_SET.has(configured)) {
    return { elementId: configured, usedDefault: false };
  }

  const fallback = KNOWN_SET.has(input.modeDefaultId)
    ? input.modeDefaultId
    : LAUNCHER_DEFAULT_LANDING_ANCHOR;

  return { elementId: fallback, usedDefault: true };
}

export function landingAnchorSelector(elementId: string): string {
  // Ids are constrained to known kebab-case tokens; avoid CSS.escape for happy-dom.
  return `#${elementId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
