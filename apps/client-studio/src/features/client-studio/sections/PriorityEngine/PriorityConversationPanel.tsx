import {
  PRIORITY_CONVERSATION_ADD_MORE,
  PRIORITY_CONVERSATION_ANSWER_ACK,
  PRIORITY_CONVERSATION_COLLECT_HINT,
  PRIORITY_CONVERSATION_COLLECT_LINES,
  PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL,
  PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL,
  PRIORITY_CONVERSATION_FINISH_SELECTION,
  PRIORITY_CONVERSATION_GATE_LINES,
  PRIORITY_CONVERSATION_GATE_PROMPT,
  PRIORITY_CONVERSATION_INTRO_LINES,
  PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT,
  PRIORITY_CONVERSATION_PDF_NOTE,
  PRIORITY_CONVERSATION_PREP_CONTINUE,
  PRIORITY_CONVERSATION_PREP_LINES,
  PRIORITY_CONVERSATION_START_LINES,
  PRIORITY_CONVERSATION_SUMMARY_LINES,
} from './priorityConversation.constants';
import { ConisMessage } from './ConisMessage';
import {
  PRIORITY_ENGINE_INTRO_HEIGHT_PX,
  PRIORITY_ENGINE_INTRO_PANEL_CLASS,
} from './priority-engine-layout';
import { usePriorityConversation } from './usePriorityConversation';

const bodyTextClass =
  'text-[13px] leading-[1.55] text-embed-foreground-primary';

const softTextClass =
  'text-[12px] leading-[1.5] text-embed-foreground-primary/65';

const navButtonClass =
  'rounded-[8px] border px-3 py-2.5 text-left text-[13px] font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 disabled:opacity-55';

const primaryNavClass = `${navButtonClass} border-[#D4AF37] bg-[#D4AF37]/15 text-embed-foreground-primary hover:bg-[#D4AF37]/25`;

const secondaryNavClass = `${navButtonClass} border-embed-foreground-primary/20 bg-transparent text-embed-foreground-primary hover:border-[#D4AF37]/50`;

/**
 * Right-panel Conis presence (PT-PRIORITY-TUNING-02).
 * Constitution-aligned copy, avatar, paced microinteractions.
 */
export function PriorityConversationPanel() {
  const {
    phase,
    selectedCount,
    tags,
    currentQuestion,
    canAddMore,
    isAdvancing,
    pendingOptionId,
    finishSelection,
    addMorePriorities,
    acknowledgePrep,
    answerQuestion,
    continueToFaq,
    askConis,
  } = usePriorityConversation();

  const showTags =
    phase === 'collecting' ||
    phase === 'collection-gate' ||
    phase === 'prep' ||
    phase === 'dialog' ||
    phase === 'complete';

  return (
    <aside
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} self-start mobile:h-auto mobile:max-h-none`}
      style={{ height: PRIORITY_ENGINE_INTRO_HEIGHT_PX }}
      data-testid="priority-conversation"
      data-conversation-phase={phase}
      data-advancing={isAdvancing ? 'true' : 'false'}
      aria-label="Conis — dialog priorit"
      aria-live="polite"
      aria-busy={isAdvancing}
    >
      {phase === 'instruction' ? (
        <ConisMessage testId="priority-conversation-instruction">
          {PRIORITY_CONVERSATION_INTRO_LINES.map((line) => (
            <p key={line} className={bodyTextClass}>
              {line}
            </p>
          ))}
          <div
            className="mt-2 rounded-[8px] border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2.5"
            data-testid="priority-conversation-start-block"
          >
            {PRIORITY_CONVERSATION_START_LINES.map((line) => (
              <p key={line} className={`${bodyTextClass} text-embed-foreground-primary/90`}>
                {line}
              </p>
            ))}
          </div>
        </ConisMessage>
      ) : null}

      {showTags ? (
        <div className="mb-2.5" data-testid="priority-conversation-tags">
          <ul
            className="flex flex-wrap content-start gap-1.5"
            aria-label="Vaše priority"
          >
            {tags.map((tag) => (
              <li
                key={tag.id}
                data-priority-tag={tag.id}
                data-intensity-percent={tag.percent}
                className="rounded-md border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-2 py-0.5 text-[11px] font-medium leading-tight text-embed-foreground-primary/80"
              >
                {tag.title}
                <span className="ml-1 tabular-nums text-embed-foreground-primary/45">
                  {tag.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {phase === 'collecting' ? (
        <ConisMessage testId="priority-conversation-collecting">
          {PRIORITY_CONVERSATION_COLLECT_LINES.map((line) => (
            <p key={line} className={bodyTextClass}>
              {line}
            </p>
          ))}
          <p className={softTextClass}>{PRIORITY_CONVERSATION_COLLECT_HINT}</p>
        </ConisMessage>
      ) : null}

      {phase === 'collection-gate' ? (
        <ConisMessage testId="priority-conversation-gate">
          {PRIORITY_CONVERSATION_GATE_LINES.map((line) => (
            <p key={line} className={bodyTextClass}>
              {line}
            </p>
          ))}
          <p className={bodyTextClass}>
            {PRIORITY_CONVERSATION_GATE_PROMPT(selectedCount)}
          </p>
          <div className="mt-1 flex flex-col gap-2">
            <button
              type="button"
              data-testid="priority-conversation-finish-selection"
              className={primaryNavClass}
              disabled={isAdvancing}
              onClick={finishSelection}
            >
              {PRIORITY_CONVERSATION_FINISH_SELECTION}
            </button>
            {canAddMore ? (
              <button
                type="button"
                data-testid="priority-conversation-add-more"
                className={secondaryNavClass}
                disabled={isAdvancing}
                onClick={addMorePriorities}
              >
                {PRIORITY_CONVERSATION_ADD_MORE}
              </button>
            ) : null}
          </div>
        </ConisMessage>
      ) : null}

      {phase === 'prep' ? (
        <ConisMessage testId="priority-conversation-prep">
          {PRIORITY_CONVERSATION_PREP_LINES.map((line) => (
            <p key={line} className={bodyTextClass}>
              {line}
            </p>
          ))}
          <button
            type="button"
            data-testid="priority-conversation-prep-continue"
            className={`${primaryNavClass} mt-1`}
            disabled={isAdvancing}
            onClick={acknowledgePrep}
          >
            {PRIORITY_CONVERSATION_PREP_CONTINUE}
          </button>
        </ConisMessage>
      ) : null}

      {phase === 'dialog' && currentQuestion !== null ? (
        <ConisMessage testId="priority-conversation-dialog">
          {isAdvancing && pendingOptionId !== null ? (
            <p
              className={`${bodyTextClass} text-embed-brand-gold`}
              data-testid="priority-conversation-answer-ack"
            >
              {PRIORITY_CONVERSATION_ANSWER_ACK}
            </p>
          ) : null}
          <div className="rounded-[8px] border border-[#D4AF37]/35 bg-[#D4AF37]/10 p-3">
            <p className={`${bodyTextClass} font-medium`}>
              {currentQuestion.prompt}
            </p>
            <div
              className="mt-2.5 flex flex-col gap-2"
              role="radiogroup"
              aria-label={currentQuestion.prompt}
            >
              {currentQuestion.options.map((option) => {
                const isPending = pendingOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isPending}
                    disabled={isAdvancing}
                    data-testid={`priority-dialog-option-${option.id}`}
                    className={`rounded-[8px] border px-3 py-2 text-left text-[13px] leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 disabled:cursor-default ${
                      isPending
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-embed-foreground-primary'
                        : 'border-embed-foreground-primary/15 bg-embed-background-primary/70 text-embed-foreground-primary/85 hover:border-[#D4AF37]/50'
                    }`}
                    onClick={() =>
                      answerQuestion(currentQuestion.priorityId, option.id)
                    }
                  >
                    <span
                      className="mr-2 text-embed-foreground-primary/45"
                      aria-hidden="true"
                    >
                      {isPending ? '●' : '○'}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </ConisMessage>
      ) : null}

      {phase === 'complete' ? (
        <ConisMessage testId="priority-conversation-complete">
          {PRIORITY_CONVERSATION_SUMMARY_LINES.map((line) => (
            <p
              key={line}
              className={bodyTextClass}
              data-testid={
                line === PRIORITY_CONVERSATION_SUMMARY_LINES[0]
                  ? 'priority-conversation-summary'
                  : undefined
              }
            >
              {line}
            </p>
          ))}
          <div
            className="mt-1 rounded-[8px] border border-embed-foreground-primary/12 bg-embed-surface-elevated/80 p-3"
            data-testid="priority-conversation-next-paths"
          >
            <p className={bodyTextClass}>
              {PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT}
            </p>
            <div className="mt-2.5 flex flex-col gap-2">
              <button
                type="button"
                data-testid="priority-conversation-faq"
                className={primaryNavClass}
                onClick={continueToFaq}
              >
                {PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL}
              </button>
              <button
                type="button"
                data-testid="priority-conversation-chat"
                className={secondaryNavClass}
                onClick={askConis}
              >
                {PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL}
              </button>
            </div>
          </div>
          <p
            className="text-[11px] leading-[1.45] text-embed-foreground-primary/50"
            data-testid="priority-conversation-pdf-note"
          >
            {PRIORITY_CONVERSATION_PDF_NOTE}
          </p>
        </ConisMessage>
      ) : null}
    </aside>
  );
}
