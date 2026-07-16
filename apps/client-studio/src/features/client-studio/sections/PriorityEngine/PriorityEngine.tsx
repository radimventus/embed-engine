import { DecisionReportPreview } from '../DecisionReportPreview/DecisionReportPreview';
import { IntroText } from './IntroText';
import {
  PRIORITY_ENGINE_INTRO_OFFSET_CLASS,
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
      className="border-b border-embed-border-default px-section pb-section"
    >
      <SectionHeader />
      <div className="grid min-h-[18rem] grid-cols-[52fr_48fr] items-start gap-section mobile:grid-cols-1">
        <PriorityCards />
        <div className={`self-start ${PRIORITY_ENGINE_INTRO_OFFSET_CLASS}`}>
          <IntroText />
        </div>
      </div>
      {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? <RecommendationPanel /> : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? <DecisionReportPreview /> : null}
    </section>
  );
}
