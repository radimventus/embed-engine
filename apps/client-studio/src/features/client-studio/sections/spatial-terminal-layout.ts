export const SPATIAL_TERMINAL_HEADER_CLASS =
  'flex h-6 shrink-0 items-end overflow-hidden text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const DECISION_CANVAS_CHAPTER_TITLE_CLASS = `${SPATIAL_TERMINAL_HEADER_CLASS} box-border w-[calc(100%+(15/35)*100%+24px+1px)] max-w-none -ml-[calc((15/35)*100%+24px+1px)]`;

export const CHAPTER_HEADER_CLASS =
  'flex min-h-6 shrink-0 items-end text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const SPATIAL_TERMINAL_SECTION_CLASS =
  'grid w-full min-w-0 content-start items-start gap-section overflow-x-hidden px-section py-section';

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
