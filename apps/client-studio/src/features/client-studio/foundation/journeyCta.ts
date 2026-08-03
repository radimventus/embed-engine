/**
 * Shared Decision Journey CTA chrome (RCS-05).
 * Desktop keeps the 38px SSOT height; mobile uses ≥44px touch targets.
 */

export const JOURNEY_CTA_PRIMARY_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#001930] px-[19px] text-[13px] font-medium text-[#FFFFFF] transition-colors duration-150 hover:bg-embed-brand-gold hover:text-[#001930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 touch-manipulation desktop:min-h-[38px]';

export const JOURNEY_CTA_SECONDARY_CLASS = JOURNEY_CTA_PRIMARY_CLASS;

export const JOURNEY_CTA_FOOTER_ROW_CLASS =
  'flex items-start justify-between gap-3 px-section mobile:flex-col mobile:gap-3';
