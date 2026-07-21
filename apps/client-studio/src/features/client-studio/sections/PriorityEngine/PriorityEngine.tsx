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

/**
 * Priority Engine — renders Priority UI + Experience-only semantic surfaces.
 * Pipeline owned by PriorityExperienceProvider.
 */
export function PriorityEngine() {
  const {
    cards,
    categories,
    setImportance,
    toggleCard,
    interpretation,
    experience,
  } = usePriorityExperience();

  return (
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
        <RecommendationPanel experience={experience} />
      ) : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? (
        <DecisionReportPreview experience={experience} />
      ) : null}
    </section>
  );
}
