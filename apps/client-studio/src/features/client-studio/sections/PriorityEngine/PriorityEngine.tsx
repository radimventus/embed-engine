import { useMemo } from 'react';
import {
  composeExperience,
  type PriorityId,
  type PrioritySelection,
} from '@embed-engine/core/experience';

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
import { RecommendationPanel } from './RecommendationPanel';
import { SectionHeader } from './SectionHeader';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { useDecisionCards } from './useDecisionCards';

const PILOT_OBJECT_ID = 'house-modern-01';

/**
 * Priority Engine — PrioritySelection → ExperienceComposer → Experience → Terminal.
 */
export function PriorityEngine() {
  const { cards, categories, setImportance, toggleCard } = useDecisionCards();

  const priorities = useMemo((): PrioritySelection => {
    const selected = Object.entries(cards)
      .filter(([, card]) => card.selected)
      .map(([id]) => id as PriorityId);

    return Object.freeze({
      selected: Object.freeze(selected),
    });
  }, [cards]);

  const experience = useMemo(
    () =>
      composeExperience({
        object: { id: PILOT_OBJECT_ID },
        priorities,
      }),
    [priorities],
  );

  return (
    <section
      id={PILOT_SECTION_IDS.priority}
      tabIndex={-1}
      aria-label={`${PILOT_TERMS.priority} Experience`}
      data-testid="priority-experience"
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
      {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? <RecommendationPanel /> : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? <DecisionReportPreview /> : null}
    </section>
  );
}
