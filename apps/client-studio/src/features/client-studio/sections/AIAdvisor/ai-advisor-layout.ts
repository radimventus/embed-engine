export const FAQ_COLUMN_WIDTH_CLASS = 'w-[690px]';

export const FAQ_ACCORDION_LIST_WIDTH_CLASS = 'w-[680px]';

/**
 * Shared AI Advisor grid.
 * Left FAQ stack (title + boxes) shares row 2 height with the conversation;
 * chat input (row 3) starts where the last FAQ box ends.
 */
export const AI_ADVISOR_GRID_CLASS =
  'grid min-h-faq-ai grid-cols-[690px_minmax(0,1fr)] grid-rows-[auto_auto_auto_auto] items-start gap-x-section content-start mobile:grid-cols-1 mobile:grid-rows-none';

/**
 * FAQ title + boxes in one stack — boxes flush to the title baseline
 * (no gap). Spans header+conversation rows so list bottom = input top.
 */
export const AI_ADVISOR_FAQ_COLUMN_CELL_CLASS =
  'col-start-1 row-start-1 row-span-2 box-border flex flex-col gap-[30px] pt-section pl-section pr-0 mobile:col-span-1 mobile:row-auto mobile:row-span-1';

export const AI_ADVISOR_HEADER_CELL_CLASS =
  'relative z-20 col-start-2 row-start-1 box-border overflow-visible bg-[#FFFFFF] pt-section pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto';

/** Same vertical band as FAQ boxes — height follows the FAQ stack. */
export const AI_ADVISOR_CONVERSATION_CELL_CLASS =
  'col-start-2 row-start-2 box-border flex min-h-0 flex-col overflow-hidden self-stretch pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto';

/** Top edge aligns with bottom edge of the last FAQ box (start of row 3). */
export const AI_ADVISOR_INPUT_CELL_CLASS =
  'col-start-2 row-start-3 box-border pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto';

export const AI_ADVISOR_DISCLAIMER_CELL_CLASS =
  'col-start-2 row-start-4 box-border pb-section pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto';

export const AI_CHAT_CONTENT_CONTAINER_CLASS =
  'box-border flex h-full min-h-0 w-[682px] max-w-[682px] min-w-0 shrink-0 flex-col overflow-hidden';

/** Clears the header white veil so the welcome bubble stays readable (CAP UX 55). */
export const AI_CHAT_VEIL_CLEARANCE_PX = 28;

export const AI_ADVISOR_INPUT_GAP_CLASS = 'shrink-0';

export const AI_CHAT_CANVAS_WIDTH_PX = 682;
