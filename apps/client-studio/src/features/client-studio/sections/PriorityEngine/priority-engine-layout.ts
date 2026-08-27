import { SECTION_PADDING_PX } from '../../chapter-layout';
import {
  DECISION_GRID_COLUMN_SIZE_PX,
  DECISION_SURFACE_HEIGHT_PX,
  DECISION_SURFACE_WIDTH_PX,
} from './decision-cards-layout';

export const PRIORITY_ENGINE_CONTENT_OFFSET_PX = 20;

export const PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_PX = 20;

export const PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS = 'pb-5';

export const PRIORITY_ENGINE_TITLE_BAND_PX = 60;

/** Title band — vertically centered between section top and card top. */
export const PRIORITY_ENGINE_TITLE_BAND_CLASS =
  'box-border flex min-h-[60px] shrink-0 grow-0 items-center overflow-visible mobile:min-h-[48px]';

export const PRIORITY_ENGINE_TITLE_CLASS =
  'm-0 p-0 text-base font-bold leading-none tracking-wide text-embed-foreground-primary mobile:text-[0.9375rem] mobile:leading-snug';

export const PRIORITY_ENGINE_INTRO_WIDTH_PX = 680;

export const PRIORITY_ENGINE_INTRO_TOP_PX = 20;

/** Matches two Priority card rows (+ gap). */
export const PRIORITY_ENGINE_INTRO_HEIGHT_PX = DECISION_SURFACE_HEIGHT_PX;

export const PRIORITY_ENGINE_SECTION_PADDING_PX = SECTION_PADDING_PX;

export const PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_PX = 21;

export const PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS =
  'px-[21px] mobile:px-section';

export const PRIORITY_ENGINE_INTRO_PANEL_CLASS =
  'box-border relative z-0 flex w-full max-w-[680px] flex-col self-stretch overflow-visible p-section';

/**
 * Conversation panel — top edge flush with cards (no top padding / no % row in flow).
 * Stretched 30 px left into the gap on desktop; full-bleed stack on mobile (RCS-02).
 */
export const PRIORITY_ENGINE_CONVERSATION_PANEL_CLASS =
  'box-border relative z-0 -ml-[30px] flex h-auto w-[calc(100%+30px)] max-w-[710px] flex-col self-start overflow-visible bg-transparent px-section pb-section pt-0 mobile:ml-0 mobile:w-full mobile:max-w-none mobile:px-0';

/** Sticky conversation CTA — clears RCS-01 mobile bottom nav (RCS-02). */
export const PRIORITY_ENGINE_MOBILE_STICKY_CTA_CLASS =
  'mobile:sticky mobile:bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] mobile:z-40 mobile:mx-0 mobile:border-t mobile:border-embed-border-default mobile:bg-[#FFFFFF]/95 mobile:px-0 mobile:py-3 mobile:backdrop-blur-[6px]';

export const PRIORITY_ENGINE_ACTION_AREA_CLASS =
  'mt-5 flex w-[680px] shrink-0 items-center justify-between gap-section';

/** End-of-section recommendation chrome removed (PT-PRIORITY-REDESIGN-01). */
export const PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL = false;

export const PRIORITY_ENGINE_SHOW_DECISION_REPORT = false;

/** Max height for Decision Report block (layout only). */
export const PRIORITY_ENGINE_DECISION_REPORT_MAX_HEIGHT_PX = 350;

/** @internal Aligns continue control with decision card column rhythm */
export const PRIORITY_ENGINE_CONFIRM_WIDTH_PX = DECISION_GRID_COLUMN_SIZE_PX;

/** @internal Matches decision surface width for action row alignment */
export const PRIORITY_ENGINE_ACTION_AREA_WIDTH_PX = DECISION_SURFACE_WIDTH_PX;
