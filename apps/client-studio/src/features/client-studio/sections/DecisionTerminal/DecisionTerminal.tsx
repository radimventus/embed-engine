import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { projectDecisionPresentation } from '../../runtime/projectDecisionPresentation';
import {
  PRIORITY_ENGINE_INTRO_HEIGHT_PX,
  PRIORITY_ENGINE_INTRO_PANEL_CLASS,
} from '../PriorityEngine/priority-engine-layout';
import { PriorityDecisionStoryPanel } from '../PriorityEngine/PriorityDecisionStoryPanel';
import { DecisionDrivers } from './DecisionDrivers';
import { DecisionStoryPanel } from './DecisionStoryPanel';
import { DecisionSummary } from './DecisionSummary';
import { OutcomeCards } from './OutcomeCards';

/**
 * Decision Terminal — canonical Runtime presentation surface (CSCB-05 / 05A / PT-001).
 *
 * PT-001: Priority Decision Story projection is always visible so priority changes
 * are immediately obvious. Story / Moves remain via progressive disclosure.
 * Pure projection — no interpretation, ranking, or composition.
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
      data-priority-ids={decision.priorityIds.join(',')}
      aria-label="Rozhodovací terminál"
    >
      <PriorityDecisionStoryPanel />
      <DecisionSummary summary={view.summary} />
      <DecisionDrivers drivers={view.drivers} />
      <OutcomeCards outcome={view.outcome} />
      <DecisionStoryPanel story={view.story} moves={view.moves} />
    </aside>
  );
}
