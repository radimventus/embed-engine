export const SPATIAL_TERMINAL_HEADER_CLASS =
  'flex h-chapter-title shrink-0 items-end overflow-hidden text-base font-bold leading-none tracking-wide text-embed-foreground-primary';

export const SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS =
  'flex h-chapter-title shrink-0 items-center overflow-hidden text-base font-bold leading-none tracking-wide text-embed-foreground-primary';

/** Title stays inside the floor-plan column — no bleed over VIDEO/FOTKY. */
export const DECISION_CANVAS_CHAPTER_TITLE_CLASS = `${SPATIAL_TERMINAL_HEADER_CLASS} box-border w-full max-w-none`;

export const CHAPTER_HEADER_CLASS =
  'flex h-chapter-title shrink-0 items-end text-base font-bold leading-none tracking-wide text-embed-foreground-primary';

export const PRIORITY_ENGINE_HEADER_CLASS =
  'flex h-chapter-title shrink-0 items-center text-base font-bold leading-none tracking-wide text-embed-foreground-primary';

/** 16:9 thumbnail — height matches rail, width follows aspect. */
export const SPATIAL_TERMINAL_THUMBNAIL_WIDTH_CLASS = 'aspect-video h-[80px] w-auto shrink-0';

export const SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS = 'pt-[20px]';

export const SPATIAL_TERMINAL_CONTROL_GAP_CLASS = 'gap-5';

export const SPATIAL_TERMINAL_THUMBNAIL_ROW_CLASS = 'h-[100px]';

/**
 * Full content width of the parent column.
 * Shared by VIDEO/FOTKY (with room-index inset) and PŘÍZEMÍ/PATRO.
 */
export const HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS = 'w-full';

/** Room Index content — parent supplies asymmetric L/R inset. */
export const HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS = 'w-full';

export const SPATIAL_TERMINAL_SECTION_CLASS =
  'grid w-full min-w-0 content-start items-start gap-0 overflow-x-hidden px-section pb-section';

export const SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS =
  'box-border flex h-full w-full min-w-0 flex-col content-start items-start gap-0 overflow-x-hidden pb-section pl-[20px] mobile:px-section';

export const SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS =
  'grid w-[600px] min-w-[600px] max-w-[600px] shrink-0 content-start items-start gap-0 mobile:w-full mobile:min-w-0 mobile:max-w-none';

/**
 * Floor plan column:
 * 20 px from menu, 20 px to section edge; height from plan + min 50 px to toggles.
 */
export const SPATIAL_TERMINAL_FLOOR_PLAN_SECTION_CLASS =
  'relative z-0 flex h-full w-full min-w-0 flex-col items-stretch overflow-x-hidden pl-[20px] pr-[20px] pb-section';

export const SPATIAL_TERMINAL_MEDIA_VIEWPORT_CLASS =
  'relative box-border aspect-video w-[600px] min-w-[600px] max-w-[600px] shrink-0 overflow-hidden rounded-[8px] bg-embed-surface-placeholder';

/** Shared bottom baseline for thumbnails + VIDEO/FOTKY + PŘÍZEMÍ/PATRO. */
export const SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS =
  'relative flex w-full shrink-0 items-end';

/** Min gap between floorplan block and toggle pair. */
export const SPATIAL_TERMINAL_PLAN_TOGGLE_GAP_CLASS = 'min-h-[50px] flex-1';
