import { useEffect, useState } from 'react';

import { colors } from '@embed-engine/design-tokens';
import type { RecommendedQuestion } from '@embed-engine/core/cognitive';

import { useInterpretation } from '../../cognitive/InterpretationProvider';
import {
  FAQ_ACCORDION_LIST_WIDTH_CLASS,
  FAQ_COLUMN_WIDTH_CLASS,
} from './ai-advisor-layout';

type SuggestedQuestionsProps = {
  onQuestionSelect: (question: string, topicId: string) => void;
};

const FAQ_CARET_SIZE = { width: 18, height: 8 } as const;

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
  const interpretation = useInterpretation();

  return (
    <div className={`${FAQ_COLUMN_WIDTH_CLASS} relative z-10 m-0 shrink-0`}>
      <h2 className="m-0 text-base font-bold leading-none tracking-wide text-embed-foreground-primary">
        CO NAŠE KLIENTY NEJVÍCE ZAJÍMÁ:
      </h2>
      <p
        className="mt-2 text-[11px] leading-snug text-embed-foreground-primary/55 transition-opacity duration-300"
        data-testid="faq-active-topic"
      >
        Recommended for: {interpretation.activeTopic}
      </p>
    </div>
  );
}

type FaqItemProps = {
  item: RecommendedQuestion;
  onQuestionSelect: (question: string, topicId: string) => void;
};

function FaqItem({ item, onQuestionSelect }: FaqItemProps) {
  const [expanded, setExpanded] = useState(item.highlighted);

  useEffect(() => {
    if (item.highlighted) {
      setExpanded(true);
    }
  }, [item.highlighted, item.id]);

  return (
    <li
      className={`shrink-0 overflow-hidden rounded-[8px] border transition-[border-color,box-shadow,transform] duration-300 ${
        item.highlighted
          ? 'scale-[1.01] border-embed-brand-gold shadow-[0_0_0_1px_rgba(212,175,55,0.28)]'
          : 'border-embed-border-default'
      }`}
      style={{ backgroundColor: colors.surface.card }}
      data-testid={`faq-item-${item.id}`}
      data-highlighted={item.highlighted ? 'true' : 'false'}
    >
      <div className="flex h-faq-row items-center gap-3 px-section">
        <button
          type="button"
          onClick={() => onQuestionSelect(item.question, item.topicId)}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-embed-foreground-primary"
        >
          {item.question}
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
        style={{ gridTemplateRows: expanded || item.highlighted ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="border-t border-embed-border-default px-section py-2 text-[11px] leading-relaxed text-embed-brand-gold/90">
            {item.why}
          </p>
          <p className="px-section pb-3 text-sm leading-relaxed text-embed-foreground-primary/80">
            {item.answer}
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * FAQ rows from Interpretation.recommendedQuestions — shared Session snapshot (EX-02).
 * Question select emits Signals via parent; no DecisionState access.
 */
export function FaqList({ onQuestionSelect }: SuggestedQuestionsProps) {
  const interpretation = useInterpretation();
  const questions = interpretation.recommendedQuestions;

  return (
    <ul
      className={`${FAQ_ACCORDION_LIST_WIDTH_CLASS} flex shrink-0 flex-col gap-[14px]`}
      data-testid="faq-list"
    >
      {questions.map((item) => (
        <FaqItem key={item.id} item={item} onQuestionSelect={onQuestionSelect} />
      ))}
    </ul>
  );
}

/** @deprecated Prefer FaqTitle + FaqList in the shared AI Advisor grid. */
export function SuggestedQuestions({ onQuestionSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex min-h-faq-ai flex-col py-section pl-section pr-0">
      <FaqTitle />
      <div className="mt-section flex flex-1 items-end">
        <FaqList onQuestionSelect={onQuestionSelect} />
      </div>
    </div>
  );
}
