import { useEffect, useState } from "react";

import { colors, palette } from "@embed-engine/design-tokens";

import { JOURNEY_CTA_PRIMARY_CLASS } from "../../foundation/journeyCta";
import {
  FAQ_ACCORDION_LIST_WIDTH_CLASS,
  FAQ_COLUMN_WIDTH_CLASS,
} from "./ai-advisor-layout";
import type { ExperienceFaqItem } from "./experiencePresentation";
import {
  FAQ_VISIBLE_PAGE_SIZE,
  faqDatasetIdentity,
  hasMoreFaqItems,
  initialFaqVisibleCount,
  nextFaqVisibleCount,
} from "./faqProgressiveLoading";

export { FAQ_VISIBLE_PAGE_SIZE } from "./faqProgressiveLoading";

const LOAD_MORE_LABEL = "Zobrazit další";

/** RAC-06 — answer body 20% larger than the prior 14px baseline. */
const FAQ_ANSWER_FONT_SIZE_PX = 16.8;

/** Match Experience scene nav buttons (Pokračovat / Zpět), centered under FAQ (RCS-05). */
const FAQ_LOAD_MORE_BUTTON_CLASS = `${JOURNEY_CTA_PRIMARY_CLASS} w-auto self-center disabled:cursor-default disabled:opacity-45`;

type SuggestedQuestionsProps = {
  items: readonly ExperienceFaqItem[];
  onQuestionSelect: (question: string) => void;
  onQuestionOpened?: (item: ExperienceFaqItem) => void;
};

const FAQ_CARET_SIZE = { width: 18, height: 8 } as const;

/** Classic select caret — locked box so flex/CSS never squash aspect ratio. */
function FaqCaretIcon({ expanded }: { expanded: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 grow-0 items-center justify-center transition-transform duration-500 ease-out ${
        expanded ? "rotate-180" : "rotate-0"
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
  item: ExperienceFaqItem;
  onQuestionSelect: (question: string) => void;
  onQuestionOpened?: (item: ExperienceFaqItem) => void;
};

function FaqItem({ item, onQuestionSelect, onQuestionOpened }: FaqItemProps) {
  const [expanded, setExpanded] = useState(false);

  const togglePanel = () => {
    setExpanded((current) => {
      const next = !current;
      if (next) {
        onQuestionSelect(item.question);
        onQuestionOpened?.(item);
      }
      return next;
    });
  };

  return (
    <li
      className="shrink-0 overflow-hidden rounded-[8px] border border-embed-border-default"
      style={{ backgroundColor: palette.creamLight }}
    >
      {/* RAC-07 — entire FAQ panel is one hit target (expand + seed input). */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? "Sbalit odpověď" : "Rozbalit odpověď"}
        onClick={togglePanel}
        className="normal-case mobile:normal-case mobile:min-h-0 flex w-full cursor-pointer flex-col border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-embed-brand-gold/35"
      >
        <div className="flex min-h-faq-row items-center gap-3 px-section py-3 mobile:min-h-0 mobile:gap-2 mobile:px-4 mobile:py-2">
          <span className="min-w-0 flex-1 text-[16px] font-semibold leading-snug text-embed-foreground-primary">
            {item.question}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] mobile:h-6 mobile:w-6">
            <FaqCaretIcon expanded={expanded} />
          </span>
        </div>
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <p
              className="border-t border-embed-border-default px-section py-3.5 leading-relaxed text-embed-foreground-primary/80"
              style={{ fontSize: FAQ_ANSWER_FONT_SIZE_PX }}
            >
              {item.answer}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}

/** FAQ topic rows — the approved first five topics are visible on landing. */
export function FaqList({
  items,
  onQuestionSelect,
  onQuestionOpened,
}: SuggestedQuestionsProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    initialFaqVisibleCount(items.length),
  );
  const datasetIdentity = faqDatasetIdentity(items);

  useEffect(() => {
    setVisibleCount(initialFaqVisibleCount(items.length));
  }, [datasetIdentity, items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = hasMoreFaqItems(visibleCount, items.length);
  const showLoadMore = items.length > FAQ_VISIBLE_PAGE_SIZE;

  return (
    <div
      className={`${FAQ_ACCORDION_LIST_WIDTH_CLASS} flex shrink-0 flex-col items-center gap-[14px]`}
    >
      <ul className="m-0 flex w-full list-none flex-col gap-[14px] p-0">
        {visibleItems.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            onQuestionSelect={onQuestionSelect}
            onQuestionOpened={onQuestionOpened}
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
            setVisibleCount((current) =>
              nextFaqVisibleCount(current, items.length),
            );
          }}
          className={FAQ_LOAD_MORE_BUTTON_CLASS}
          style={{
            backgroundColor: palette.navy,
            color: palette.pureWhite,
            borderStyle: "none",
            borderWidth: 0,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
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
