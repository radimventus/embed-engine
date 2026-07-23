import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { projectDecisionPresentation } from '../../runtime/projectDecisionPresentation';
import {
  PRIORITY_ENGINE_INTRO_HEIGHT_PX,
  PRIORITY_ENGINE_INTRO_PANEL_CLASS,
} from '../PriorityEngine/priority-engine-layout';
import { DecisionDrivers } from './DecisionDrivers';
import { DecisionStoryPanel } from './DecisionStoryPanel';
import { DecisionSummary } from './DecisionSummary';
import { OutcomeCards } from './OutcomeCards';

/**
 * Decision Terminal — canonical Runtime presentation surface (CSCB-05 / 05A).
 *
 * First view: Summary → Drivers → Trade-offs.
 * Story / Moves remain available via progressive disclosure (Runtime order).
 * Pure projection — no interpretation, ranking, or composition.
 * Height matches two Priority card rows (PT-PRIORITY-REDESIGN-01).
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
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} mobile:h-auto mobile:max-h-none`}
      style={{ height: PRIORITY_ENGINE_INTRO_HEIGHT_PX }}
      data-terminal-id={view.terminalId}
      data-testid="decision-terminal"
      aria-label="Rozhodovací terminál"
    >
      <DecisionSummary summary={view.summary} />
      <DecisionDrivers drivers={view.drivers} />
      <OutcomeCards outcome={view.outcome} />
      <DecisionStoryPanel story={view.story} moves={view.moves} />
    </aside>
  );
}
