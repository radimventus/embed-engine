import { FloorPlan } from './FloorPlan';
import { FloorSelector } from './FloorSelector';
import { SectionHeader } from './SectionHeader';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import {
  HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS,
  SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS,
  SPATIAL_TERMINAL_FLOOR_PLAN_SECTION_CLASS,
  SPATIAL_TERMINAL_THUMBNAIL_ROW_CLASS,
} from '../spatial-terminal-layout';

export function FloorPlanExplorer() {
  return (
    <section
      id={PILOT_SECTION_IDS.floorPlan}
      tabIndex={-1}
      aria-label="Půdorys"
      className={`scroll-mt-header ${SPATIAL_TERMINAL_FLOOR_PLAN_SECTION_CLASS}`}
    >
      <div className="relative flex min-h-0 flex-col justify-end">
        <SectionHeader className="pointer-events-none absolute inset-x-0 top-0 z-10" />
        <FloorPlan />
      </div>
      <div className={`flex ${SPATIAL_TERMINAL_THUMBNAIL_ROW_CLASS} flex-col justify-end`}>
        <div className={`${SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS} justify-center`}>
          <div className={HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS}>
            <FloorSelector />
          </div>
        </div>
      </div>
    </section>
  );
}
