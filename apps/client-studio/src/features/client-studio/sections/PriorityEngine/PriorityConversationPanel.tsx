import {
  PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL,
  PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL,
  PRIORITY_CONVERSATION_INSTRUCTION,
  PRIORITY_CONVERSATION_PDF_NOTE,
  priorityTitleForId,
} from './priorityConversation.constants';
import {
  PRIORITY_ENGINE_INTRO_HEIGHT_PX,
  PRIORITY_ENGINE_INTRO_PANEL_CLASS,
} from './priority-engine-layout';
import { usePriorityConversation } from './usePriorityConversation';

/**
 * Right-panel Conis conversation — sole Priority communication channel
 * (PT-PRIORITY-DESIGN-02). Reuses Decision Terminal shell dimensions only.
 */
export function PriorityConversationPanel() {
  const {
    phase,
    selectionOrder,
    currentQuestion,
    answerQuestion,
    continueToFaq,
    askConis,
  } = usePriorityConversation();

  return (
    <aside
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} mobile:h-auto mobile:max-h-none`}
      style={{ height: PRIORITY_ENGINE_INTRO_HEIGHT_PX }}
      data-testid="priority-conversation"
      data-conversation-phase={phase}
      aria-label="Conis — dialog priorit"
      aria-live="polite"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Conis
      </p>

      {phase === 'instruction' ? (
        <p
          className="mt-3 text-sm leading-relaxed text-embed-foreground-primary"
          data-testid="priority-conversation-instruction"
        >
          {PRIORITY_CONVERSATION_INSTRUCTION}
        </p>
      ) : null}

      {phase === 'confirmation' || phase === 'dialog' || phase === 'complete' ? (
        <div className="mt-3" data-testid="priority-conversation-tags">
          <ul className="flex flex-wrap gap-2" aria-label="Vybrané priority">
            {selectionOrder.map((id) => (
              <li
                key={id}
                data-priority-tag={id}
                className="rounded-[8px] border border-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 text-xs font-medium text-embed-foreground-primary"
              >
                {priorityTitleForId(id)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {phase === 'dialog' && currentQuestion !== null ? (
        <div className="mt-4" data-testid="priority-conversation-dialog">
          <p className="text-sm font-medium text-embed-foreground-primary">
            {currentQuestion.prompt}
          </p>
          <div
            className="mt-3 flex flex-col gap-2"
            role="radiogroup"
            aria-label={currentQuestion.prompt}
          >
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={false}
                data-testid={`priority-dialog-option-${option.id}`}
                className="rounded-[8px] border border-embed-foreground-primary/15 bg-transparent px-3 py-2 text-left text-sm text-embed-foreground-primary/85 transition-colors hover:border-[#D4AF37]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35"
                onClick={() =>
                  answerQuestion(currentQuestion.priorityId, option.id)
                }
              >
                <span className="mr-2 text-embed-foreground-primary/45" aria-hidden="true">
                  ○
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === 'complete' ? (
        <div className="mt-4 flex flex-col gap-3" data-testid="priority-conversation-complete">
          <p className="text-sm text-embed-foreground-primary">
            Děkuji. Máte dvě cesty dál.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              data-testid="priority-conversation-faq"
              className="rounded-[8px] border border-[#D4AF37] bg-[#D4AF37]/15 px-3 py-2 text-left text-sm font-medium text-embed-foreground-primary transition-colors hover:bg-[#D4AF37]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35"
              onClick={continueToFaq}
            >
              {PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL}
            </button>
            <button
              type="button"
              data-testid="priority-conversation-chat"
              className="rounded-[8px] border border-embed-foreground-primary/20 bg-transparent px-3 py-2 text-left text-sm font-medium text-embed-foreground-primary transition-colors hover:border-[#D4AF37]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35"
              onClick={askConis}
            >
              {PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL}
            </button>
          </div>
          <p
            className="text-[11px] leading-relaxed text-embed-foreground-primary/50"
            data-testid="priority-conversation-pdf-note"
          >
            {PRIORITY_CONVERSATION_PDF_NOTE}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
