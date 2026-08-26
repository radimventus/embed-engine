/**
 * RCS-01 — Client Studio responsive layout foundation.
 * Desktop (≥1280) remains the authoritative SSOT geometry.
 * Tablet / mobile adapt shell + canvas only — no Runtime / capability changes.
 */

export const VIEWPORT_BREAKPOINTS = {
  /** Inclusive max width for the mobile band. */
  mobileMaxPx: 767,
  /** Inclusive min width for the tablet band. */
  tabletMinPx: 768,
  /** Inclusive min width for the desktop (SSOT) band. */
  desktopMinPx: 1280,
} as const;

export type ViewportBand = 'mobile' | 'tablet' | 'desktop';

export const MOBILE_NAV_HEIGHT_PX = 0;

export function resolveViewportBand(widthPx: number): ViewportBand {
  if (widthPx <= VIEWPORT_BREAKPOINTS.mobileMaxPx) {
    return 'mobile';
  }
  if (widthPx < VIEWPORT_BREAKPOINTS.desktopMinPx) {
    return 'tablet';
  }
  return 'desktop';
}

export function isDesktopBand(band: ViewportBand): boolean {
  return band === 'desktop';
}

/** Fixed 1432px canvas applies only on desktop. */
export function usesFixedDesktopCanvas(band: ViewportBand): boolean {
  return band === 'desktop';
}

/** Left rail is desktop-only; below desktop compact top navigation owns section jumps. */
export function usesDesktopSidebarRail(band: ViewportBand): boolean {
  return band === 'desktop';
}

/** Compact top section navigation — tablet + mobile (RCS-01 shell). */
export function usesMobileSectionNav(band: ViewportBand): boolean {
  return band !== 'desktop';
}

/** Gentle scroll-snap is a desktop/tablet affordance; phones scroll freely. */
export function usesGuidedScrollSnap(band: ViewportBand): boolean {
  return band !== 'mobile';
}

export function matchViewportBand(
  widthPx: number = typeof window !== 'undefined' ? window.innerWidth : VIEWPORT_BREAKPOINTS.desktopMinPx,
): ViewportBand {
  return resolveViewportBand(widthPx);
}

/**
 * Pilot device widths for RCS-06 validation (plus desktop SSOT).
 * Layout mapping only — does not change Runtime behavior.
 */
export const PRODUCTION_VALIDATION_WIDTHS_PX = [
  360, 390, 430, 768, 1024, 1280, 1440,
] as const;

export function resolveValidationBand(
  widthPx: (typeof PRODUCTION_VALIDATION_WIDTHS_PX)[number],
): ViewportBand {
  return resolveViewportBand(widthPx);
}
