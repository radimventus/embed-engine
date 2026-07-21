import { FloorPlanExplorer } from '../HouseNavigator/FloorPlanExplorer';
import { MediaExplorer } from '../MediaExplorer/MediaExplorer';
import { RoomIndex } from '../HouseNavigator/RoomIndex';
import {
  SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX,
  SPATIAL_TERMINAL_MEDIA_COLUMN_WIDTH_PX,
  SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX,
} from '../../chapter-layout';
import { SECTION_SURFACE_CLASS } from '../../section-surface';

export function PropertyExplorer() {
  return (
    <div
      id="walkthrough"
      tabIndex={-1}
      className={`scroll-mt-header grid min-h-spatial-terminal-surface w-full min-w-0 items-stretch gap-0 ${SECTION_SURFACE_CLASS} mobile:grid-cols-1 mobile:divide-y mobile:divide-embed-border-default [&>[aria-label='Seznam místností']]:border-r [&>[aria-label='Seznam místností']]:border-embed-border-default mobile:[&>[aria-label='Seznam místností']]:border-r-0`}
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
