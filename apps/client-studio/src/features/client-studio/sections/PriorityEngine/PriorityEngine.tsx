import {
  DecisionReport,
} from '../DecisionReport/DecisionReport';
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
import { PrioritySelectionProvider } from './PrioritySelectionContext';
import { RecommendationPanel } from './RecommendationPanel';
import { SectionHeader } from './SectionHeader';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { useDecisionCards } from './useDecisionCards';
import { usePriorityReactiveExperience } from './usePriorityReactiveExperience';

/**
 * Priority Engine — reactive Interpretation pipeline:
 * PrioritySelection → DecisionContext → Interpretation → Experience
 * → DecisionTerminal + DecisionReport (same Experience, two renderers).
 */
export function PriorityEngine() {
  const { cards, categories, setImportance, toggleCard } = useDecisionCards();
  const { priorities, interpretation, experience } =
    usePriorityReactiveExperience(cards);

  return (
    <PrioritySelectionProvider value={priorities}>
      <section
        id={PILOT_SECTION_IDS.priority}
        tabIndex={-1}
        aria-label={`${PILOT_TERMS.priority} Experience`}
        data-testid="priority-experience"
        data-interpretation-id={interpretation.id}
        data-experience-id={experience.id}
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
          <DecisionTerminal experience={experience} />
        </div>
        <DecisionReport experience={experience} />
        {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? (
          <RecommendationPanel />
        ) : null}
        {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? (
          <DecisionReportPreview />
        ) : null}
      </section>
    </PrioritySelectionProvider>
  );
}
