import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useActiveDecisionMove } from '../../cognitive/DecisionStoryProvider';
import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

/**
 * Decision Terminal — Experience Surface for the active Decision Story.
 * Renders Strategy output only. No local decision reasoning.
 */
export function DecisionTerminal() {
  const applySignal = useApplyCognitiveSignal();
  const { story, definition, outcome, activeMoveId } = useActiveDecisionMove();

  if (outcome) {
    return (
      <aside
        aria-label="Decision Terminal"
        className={PRIORITY_ENGINE_INTRO_PANEL_CLASS}
        data-testid="decision-terminal"
        data-outcome={outcome.status}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
          Decision outcome
        </p>
        <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
          {outcome.status.replace('-', ' ')}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
          {outcome.summary}
        </p>
      </aside>
    );
  }

  if (story === null || definition === null || activeMoveId === null) {
    return (
      <aside
        aria-label="Decision Terminal"
        className={PRIORITY_ENGINE_INTRO_PANEL_CLASS}
        data-testid="decision-terminal"
        data-empty="true"
      >
        <p className="text-sm font-medium leading-relaxed text-embed-foreground-primary">
          Decision Terminal
        </p>
        <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/70">
          Select <span className="font-semibold text-embed-brand-gold">Dispozice</span> in
          Priority to start the Layout decision dialogue.
        </p>
      </aside>
    );
  }

  const exploreToComplete =
    activeMoveId === 'layout.discover-day-zone' ||
    activeMoveId === 'layout.discover-night-zone';

  const completedCount = story.slots.filter((slot) => slot.status === 'completed').length;

  return (
    <aside
      aria-label="Decision Terminal"
      className={PRIORITY_ENGINE_INTRO_PANEL_CLASS}
      data-testid="decision-terminal"
      data-active-move={activeMoveId}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Decision Terminal · Move {completedCount + 1}/{story.slots.length}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-embed-foreground-primary/45">
        {definition.intent}
      </p>
      <p className="mt-2 text-sm font-medium text-embed-foreground-primary">{definition.purpose}</p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
        {definition.advisorPrompt}
      </p>
      {definition.tradeOff ? (
        <p className="mt-3 text-xs leading-relaxed text-embed-foreground-primary/55">
          Trade-off: {definition.tradeOff}
        </p>
      ) : null}
      {exploreToComplete ? (
        <p className="mt-4 text-xs text-embed-brand-gold/90">
          Explore the house (room or floor) to complete this move.
        </p>
      ) : (
        <button
          type="button"
          className="mt-4 rounded-[8px] border border-embed-brand-gold/40 bg-embed-brand-gold/10 px-3 py-2 text-xs font-semibold text-embed-foreground-primary hover:bg-embed-brand-gold/20"
          data-testid="decision-terminal-complete"
          onClick={() => {
            applyQuestionOpened(
              applySignal,
              activeMoveId,
              `Move acknowledged: ${definition.purpose}`,
            );
          }}
        >
          Acknowledge & continue
        </button>
      )}
    </aside>
  );
}
