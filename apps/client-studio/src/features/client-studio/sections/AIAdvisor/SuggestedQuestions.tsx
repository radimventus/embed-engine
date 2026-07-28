import { useEffect, useState } from 'react';

import { colors, palette } from '@embed-engine/design-tokens';

import {
  FAQ_ACCORDION_LIST_WIDTH_CLASS,
  FAQ_COLUMN_WIDTH_CLASS,
} from './ai-advisor-layout';
import type { ExperienceFaqItem } from './experiencePresentation';
import {
  FAQ_VISIBLE_PAGE_SIZE,
} from './faqProgressiveLoading';

export { FAQ_VISIBLE_PAGE_SIZE } from './faqProgressiveLoading';

const LOAD_MORE_LABEL = 'Zobrazit další';

/** RAC-06 — answer body 20% larger than the prior 14px baseline. */
const FAQ_ANSWER_FONT_SIZE_PX = 16.8;

/** Solo CTA metrics — navy + white hover, no border (CAP UX 52). */
const SWITCH_IDLE_BG = palette.navy;
const SWITCH_IDLE_TEXT = palette.pureWhite;
const SWITCH_HOVER_BG = palette.gold;
const SWITCH_HOVER_TEXT = palette.navy;
const SWITCH_IDLE_RADIUS_PX = 4.8;
const SWITCH_FONT_SIZE_PX = 12.5;
const SWITCH_FONT_WEIGHT = 600;

type SuggestedQuestionsProps = {
  items: readonly ExperienceFaqItem[];
  onQuestionSelect: (question: string) => void;
};

const FAQ_CARET_SIZE = { width: 18, height: 8 } as const;

/** Classic select caret — locked box so flex/CSS never squash aspect ratio. */
function FaqCaretIcon({ expanded }: { expanded: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 grow-0 items-center justify-center transition-transform duration-500 ease-out ${
        expanded ? 'rotate-180' : 'rotate-0'
      }`}
      style={{
        width: FAQ_CARET_SIZE.width,
        height: FAQ_CARET_SIZE.height,
        minWidth: FAQ_CARET_SIZE.width,
        minHeight: FAQ_CARET_SIZE.height,
      }}
    >
      <svg
        viewBox="0 0 12 8"
        width={FAQ_CARET_SIZE.width}
        height={FAQ_CARET_SIZE.height}
        preserveAspectRatio="none"
        className="block max-h-none max-w-none"
        style={{
          width: FAQ_CARET_SIZE.width,
          height: FAQ_CARET_SIZE.height,
          flexShrink: 0,
        }}
        fill={colors.action.accent}
      >
        <path d="M1 1h10L6 7 1 1z" />
      </svg>
    </span>
  );
}

export function FaqTitle() {
  return (
    <div className={`${FAQ_COLUMN_WIDTH_CLASS} relative z-10 m-0 shrink-0`}>
      <h2 className="m-0 text-base font-bold uppercase leading-none tracking-wide text-embed-foreground-primary">
        Otázky, které navazují na náš rozhovor
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-embed-foreground-primary/60">
        Vycházejí z vašich priorit a připravují vás na další společný krok.
      </p>
    </div>
  );
}

type FaqItemProps = {
  question: string;
  answer: string;
  onQuestionSelect: (question: string) => void;
};

function FaqItem({ question, answer, onQuestionSelect }: FaqItemProps) {
  const [expanded, setExpanded] = useState(false);

  const togglePanel = () => {
    setExpanded((current) => {
      const next = !current;
      if (next) {
        onQuestionSelect(question);
      }
      return next;
    });
  };

  return (
    <li
      className="shrink-0 overflow-hidden rounded-[8px] border border-embed-border-default"
      style={{ backgroundColor: colors.surface.card }}
    >
      {/* RAC-07 — entire FAQ panel is one hit target (expand + seed input). */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? 'Sbalit odpověď' : 'Rozbalit odpověď'}
        onClick={togglePanel}
        className="flex w-full cursor-pointer flex-col border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-embed-brand-gold/35"
      >
        <div className="flex min-h-faq-row items-center gap-3 px-section py-3">
          <span className="min-w-0 flex-1 text-[16px] font-semibold leading-snug text-embed-foreground-primary">
            {question}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]">
            <FaqCaretIcon expanded={expanded} />
          </span>
        </div>
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <p
              className="border-t border-embed-border-default px-section py-3.5 leading-relaxed text-embed-foreground-primary/80"
              style={{ fontSize: FAQ_ANSWER_FONT_SIZE_PX }}
            >
              {answer}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}

/** FAQ topic rows — always a page of 3 + load-more when more remain (CAP UX 53). */
export function FaqList({ items, onQuestionSelect }: SuggestedQuestionsProps) {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [items]);

  const pageSize = FAQ_VISIBLE_PAGE_SIZE;
  const start = pageIndex * pageSize;
  const visibleItems = items.slice(start, start + pageSize);
  const hasMore = start + pageSize < items.length;
  const showLoadMore = items.length > pageSize;

  return (
    <div
      className={`${FAQ_ACCORDION_LIST_WIDTH_CLASS} flex shrink-0 flex-col gap-[14px]`}
    >
      <ul className="m-0 flex list-none flex-col gap-[14px] p-0">
        {visibleItems.map((item) => (
          <FaqItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            onQuestionSelect={onQuestionSelect}
          />
        ))}
      </ul>
      {showLoadMore ? (
        <button
          type="button"
          disabled={!hasMore}
          onClick={() => {
            if (!hasMore) {
              return;
            }
            setPageIndex((current) => current + 1);
          }}
          className="mx-auto cursor-pointer px-5 py-[6.4px] text-center font-medium leading-normal tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-45"
          style={{
            backgroundColor: SWITCH_IDLE_BG,
            color: SWITCH_IDLE_TEXT,
            fontSize: SWITCH_FONT_SIZE_PX,
            fontWeight: SWITCH_FONT_WEIGHT,
            borderRadius: SWITCH_IDLE_RADIUS_PX,
            borderStyle: 'none',
            borderWidth: 0,
            transition: 'background-color 125ms ease-out, color 125ms ease-out',
          }}
          onMouseEnter={(event) => {
            if (!hasMore) {
              return;
            }
            event.currentTarget.style.backgroundColor = SWITCH_HOVER_BG;
            event.currentTarget.style.color = SWITCH_HOVER_TEXT;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = SWITCH_IDLE_BG;
            event.currentTarget.style.color = SWITCH_IDLE_TEXT;
          }}
        >
          {LOAD_MORE_LABEL}
        </button>
      ) : null}
    </div>
  );
}

/** @deprecated Prefer FaqTitle + FaqList in the shared AI Advisor grid. */
export function SuggestedQuestions({
  items,
  onQuestionSelect,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex min-h-faq-ai flex-col py-section pl-section pr-0">
      <FaqTitle />
      <div className="mt-section flex flex-1 items-end">
        <FaqList items={items} onQuestionSelect={onQuestionSelect} />
      </div>
    </div>
  );
}
