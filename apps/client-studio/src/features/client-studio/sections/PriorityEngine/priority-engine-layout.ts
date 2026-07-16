import { SECTION_PADDING_PX } from '../../chapter-layout';
import { DECISION_GRID_COLUMN_SIZE_PX, DECISION_SURFACE_WIDTH_PX } from './decision-cards-layout';

export const PRIORITY_ENGINE_CONTENT_OFFSET_PX = 20;

export const PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_PX = 20;

export const PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS = 'pb-5';

export const PRIORITY_ENGINE_TITLE_BAND_PX = 60;

export const PRIORITY_ENGINE_TITLE_BAND_CLASS =
  'box-border flex h-[60px] min-h-[60px] max-h-[60px] shrink-0 grow-0 items-center overflow-hidden';

export const PRIORITY_ENGINE_TITLE_CLASS =
  'm-0 p-0 text-base font-bold leading-none tracking-wide text-embed-brand-navy';

export const PRIORITY_ENGINE_INTRO_WIDTH_PX = 680;

export const PRIORITY_ENGINE_INTRO_TOP_PX = 20;

export const PRIORITY_ENGINE_INTRO_HEIGHT_PX = 358;

export const PRIORITY_ENGINE_INTRO_PANEL_CLASS =
  'box-border absolute top-[20px] right-section z-0 flex h-[358px] w-[680px] min-w-[680px] max-w-[680px] flex-col border border-embed-border-default bg-embed-white p-section';

export const PRIORITY_ENGINE_ACTION_AREA_CLASS =
  'mt-5 flex w-[680px] shrink-0 items-center justify-between gap-section';

export const PRIORITY_ENGINE_CONFIRM_PLACEHOLDER_CLASS =
  'inline-flex w-[120px] shrink-0 items-center justify-center rounded-lg border border-embed-neutral-200 bg-embed-neutral-50/50 py-2 text-xs font-medium tracking-wide text-embed-foreground-muted/60 cursor-not-allowed';

export const PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL = false;

export const PRIORITY_ENGINE_SHOW_DECISION_REPORT = false;

/** @internal Reference for layout audits */
export const PRIORITY_ENGINE_SECTION_PADDING_PX = SECTION_PADDING_PX;

/** @internal Aligns continue control with decision card column rhythm */
export const PRIORITY_ENGINE_CONFIRM_WIDTH_PX = DECISION_GRID_COLUMN_SIZE_PX;

/** @internal Matches decision surface width for action row alignment */
export const PRIORITY_ENGINE_ACTION_AREA_WIDTH_PX = DECISION_SURFACE_WIDTH_PX;
