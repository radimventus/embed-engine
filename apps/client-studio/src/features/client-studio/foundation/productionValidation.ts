/**
 * RCS-06 — pilot device widths for production readiness validation.
 * Layout mapping only; does not change Runtime behavior.
 */

export type ProductionViewportBand = 'mobile' | 'tablet' | 'desktop';

export const PRODUCTION_VALIDATION_WIDTHS_PX = [
  360, 390, 430, 768, 1024, 1280, 1440,
] as const;

export function resolveProductionViewportBand(
  widthPx: number,
): ProductionViewportBand {
  if (widthPx <= 767) return 'mobile';
  if (widthPx < 1280) return 'tablet';
  return 'desktop';
}

export function resolveValidationBand(
  widthPx: (typeof PRODUCTION_VALIDATION_WIDTHS_PX)[number],
): ProductionViewportBand {
  return resolveProductionViewportBand(widthPx);
}
