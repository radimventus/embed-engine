import { DecisionTerminal } from '../DecisionTerminal/DecisionTerminal';
import { DecisionReportPreview } from '../DecisionReportPreview/DecisionReportPreview';
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
import { usePriorityExperience } from './usePriorityExperience';

/**
 * Priority Experience MVP (S-003) — Interpretation peer + Decision Terminal.
 * Session snapshot only; Signals for cognitive intent.
 */
export function PriorityEngine() {
  const { status } = usePriorityExperience();

  return (
    <section
      aria-label="Priority Experience"
      aria-busy={status === 'loading'}
      data-testid="priority-experience"
      data-priority-status={status}
      className={`relative ${SECTION_SURFACE_CLASS} ${PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS} ${PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS}`}
    >
      <SectionHeader />
      <div className="grid grid-cols-[52fr_48fr] items-start gap-section mobile:grid-cols-1">
        <PriorityCards />
        <DecisionTerminal />
      </div>
      {PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL ? <RecommendationPanel /> : null}
      {PRIORITY_ENGINE_SHOW_DECISION_REPORT ? <DecisionReportPreview /> : null}
    </section>
  );
}
