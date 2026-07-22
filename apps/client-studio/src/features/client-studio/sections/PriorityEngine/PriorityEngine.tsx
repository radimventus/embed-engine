import { DecisionReport } from '../DecisionReport/DecisionReport';
import { DecisionReportPreview } from '../DecisionReportPreview/DecisionReportPreview';
import { DecisionTerminal } from '../DecisionTerminal/DecisionTerminal';
import { PILOT_SECTION_IDS, PILOT_TERMS } from '../../pilot/pilotVocabulary';
import {
  PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS,
  PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS,
  PRIORITY_ENGINE_SHOW_DECISION_REPORT,
  PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL,
} from './priority-engine-layout';
import { PriorityCards } from './PriorityCards';
import { usePriorityExperience } from './PriorityExperienceProvider';
import { RecommendationPanel } from './RecommendationPanel';
import { SectionHeader } from './SectionHeader';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/**
 * Priority Engine — Decision Discovery surface (CSCB-04).
 * Cards emit ChangePriority Decision Signals into Runtime.
 * Terminal / Report read Runtime Context only (projection peers; not CSCB-04 scope).
 */
export function PriorityEngine() {
  const {
    cards,
    categories,
    setImportance,
    toggleCard,
    minimumMet,
  } = usePriorityExperience();
  const { experience } = useDecisionSessionRuntime();
  const terminalId = experience.context.decision.terminal.id;

  return (
    <section
      id={PILOT_SECTION_IDS.priority}
      tabIndex={-1}
      aria-label={`${PILOT_TERMS.priority} Experience`}
      data-testid="priority-experience"
      data-terminal-id={terminalId}
      data-minimum-met={minimumMet ? 'true' : 'false'}
      className={`relative scroll-mt-header ${SECTION_SURFACE_CLASS} ${PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS} ${PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS}`}
    >
      <SectionHeader />
      <div className="grid grid-cols-[52fr_48fr] items-stretch gap-section mobile:grid-cols-1">
        <PriorityCards
          cards={cards}
          categories={categories}
          setImportance={setImportance}
          toggleCard={toggleCard}
        />
        <DecisionTerminal />
      </div>
      <DecisionReport />
      {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? <RecommendationPanel /> : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? <DecisionReportPreview /> : null}
    </section>
  );
}
