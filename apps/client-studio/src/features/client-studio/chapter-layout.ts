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
export const SPATIAL_TERMINAL_MEDIA_LEFT_GUTTER_PX = 20;
export const SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX = 600;
export const SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_LEFT_GUTTER_PX + SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX;
/** Room index column: left pad + shared control width (PT-TOUR-LAYOUT-01). */
export const SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX = 224;
export const SPATIAL_TERMINAL_FLOOR_PLAN_RIGHT_GUTTER_PX = 20;
/** Gap between room menu column and floor-plan display (TOUR-10). */
export const SPATIAL_TERMINAL_FLOOR_PLAN_LEFT_GAP_PX = 40;
export const SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX =
  CANVAS_WIDTH_PX -
  SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX -
  SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX;
export const SPATIAL_TERMINAL_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX +
  SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX +
  SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX;
export const SPATIAL_TERMINAL_TITLE_BAND_PX = 60;
export const SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_PX = 20;
export const SPATIAL_TERMINAL_THUMBNAIL_ROW_PX = 100;
export const SPATIAL_TERMINAL_THUMBNAIL_RAIL_PX = 80;
export const SPATIAL_TERMINAL_THUMBNAIL_HEIGHT_PX = 80;
/** 16:9 at thumbnail rail height */
export const SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX = Math.round(
  (SPATIAL_TERMINAL_THUMBNAIL_HEIGHT_PX * 16) / 9,
);

export const FAQ_ROW_HEIGHT_PX = 45;
export const FAQ_CHAPTER_MIN_HEIGHT_PX = 480;
export const FAQ_COLUMN_WIDTH_PX = 690;
export const AI_ADVISOR_CHAT_LEFT_INSET_PX = 14;

export const MOTION_DURATION_CLASS = 'duration-200 ease-out';

export const CHAPTER_PANEL_DIVIDER_CLASS = 'mt-4 border-t border-embed-border-default pt-4';

export const CHAPTER_PANEL_LABEL_CLASS =
  'text-xs font-medium uppercase tracking-wide text-embed-foreground-primary/45';
