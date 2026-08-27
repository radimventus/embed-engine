import { FloorPlanExplorer } from '../HouseNavigator/FloorPlanExplorer';
import { MediaExplorer } from '../MediaExplorer/MediaExplorer';
import { RoomIndex } from '../HouseNavigator/RoomIndex';
import {
  SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX,
  SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX,
  SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX,
} from '../../chapter-layout';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';

/**
 * Spatial Terminal shell (CSCB-03 / TOUR-27 / RCS-03).
 * Desktop keeps fixed three-column SSOT; below desktop stacks without horizontal scroll.
 * Section height is driven by the floorplan column (real aspect × available width).
 */
export function SpatialTerminal() {
  return (
    <div
      id={PILOT_SECTION_IDS.walkthrough}
      tabIndex={-1}
      className={`scroll-mt-header grid w-full min-w-0 items-stretch gap-0 overflow-x-hidden mobile:content-start mobile:items-start ${SECTION_SURFACE_CLASS} grid-cols-1 mobile:px-0 divide-y divide-embed-border-default tabletMin:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] tabletMin:divide-y-0 tabletMax:!grid-cols-[minmax(0,1.55fr)_minmax(12rem,0.55fr)_minmax(0,1fr)] tabletMax:!divide-y-0 desktop:grid-cols-[var(--spatial-terminal-cols)] desktop:divide-y-0 [&>[aria-label='Seznam místností']]:border-embed-border-default desktop:[&>[aria-label='Seznam místností']]:border-r mobile:[&>[aria-label='Seznam místností']]:border-r-0`}
      style={{
        ['--spatial-terminal-cols' as string]: `${SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX}px ${SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX}px ${SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX}px`,
      }}
    >
      <MediaExplorer />
      <RoomIndex />
      <FloorPlanExplorer />
    </div>
  );
}
