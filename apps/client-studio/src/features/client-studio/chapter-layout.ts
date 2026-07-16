/**
 * Client Studio chapter layout tokens.
 * Authority: docs/design-system/layout-tokens.md + master-layout-specification-v1
 */

export const CANVAS_WIDTH_PX = 1432;
export const OUTER_MARGIN_PX = 64;
export const SECTION_PADDING_PX = 24;
export const CHAPTER_SPACING_PX = 30;
export const CHAPTER_TITLE_BAND_PX = 60;

export const OPENING_HEADER_PX = 72;
export const OPENING_HERO_IMAGE_PX = 584;
export const OPENING_HERO_OVERLAY_PX = 112;
export const OPENING_SOCIAL_PROOF_PX = 90;

export const SPATIAL_TERMINAL_SURFACE_PX = 484;
export const SPATIAL_TERMINAL_TITLE_BAND_PX = 60;
export const SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_PX = 20;
export const SPATIAL_TERMINAL_THUMBNAIL_ROW_PX = 100;
export const SPATIAL_TERMINAL_THUMBNAIL_RAIL_PX = 80;
export const SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX = 140;
export const SPATIAL_TERMINAL_THUMBNAIL_HEIGHT_PX = 80;

export const FAQ_ROW_HEIGHT_PX = 55;
export const FAQ_CHAPTER_MIN_HEIGHT_PX = 480;

export const MOTION_DURATION_CLASS = 'duration-200 ease-out';

export const CHAPTER_CTA_CLASS = `rounded-xl bg-embed-brand-navy px-8 py-4 text-center font-sans text-base font-medium text-embed-white shadow-sm transition-[box-shadow,opacity] ${MOTION_DURATION_CLASS} hover:opacity-90 hover:shadow-md active:opacity-95 active:shadow-sm`;

export const CHAPTER_CTA_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-navy/25 focus-visible:ring-offset-2';

export const CHAPTER_CTA_DISABLED_CLASS = `rounded-xl border border-embed-neutral-200 bg-embed-neutral-100 px-8 py-4 text-center font-sans text-base font-medium text-embed-foreground-muted transition-[box-shadow,opacity] ${MOTION_DURATION_CLASS} disabled:cursor-not-allowed`;

export const CHAPTER_PANEL_CLASS =
  'rounded-xl border border-embed-neutral-200/80 bg-embed-white px-section py-5';

export const CHAPTER_PANEL_DIVIDER_CLASS = 'mt-4 border-t border-embed-neutral-200/80 pt-4';

export const CHAPTER_PANEL_LABEL_CLASS =
  'text-xs font-medium uppercase tracking-wide text-embed-foreground-tertiary';
