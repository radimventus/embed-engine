import {
  PRIORITY_CONVERSATION_ADD_MORE,
  PRIORITY_CONVERSATION_ANSWER_ACK,
  PRIORITY_CONVERSATION_COLLECT_HINT,
  PRIORITY_CONVERSATION_COLLECT_LINES,
  PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL,
  PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL,
  PRIORITY_CONVERSATION_COMPLETE_PANEL_LINE,
  PRIORITY_CONVERSATION_COMPLETE_PANEL_TITLE,
  PRIORITY_CONVERSATION_DIALOG_CONTINUE,
  PRIORITY_CONVERSATION_FINISH_SELECTION,
  PRIORITY_CONVERSATION_GATE_LINES,
  PRIORITY_CONVERSATION_GATE_PROMPT,
  PRIORITY_CONVERSATION_INTRO_LINES,
  PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT,
  PRIORITY_CONVERSATION_PREP_CONTINUE,
  PRIORITY_CONVERSATION_PREP_LINES,
  PRIORITY_CONVERSATION_PREP_TITLE,
  PRIORITY_CONVERSATION_START_HEADING,
  PRIORITY_CONVERSATION_START_LINES,
} from './priorityConversation.constants';
import { PRIORITY_CLARIFICATIONS } from './decision-cards.constants';
import { ConisMessage } from './ConisMessage';
import { ConisThinkingDots } from './ConisThinkingDots';
import { PRIORITY_ENGINE_CONVERSATION_PANEL_CLASS } from './priority-engine-layout';
import { usePriorityConversationContext } from './PriorityConversationProvider';

const bodyTextClass =
  'text-[15px] leading-[1.6] text-embed-foreground-primary';

const leadTextClass =
  'text-[16px] font-medium leading-[1.45] text-embed-foreground-primary';

const titleTextClass =
  'text-[18px] font-semibold leading-[1.35] text-embed-foreground-primary';

const softTextClass =
  'text-[13px] leading-[1.55] text-embed-foreground-primary/65';

const navButtonClass =
  'rounded-[8px] border px-3.5 py-3 text-left text-[15px] font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 disabled:opacity-55';

const primaryNavClass = `${navButtonClass} border-[#D4AF37] bg-[#D4AF37]/15 text-embed-foreground-primary hover:bg-[#D4AF37]/25`;

const secondaryNavClass = `${navButtonClass} border-embed-foreground-primary/20 bg-transparent text-embed-foreground-primary hover:border-[#D4AF37]/50`;

/**
 * Right-panel Conis coaching dialogue (PT-PRIORITY-CONVERSATION-03).
 * Adaptive height — no internal scroll; dialog beats share one message shell.
 */
export function PriorityConversationPanel() {
  const {
    phase,
    dialogBeat,
    selectedCount,
    selectionOrder,
    tags,
    currentQuestion,
    questionIntent,
    interpretation,
    progressPercent,
    canAddMore,
    isAdvancing,
    pendingOptionId,
    finishSelection,
    addMorePriorities,
    acknowledgePrep,
    answerQuestion,
    continueDialog,
    continueToFaq,
    askConis,
  } = usePriorityConversationContext();

  const showTags =
    phase === 'collecting' ||
    phase === 'collection-gate' ||
    phase === 'prep' ||
    phase === 'dialog' ||
    phase === 'complete';

  const clarifications = selectionOrder
    .map((id) => PRIORITY_CLARIFICATIONS[id])
    .filter((line): line is string => typeof line === 'string');

  const showQuestionShell =
    phase === 'dialog' &&
    currentQuestion !== null &&
    (dialogBeat === 'question' || dialogBeat === 'thinking');

  return (
    <aside
      className={PRIORITY_ENGINE_CONVERSATION_PANEL_CLASS}
      data-testid="priority-conversation"
      data-conversation-phase={phase}
      data-dialog-beat={dialogBeat}
      data-progress-percent={progressPercent}
      data-advancing={isAdvancing ? 'true' : 'false'}
      aria-label="Conis — rozhodovací rozhovor"
      aria-live="polite"
      aria-busy={isAdvancing || dialogBeat === 'thinking'}
    >
      <div
        className="mb-3 flex items-center justify-end"
        data-testid="priority-conversation-progress"
        aria-label={`Průběh ${progressPercent} procent`}
      >
        <span className="text-[12px] font-medium tabular-nums tracking-wide text-embed-foreground-primary/45">
          {progressPercent} %
        </span>
      </div>

      {phase === 'instruction' ? (
        <ConisMessage testId="priority-conversation-instruction">
          <p className={leadTextClass}>{PRIORITY_CONVERSATION_INTRO_LINES[0]}</p>
          <p className={leadTextClass}>{PRIORITY_CONVERSATION_INTRO_LINES[1]}</p>
          <p className={bodyTextClass}>{PRIORITY_CONVERSATION_INTRO_LINES[2]}</p>
          <div
            className="mt-1 rounded-[8px] border border-[#D4AF37]/35 bg-[#D4AF37]/12 px-3.5 py-3"
            data-testid="priority-conversation-start-block"
          >
            <p className="mb-1.5 text-[14px] font-semibold tracking-wide text-embed-brand-gold">
              {PRIORITY_CONVERSATION_START_HEADING}
            </p>
            {PRIORITY_CONVERSATION_START_LINES.map((line) => (
              <p
                key={line}
                className={`${bodyTextClass} text-embed-foreground-primary/90`}
              >
                {line}
              </p>
            ))}
          </div>
        </ConisMessage>
      ) : null}

      {showTags ? (
        <div className="mb-3" data-testid="priority-conversation-tags">
          <ul
            className="flex flex-wrap content-start gap-2"
            aria-label="Vaše priority"
          >
            {tags.map((tag) => (
              <li
                key={tag.id}
                data-priority-tag={tag.id}
                data-intensity-percent={tag.percent}
                className="rounded-md border border-[#D4AF37]/55 bg-[#D4AF37]/12 px-2.5 py-1 text-[12px] font-medium leading-tight text-embed-foreground-primary/85"
              >
                {tag.title}
                <span className="ml-1.5 tabular-nums text-embed-foreground-primary/45">
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
          {clarifications.map((line) => (
            <p
              key={line}
              className={`${softTextClass} mt-1 border-l-2 border-[#D4AF37]/40 pl-2.5`}
              data-testid="priority-conversation-clarification"
            >
              {line}
            </p>
          ))}
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
          {clarifications.map((line) => (
            <p
              key={line}
              className={`${softTextClass} border-l-2 border-[#D4AF37]/40 pl-2.5`}
              data-testid="priority-conversation-clarification"
            >
              {line}
            </p>
          ))}
          <div className="mt-2 flex flex-col gap-2.5">
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
          <h3
            className={titleTextClass}
            data-testid="priority-conversation-prep-title"
          >
            {PRIORITY_CONVERSATION_PREP_TITLE}
          </h3>
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

      {phase === 'dialog' ? (
        <ConisMessage testId="priority-conversation-dialog">
          {showQuestionShell && currentQuestion ? (
            <>
              {questionIntent && dialogBeat === 'question' ? (
                <p
                  className={softTextClass}
                  data-testid="priority-conversation-question-intent"
                >
                  {questionIntent}
                </p>
              ) : null}
              <div className="rounded-[10px] border border-[#D4AF37]/40 bg-[#D4AF37]/12 p-3.5 shadow-[0_1px_0_rgba(0,25,48,0.04)]">
                <p className={`${bodyTextClass} font-medium`}>
                  {currentQuestion.prompt}
                </p>
                <div
                  className="mt-3 flex flex-col gap-2.5"
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
                        disabled={dialogBeat !== 'question'}
                        data-testid={`priority-dialog-option-${option.id}`}
                        className={`rounded-[8px] border px-3.5 py-3 text-left text-[15px] leading-snug transition-[border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 disabled:cursor-default ${
                          isPending
                            ? 'border-[#D4AF37] bg-[#D4AF37]/25 text-embed-foreground-primary shadow-[0_0_0_1px_rgba(212,175,55,0.35)]'
                            : 'border-embed-foreground-primary/15 bg-embed-background-primary/75 text-embed-foreground-primary/90 hover:border-[#D4AF37]/55'
                        }`}
                        onClick={() =>
                          answerQuestion(currentQuestion.priorityId, option.id)
                        }
                      >
                        <span
                          className="mr-2.5 text-embed-foreground-primary/45"
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
            </>
          ) : null}

          {dialogBeat === 'thinking' ? (
            <div className="pt-1">
              <ConisThinkingDots />
            </div>
          ) : null}

          {dialogBeat === 'interpretation' && interpretation !== null ? (
            <div data-testid="priority-conversation-interpretation">
              <p
                className={`${leadTextClass} text-embed-brand-gold`}
                data-testid="priority-conversation-answer-ack"
              >
                {PRIORITY_CONVERSATION_ANSWER_ACK}
              </p>
              <p
                className={bodyTextClass}
                data-testid="priority-conversation-interpretation-text"
              >
                {interpretation}
              </p>
              <button
                type="button"
                data-testid="priority-conversation-dialog-continue"
                className={`${primaryNavClass} mt-2`}
                onClick={continueDialog}
              >
                {PRIORITY_CONVERSATION_DIALOG_CONTINUE}
              </button>
            </div>
          ) : null}
        </ConisMessage>
      ) : null}

      {phase === 'complete' ? (
        <ConisMessage testId="priority-conversation-complete">
          <h3
            className={titleTextClass}
            data-testid="priority-conversation-summary"
          >
            {PRIORITY_CONVERSATION_COMPLETE_PANEL_TITLE}
          </h3>
          <p className={bodyTextClass}>
            {PRIORITY_CONVERSATION_COMPLETE_PANEL_LINE}
          </p>
          <div
            className="mt-2 rounded-[10px] border border-embed-foreground-primary/12 bg-embed-surface-elevated/80 p-3.5"
            data-testid="priority-conversation-next-paths"
          >
            <p className={bodyTextClass}>
              {PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT}
            </p>
            <div className="mt-2.5 flex flex-col gap-2.5">
              <button
                type="button"
                data-testid="priority-conversation-faq"
                className={secondaryNavClass}
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
        </ConisMessage>
      ) : null}
    </aside>
  );
}
