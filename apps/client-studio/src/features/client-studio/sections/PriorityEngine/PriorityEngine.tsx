import type { Runtime } from '@embed-engine/core';

import { DecisionReportPreview } from '../DecisionReportPreview/DecisionReportPreview';
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

type PriorityEngineProps = {
  runtime: Runtime;
};

export function PriorityEngine({ runtime }: PriorityEngineProps) {
  return (
    <section
      aria-label="Priority Engine"
      className={`relative ${SECTION_SURFACE_CLASS} ${PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS} ${PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS}`}
    >
      <SectionHeader />
      <div className="grid grid-cols-[52fr_48fr] items-stretch gap-section mobile:grid-cols-1">
        <PriorityCards runtime={runtime} />
        <IntroText />
      </div>
      {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? <RecommendationPanel /> : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? <DecisionReportPreview /> : null}
    </section>
  );
}
