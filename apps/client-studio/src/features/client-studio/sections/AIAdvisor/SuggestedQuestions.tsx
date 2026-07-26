import { useEffect, useState } from 'react';

import { colors } from '@embed-engine/design-tokens';

import {
  FAQ_ACCORDION_LIST_WIDTH_CLASS,
  FAQ_COLUMN_WIDTH_CLASS,
} from './ai-advisor-layout';
import type { ExperienceFaqItem } from './experiencePresentation';
import {
  hasMoreFaqItems,
  initialFaqVisibleCount,
  nextFaqVisibleCount,
} from './faqProgressiveLoading';

export { FAQ_VISIBLE_PAGE_SIZE } from './faqProgressiveLoading';

const LOAD_MORE_LABEL = 'Načíst další';

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
      <h2 className="m-0 text-[17px] font-semibold leading-snug tracking-wide text-embed-foreground-primary">
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

  return (
    <li
      className="shrink-0 overflow-hidden rounded-[8px] border border-embed-border-default"
      style={{ backgroundColor: colors.surface.card }}
    >
      <div className="flex min-h-faq-row items-center gap-3 px-section py-3">
        <button
          type="button"
          onClick={() => onQuestionSelect(question)}
          className="min-w-0 flex-1 cursor-pointer text-left text-[16px] font-semibold leading-snug text-embed-foreground-primary"
        >
          {question}
        </button>
        <button
          type="button"
          aria-label={expanded ? 'Sbalit odpověď' : 'Rozbalit odpověď'}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2"
        >
          <FaqCaretIcon expanded={expanded} />
        </button>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="border-t border-embed-border-default px-section py-3.5 text-[14px] leading-relaxed text-embed-foreground-primary/80">
            {answer}
          </p>
        </div>
      </div>
    </li>
  );
}

/** FAQ topic rows projected from Experience evidence — progressive reveal by page. */
export function FaqList({ items, onQuestionSelect }: SuggestedQuestionsProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    initialFaqVisibleCount(items.length),
  );

  useEffect(() => {
    setVisibleCount(initialFaqVisibleCount(items.length));
  }, [items]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = hasMoreFaqItems(visibleCount, items.length);

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
      {hasMore ? (
        <button
          type="button"
          onClick={() =>
            setVisibleCount((current) =>
              nextFaqVisibleCount(current, items.length),
            )
          }
          className="self-start cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-embed-foreground-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2"
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
