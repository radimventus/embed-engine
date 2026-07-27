import { FloorPlan } from './FloorPlan';
import { FloorSelector } from './FloorSelector';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import {
  HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS,
  SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS,
  SPATIAL_TERMINAL_FLOOR_PLAN_SECTION_CLASS,
  SPATIAL_TERMINAL_PLAN_TOGGLE_GAP_CLASS,
  SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS,
} from '../spatial-terminal-layout';

/**
 * Floorplan column.
 * Plan fills width at real aspect; 20 px from menu (pl on this column).
 * Toggle sits on the shared baseline with VIDEO/FOTKY (min 50 px below plan).
 */
export function FloorPlanExplorer() {
  return (
    <section
      id={PILOT_SECTION_IDS.floorPlan}
      tabIndex={-1}
      aria-label="Půdorys"
      className={`scroll-mt-header ${SPATIAL_TERMINAL_FLOOR_PLAN_SECTION_CLASS}`}
    >
      {/* Align plan top with Media Display (same title band as Room Menu). */}
      <div className={SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS} aria-hidden="true">
        <span className="invisible">.</span>
      </div>
      <FloorPlan />
      <div className={SPATIAL_TERMINAL_PLAN_TOGGLE_GAP_CLASS} aria-hidden="true" />
      <div className={`${SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS} justify-center pb-1`}>
        <div className={HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS}>
          <FloorSelector />
        </div>
      </div>
    </section>
  );
}
