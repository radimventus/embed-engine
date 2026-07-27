/**
 * Client Studio chapter layout tokens.
 * Authority: docs/design-system/layout-tokens.md + master-layout-specification-v1
 * Tour spacing module: 20 px.
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

/** Soft floor only — section height is driven by floorplan. */
export const SPATIAL_TERMINAL_SURFACE_PX = 484;
/** Media block keeps a 20 px gutter from the shell edge. */
export const SPATIAL_TERMINAL_MEDIA_LEFT_GUTTER_PX = 20;
/** Media display width. */
export const SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX = 600;
/** Media column stays visually aligned; content can shift 2 px within it. */
export const SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_LEFT_GUTTER_PX + SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX;
/**
 * Room menu column — expanded; gaps to display / plan are 20 px paddings.
 */
export const SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX = 240;
export const SPATIAL_TERMINAL_FLOOR_PLAN_RIGHT_GUTTER_PX = 20;
/** Floor plan keeps a 20 px gap from the room menu. */
export const SPATIAL_TERMINAL_FLOOR_PLAN_LEFT_GAP_PX = 20;
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
/** Min gap between floorplan and toggle pair. */
export const SPATIAL_TERMINAL_PLAN_TOGGLE_MIN_GAP_PX = 50;
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
