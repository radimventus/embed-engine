import { DecisionReportPreview } from '../DecisionReportPreview/DecisionReportPreview';
import { IntroText } from './IntroText';
import {
  PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS,
  PRIORITY_ENGINE_SHOW_DECISION_REPORT,
  PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL,
} from './priority-engine-layout';
import { PriorityCards } from './PriorityCards';
import { RecommendationPanel } from './RecommendationPanel';
import { SectionHeader } from './SectionHeader';

export function PriorityEngine() {
  return (
    <section
      aria-label="Priority Engine"
      className={`relative border-b border-embed-border-default px-section ${PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS}`}
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
