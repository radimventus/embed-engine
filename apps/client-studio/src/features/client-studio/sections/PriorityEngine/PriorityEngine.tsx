import { DecisionReportPreview } from '../DecisionReportPreview/DecisionReportPreview';
import { PILOT_SECTION_IDS, PILOT_TERMS } from '../../pilot/pilotVocabulary';
import { IntroText } from './IntroText';
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

/**
 * Priority Engine — approved Client Studio baseline (MVP v1.0).
 * Cards + IntroText; no Decision Terminal.
 */
export function PriorityEngine() {
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
        <PriorityCards />
        <IntroText />
      </div>
      {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? <RecommendationPanel /> : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? <DecisionReportPreview /> : null}
    </section>
  );
}
