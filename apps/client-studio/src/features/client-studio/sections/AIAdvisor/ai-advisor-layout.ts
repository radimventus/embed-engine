export const FAQ_COLUMN_WIDTH_CLASS =
  'w-full max-w-[690px] tabletMin:!max-w-none tabletMin:!w-full tabletMax:!max-w-none tabletMax:!w-full desktop:w-[690px]';

export const FAQ_ACCORDION_LIST_WIDTH_CLASS =
  'w-full max-w-[680px] tabletMin:!max-w-none tabletMin:!w-full tabletMax:!max-w-none tabletMax:!w-full desktop:w-[680px]';

/**
 * Shared AI Advisor grid.
 * Left FAQ stack (title + boxes) shares row 2 height with the conversation;
 * chat input (row 3) starts where the last FAQ box ends.
 */
export const AI_ADVISOR_GRID_CLASS =
  'grid min-h-faq-ai grid-cols-[690px_minmax(0,1fr)] grid-rows-[auto_auto_auto_auto] items-start gap-x-section content-start overflow-x-hidden tabletMin:grid-cols-1 tabletMin:grid-rows-none tabletMax:!grid-cols-[minmax(0,1fr)_minmax(0,1fr)] mobile:grid-cols-1 mobile:grid-rows-none';

/**
 * FAQ title + boxes in one stack — boxes flush to the title baseline
 * (no gap). Spans header+conversation rows so list bottom = input top.
 */
export const AI_ADVISOR_FAQ_COLUMN_CELL_CLASS =
  'col-start-1 row-start-1 row-span-2 box-border flex flex-col gap-[30px] pt-section pl-section pr-0 tabletMin:col-start-1 tabletMin:col-span-1 tabletMin:row-auto tabletMin:row-span-1 mobile:col-span-1 mobile:row-auto mobile:row-span-1 mobile:gap-5 mobile:pr-section';

export const AI_ADVISOR_HEADER_CELL_CLASS =
  'relative z-20 col-start-2 row-start-1 box-border overflow-visible bg-[#FFFFFF] pt-section pl-[14px] pr-[20px] tabletMin:col-start-1 tabletMin:col-span-1 tabletMin:row-auto tabletMin:px-section mobile:col-span-1 mobile:row-auto mobile:px-section';

/**
 * Conversation fills the FAQ-aligned band at minimum and grows with the
 * thread so the latest Q+A stays fully visible (CAP UX 54 / 55).
 */
export const AI_ADVISOR_CONVERSATION_CELL_CLASS =
  'col-start-2 row-start-2 box-border flex flex-col self-stretch pl-[14px] pr-[20px] tabletMin:col-start-1 tabletMin:col-span-1 tabletMin:row-auto tabletMin:px-section mobile:col-span-1 mobile:row-auto mobile:px-section';

/** Top edge aligns with bottom edge of the last FAQ box (start of row 3). */
export const AI_ADVISOR_INPUT_CELL_CLASS =
  'col-start-2 row-start-3 box-border pl-[14px] pr-[20px] tabletMin:col-start-1 tabletMin:col-span-1 tabletMin:row-auto tabletMin:px-section mobile:col-span-1 mobile:row-auto mobile:px-section';

export const AI_ADVISOR_DISCLAIMER_CELL_CLASS =
  'col-start-2 row-start-4 box-border pb-section pl-[14px] pr-[20px] tabletMin:col-start-1 tabletMin:col-span-1 tabletMin:row-auto tabletMin:px-section mobile:col-span-1 mobile:row-auto mobile:px-section mobile:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]';

export const AI_CHAT_CONTENT_CONTAINER_CLASS =
  'box-border flex min-h-full w-full max-w-[682px] min-w-0 shrink-0 flex-col tabletMin:!max-w-none tabletMin:!w-full tabletMax:!max-w-none tabletMax:!w-full desktop:w-[682px]';

/** Clears the header white veil so the welcome bubble stays readable (CAP UX 55). */
export const AI_CHAT_VEIL_CLEARANCE_PX = 28;

export const AI_ADVISOR_INPUT_GAP_CLASS = 'shrink-0';

export const AI_CHAT_CANVAS_WIDTH_PX = 682;
