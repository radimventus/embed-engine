import type { ReactNode } from 'react';

import { palette } from '@embed-engine/design-tokens';

import {
  PRIORITY_CONVERSATION_ADD_MORE,
  PRIORITY_CONVERSATION_ANSWER_ACK,
  PRIORITY_CONVERSATION_COLLECT_HINT,
  PRIORITY_CONVERSATION_COLLECT_LINES,
  PRIORITY_CONVERSATION_COMPLETE_PANEL_LINE,
  PRIORITY_CONVERSATION_COMPLETE_PANEL_TITLE,
  PRIORITY_CONVERSATION_FINISH_SELECTION,
  PRIORITY_CONVERSATION_GATE_LINES,
  PRIORITY_CONVERSATION_GATE_PROMPT,
  PRIORITY_CONVERSATION_INTRO_LINES,
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

/** Match Tour VIDEO/FOTKY — palette SSOT (CAP UX 29 / 52). */
const SWITCH_SHELL_BG = palette.lightGray;
const SWITCH_ACTIVE_BG = palette.warmGray;
const SWITCH_IDLE_BG = palette.navy;
const SWITCH_IDLE_TEXT = palette.pureWhite;
const SWITCH_HOVER_BG = palette.gold;
const SWITCH_HOVER_TEXT = palette.navy;
const SWITCH_ACTIVE_TEXT = palette.navy;
/** Idle segment — inline; Delivery CSS isolation zeros button border-radius. */
const SWITCH_IDLE_RADIUS_PX = 4.8;
const SWITCH_FONT_SIZE_PX = 12.5;
const SWITCH_FONT_WEIGHT = 600;

/** Quiz popup scrim — page light gray at full opacity. */
const QUIZ_POPUP_SCRIM = palette.warmWhite;
const QUIZ_THINKING_SCRIM = `${palette.lightGray}8C`;

type PriorityWhiteActionProps = {
  testId: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

/** Navy idle segment / CTA — Tour-aligned; white hover; no solo border (CAP UX 52). */
function PriorityWhiteActionButton({
  testId,
  label,
  onClick,
  disabled,
}: PriorityWhiteActionProps) {
  return (
    <button
      type="button"
      data-testid={testId}
      className="min-w-0 flex-1 touch-manipulation px-2 py-[6.4px] text-center font-medium leading-normal tracking-wide disabled:opacity-55"
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
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = SWITCH_HOVER_BG;
        event.currentTarget.style.color = SWITCH_HOVER_TEXT;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = SWITCH_IDLE_BG;
        event.currentTarget.style.color = SWITCH_IDLE_TEXT;
      }}
    >
      {label}
    </button>
  );
}

/** Tour-style gray track hosting label + white action (or white action alone). */
function PrioritySwitchTrack({
  children,
  ariaLabel,
  className = 'mt-3',
  shift = null,
}: {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  /** Pixel shift from natural centered placement. */
  shift?: { readonly x: number; readonly y: number } | null;
}) {
  return (
    <div
      className={`${className} flex w-full justify-center`}
      style={
        shift
          ? { marginLeft: shift.x, marginTop: shift.y }
          : undefined
      }
    >
      <div
        className="flex w-1/2 min-w-0 shrink-0 items-stretch gap-[1.6px] rounded-[6.4px] border border-solid p-[1.6px]"
        style={{
          backgroundColor: SWITCH_SHELL_BG,
          borderColor: SWITCH_SHELL_BG,
        }}
        role={ariaLabel ? 'group' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}

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
    acknowledgePrep,
    answerQuestion,
    continueDialog,
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
    (dialogBeat === 'question' ||
      dialogBeat === 'thinking' ||
      dialogBeat === 'interpretation');

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
        className="pointer-events-none absolute right-section top-0 z-10 flex items-center justify-end"
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
          <p className={bodyTextClass}>{PRIORITY_CONVERSATION_INTRO_LINES[1]}</p>
          <div
            className="mt-1 rounded-[8px] border border-[#E3E3E3] bg-[#F7F6F4] px-3.5 py-3"
            data-testid="priority-conversation-start-block"
          >
            <p className="mb-1.5 text-[14px] font-semibold tracking-wide text-embed-brand-gold">
              {PRIORITY_CONVERSATION_START_HEADING}
            </p>
            {PRIORITY_CONVERSATION_START_LINES.map((line, index) => {
              const isCardInstruction =
                index === PRIORITY_CONVERSATION_START_LINES.length - 1;
              return (
                <p
                  key={line}
                  className={`${bodyTextClass} text-embed-foreground-primary/90 ${
                    isCardInstruction ? 'font-bold' : ''
                  }`}
                >
                  {line}
                </p>
              );
            })}
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
                className="rounded-md border border-[#E3E3E3] bg-[#F7F6F4] px-2.5 py-1 text-[12px] font-medium leading-tight text-embed-foreground-primary/85"
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
          <PrioritySwitchTrack
            ariaLabel="Nastavení priorit"
            shift={{ x: -40, y: 40 }}
          >
            {canAddMore ? (
              <span
                data-testid="priority-conversation-add-more"
                className="flex min-w-0 flex-1 items-center justify-center px-2 py-[6.4px] text-center font-medium leading-normal tracking-wide"
                style={{
                  backgroundColor: SWITCH_ACTIVE_BG,
                  color: SWITCH_ACTIVE_TEXT,
                  fontSize: SWITCH_FONT_SIZE_PX,
                  fontWeight: SWITCH_FONT_WEIGHT,
                  borderRadius: 0,
                }}
              >
                {PRIORITY_CONVERSATION_ADD_MORE}
              </span>
            ) : null}
            <PriorityWhiteActionButton
              testId="priority-conversation-finish-selection"
              label={PRIORITY_CONVERSATION_FINISH_SELECTION}
              onClick={finishSelection}
              disabled={isAdvancing}
            />
          </PrioritySwitchTrack>
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
          <PrioritySwitchTrack shift={{ x: -40, y: 40 }}>
            <PriorityWhiteActionButton
              testId="priority-conversation-prep-continue"
              label={PRIORITY_CONVERSATION_PREP_CONTINUE}
              onClick={acknowledgePrep}
              disabled={isAdvancing}
            />
          </PrioritySwitchTrack>
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
              <div
                className="relative overflow-hidden rounded-[10px] border border-[#E3E3E3] bg-[#F7F6F4] p-3.5 shadow-[0_1px_0_rgba(0,25,48,0.04)]"
                style={
                  dialogBeat === 'interpretation' || dialogBeat === 'thinking'
                    ? { marginRight: 80 }
                    : undefined
                }
              >
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
                        className="rounded-[10px] px-3.5 py-3 text-left text-[15px] leading-snug transition-[background-color,color] duration-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 disabled:cursor-default"
                        style={
                          isPending
                            ? {
                                backgroundColor: palette.warmGray,
                                color: palette.navy,
                                borderStyle: 'none',
                                borderWidth: 0,
                                borderRadius: 10,
                              }
                            : {
                                backgroundColor: palette.navy,
                                color: palette.pureWhite,
                                borderStyle: 'none',
                                borderWidth: 0,
                                borderRadius: 10,
                              }
                        }
                        onMouseEnter={(event) => {
                          if (dialogBeat !== 'question' || isPending) {
                            return;
                          }
                          event.currentTarget.style.backgroundColor =
                            palette.gold;
                          event.currentTarget.style.color = palette.navy;
                        }}
                        onMouseLeave={(event) => {
                          if (isPending) {
                            return;
                          }
                          event.currentTarget.style.backgroundColor =
                            palette.navy;
                          event.currentTarget.style.color = palette.pureWhite;
                        }}
                        onClick={() =>
                          answerQuestion(currentQuestion.priorityId, option.id)
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {dialogBeat === 'thinking' ? (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: QUIZ_THINKING_SCRIM }}
                    aria-live="polite"
                  >
                    <ConisThinkingDots />
                  </div>
                ) : null}

                {dialogBeat === 'interpretation' && interpretation !== null ? (
                  <div
                    className="absolute inset-0 z-10 flex flex-col justify-between gap-3 rounded-[10px] p-3.5"
                    style={{ backgroundColor: QUIZ_POPUP_SCRIM }}
                    data-testid="priority-conversation-interpretation"
                  >
                    <div className="space-y-2 pt-1">
                      <p
                        className="text-[16px] font-medium leading-[1.45]"
                        style={{ color: palette.navy }}
                        data-testid="priority-conversation-answer-ack"
                      >
                        {PRIORITY_CONVERSATION_ANSWER_ACK}
                      </p>
                      <p
                        className="text-[15px] leading-[1.6]"
                        style={{ color: palette.navy }}
                        data-testid="priority-conversation-interpretation-text"
                      >
                        {interpretation}
                      </p>
                    </div>
                    <div className="mt-1 flex w-full justify-center">
                      <div className="w-1/2 min-w-0">
                        <PriorityWhiteActionButton
                          testId="priority-conversation-dialog-continue"
                          label={PRIORITY_CONVERSATION_PREP_CONTINUE}
                          onClick={continueDialog}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
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
        </ConisMessage>
      ) : null}
    </aside>
  );
}
