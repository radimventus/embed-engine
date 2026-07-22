import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { projectDecisionPresentation } from '../../runtime/projectDecisionPresentation';
import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';
import { DecisionDrivers } from './DecisionDrivers';
import { DecisionStoryPanel } from './DecisionStoryPanel';
import { DecisionSummary } from './DecisionSummary';
import { OutcomeCards } from './OutcomeCards';

/**
 * Decision Terminal — canonical Runtime presentation surface (CSCB-05).
 *
 * Answers: given exploration + priorities, what should you pay attention to?
 * Pure projection of Runtime Context — no interpretation, ranking, or composition.
 */
export function DecisionTerminal() {
  const { experience } = useDecisionSessionRuntime();
  const decision = experience.context.decision;
  const view = projectDecisionPresentation({
    terminal: decision.terminal,
    story: decision.story,
    moves: decision.moves,
    focus: decision.focus,
    priorityIds: decision.priorityIds,
  });

  return (
    <aside
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} max-h-[70vh] overflow-y-auto mobile:max-h-none`}
      data-terminal-id={view.terminalId}
      data-testid="decision-terminal"
      aria-label="Rozhodovací terminál"
    >
      <DecisionSummary summary={view.summary} />
      <DecisionStoryPanel story={view.story} moves={view.moves} />
      <DecisionDrivers drivers={view.drivers} />
      <OutcomeCards outcome={view.outcome} />
    </aside>
  );
}
