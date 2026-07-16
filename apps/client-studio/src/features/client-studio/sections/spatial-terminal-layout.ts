export const SPATIAL_TERMINAL_HEADER_CLASS =
  'flex h-chapter-title shrink-0 items-end overflow-hidden text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS =
  'flex h-chapter-title shrink-0 items-center overflow-hidden text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const DECISION_CANVAS_CHAPTER_TITLE_CLASS = `${SPATIAL_TERMINAL_HEADER_CLASS} box-border w-[calc(100%+(15/35)*100%+24px+1px)] max-w-none -ml-[calc((15/35)*100%+24px+1px)]`;

export const CHAPTER_HEADER_CLASS =
  'flex h-chapter-title shrink-0 items-end text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const PRIORITY_ENGINE_HEADER_CLASS =
  'flex h-chapter-title shrink-0 items-center text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const SPATIAL_TERMINAL_THUMBNAIL_WIDTH_CLASS = 'h-[80px] w-[140px] shrink-0';

export const SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS = 'pt-5';

export const SPATIAL_TERMINAL_CONTROL_GAP_CLASS = 'gap-5';

export const SPATIAL_TERMINAL_THUMBNAIL_ROW_CLASS = 'h-[100px]';

export const SPATIAL_TERMINAL_SECTION_CLASS =
  'grid w-full min-w-0 content-start items-start gap-0 overflow-x-hidden px-section pb-section';

export const SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS =
  'box-border w-full min-w-0 content-start items-start gap-0 overflow-x-hidden pb-section pl-[20px] mobile:px-section';

export const SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS =
  'grid w-[690px] min-w-[690px] max-w-[690px] shrink-0 content-start items-start gap-0';

export const SPATIAL_TERMINAL_MEDIA_VIEWPORT_CLASS =
  'relative box-border h-full min-h-0 w-[690px] min-w-[690px] max-w-[690px] shrink-0 overflow-hidden bg-embed-status-warning/15';

export const SEGMENTED_CONTROL_SHELL_CLASS =
  'inline-flex w-[9.5rem] shrink-0 rounded-lg border border-embed-neutral-200 bg-embed-neutral-50/50 p-0.5';

export const SEGMENTED_CONTROL_CENTER_CLASS = 'flex w-full shrink-0 justify-center';

export const SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS = `${SEGMENTED_CONTROL_CENTER_CLASS} relative z-10 -mt-[3px]`;

export const SEGMENTED_CONTROL_SEGMENT_CLASS =
  'flex-1 rounded py-2 text-xs font-medium tracking-wide transition-colors duration-[125ms] ease-out';

export const SEGMENTED_CONTROL_SEGMENT_ACTIVE_CLASS =
  `${SEGMENTED_CONTROL_SEGMENT_CLASS} bg-embed-brand-navy text-embed-white`;

export const SEGMENTED_CONTROL_SEGMENT_INACTIVE_CLASS = `${SEGMENTED_CONTROL_SEGMENT_CLASS} text-embed-foreground-muted hover:text-embed-foreground-secondary`;

export const SEGMENTED_CONTROL_SEGMENT_DISABLED_CLASS = `${SEGMENTED_CONTROL_SEGMENT_CLASS} cursor-not-allowed text-embed-foreground-muted/60`;
