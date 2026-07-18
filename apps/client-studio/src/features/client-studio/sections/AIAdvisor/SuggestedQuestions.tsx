import { useState } from 'react';

import { colors } from '@embed-engine/design-tokens';

import {
  FAQ_ACCORDION_LIST_WIDTH_CLASS,
  FAQ_COLUMN_WIDTH_CLASS,
} from './ai-advisor-layout';

const FAQ_ITEMS = [
  {
    question: 'Lorem ipsum dolor sit amet?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    question: 'Lorem ipsum dolor sit amet?',
    answer:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    question: 'Lorem ipsum dolor sit amet?',
    answer:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  },
  {
    question: 'Lorem ipsum dolor sit amet?',
    answer:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    question: 'Lorem ipsum dolor sit amet?',
    answer:
      'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.',
  },
  {
    question: 'Lorem ipsum dolor sit amet?',
    answer:
      'Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Aenean lacinia bibendum nulla sed consectetur.',
  },
] as const;

type SuggestedQuestionsProps = {
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
    <h2 className={`${FAQ_COLUMN_WIDTH_CLASS} relative z-10 m-0 shrink-0 text-base font-bold leading-none tracking-wide text-embed-foreground-primary`}>
      CO NAŠE KLIENTY NEJVÍCE ZAJÍMÁ:
    </h2>
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
      <div className="flex h-faq-row items-center gap-3 px-section">
        <button
          type="button"
          onClick={() => onQuestionSelect(question)}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-embed-foreground-primary"
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
          <p className="border-t border-embed-border-default px-section py-3 text-sm leading-relaxed text-embed-foreground-primary/80">
            {answer}
          </p>
        </div>
      </div>
    </li>
  );
}

/** FAQ topic rows — height 45px header, gap 14px; caret expands answer in 0.5s. */
export function FaqList({ onQuestionSelect }: SuggestedQuestionsProps) {
  return (
    <ul className={`${FAQ_ACCORDION_LIST_WIDTH_CLASS} flex shrink-0 flex-col gap-[14px]`}>
      {FAQ_ITEMS.map((item, index) => (
        <FaqItem
          key={index}
          question={item.question}
          answer={item.answer}
          onQuestionSelect={onQuestionSelect}
        />
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
