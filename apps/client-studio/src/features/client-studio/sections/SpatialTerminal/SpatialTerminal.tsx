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
 * Spatial Terminal shell (CSCB-03 / TOUR-27).
 * Section height is driven by the floorplan column (real aspect × available width).
 */
export function SpatialTerminal() {
  return (
    <div
      id={PILOT_SECTION_IDS.walkthrough}
      tabIndex={-1}
      className={`scroll-mt-header grid w-full min-w-0 items-stretch gap-0 ${SECTION_SURFACE_CLASS} max-[1279px]:grid-cols-1 max-[1279px]:divide-y max-[1279px]:divide-embed-border-default mobile:grid-cols-1 mobile:divide-y mobile:divide-embed-border-default [&>[aria-label='Seznam místností']]:border-r [&>[aria-label='Seznam místností']]:border-embed-border-default max-[1279px]:[&>[aria-label='Seznam místností']]:border-r-0 mobile:[&>[aria-label='Seznam místností']]:border-r-0`}
      style={{
        gridTemplateColumns: `${SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX}px ${SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX}px ${SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX}px`,
      }}
    >
      <MediaExplorer />
      <RoomIndex />
      <FloorPlanExplorer />
    </div>
  );
}
