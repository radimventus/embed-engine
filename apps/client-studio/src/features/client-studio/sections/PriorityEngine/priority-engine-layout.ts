import { SECTION_PADDING_PX } from '../../chapter-layout';
import { DECISION_GRID_COLUMN_SIZE_PX, DECISION_SURFACE_WIDTH_PX } from './decision-cards-layout';

export const PRIORITY_ENGINE_CONTENT_OFFSET_PX = 20;

export const PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_PX = 20;

export const PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS = 'pb-5';

export const PRIORITY_ENGINE_TITLE_BAND_PX = 60;

export const PRIORITY_ENGINE_TITLE_BAND_CLASS =
  'box-border flex h-[60px] min-h-[60px] max-h-[60px] shrink-0 grow-0 items-center overflow-hidden';

export const PRIORITY_ENGINE_TITLE_CLASS =
  'm-0 p-0 text-base font-bold leading-none tracking-wide text-embed-foreground-primary';

export const PRIORITY_ENGINE_INTRO_WIDTH_PX = 680;

export const PRIORITY_ENGINE_INTRO_TOP_PX = 20;

export const PRIORITY_ENGINE_INTRO_HEIGHT_PX = 358;

export const PRIORITY_ENGINE_SECTION_PADDING_PX = SECTION_PADDING_PX;

export const PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_PX = 21;

export const PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS = 'px-[21px]';

export const PRIORITY_ENGINE_INTRO_PANEL_CLASS =
  'box-border absolute top-[20px] right-[21px] z-0 flex h-[358px] w-[680px] min-w-[680px] max-w-[680px] flex-col p-section';

export const PRIORITY_ENGINE_ACTION_AREA_CLASS =
  'mt-5 flex w-[680px] shrink-0 items-center justify-between gap-section';

export const PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL = false;

export const PRIORITY_ENGINE_SHOW_DECISION_REPORT = false;

/** @internal Aligns continue control with decision card column rhythm */
export const PRIORITY_ENGINE_CONFIRM_WIDTH_PX = DECISION_GRID_COLUMN_SIZE_PX;

/** @internal Matches decision surface width for action row alignment */
export const PRIORITY_ENGINE_ACTION_AREA_WIDTH_PX = DECISION_SURFACE_WIDTH_PX;
