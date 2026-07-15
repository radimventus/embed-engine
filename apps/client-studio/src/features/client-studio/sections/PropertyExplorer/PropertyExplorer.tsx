import { FloorPlanExplorer } from '../HouseNavigator/FloorPlanExplorer';
import { MediaExplorer } from '../MediaExplorer/MediaExplorer';
import { RoomIndex } from '../HouseNavigator/RoomIndex';

export function PropertyExplorer() {
  return (
    <div className="grid min-h-property-explorer grid-cols-[minmax(0,50%)_minmax(120px,15%)_minmax(0,35%)] items-stretch divide-x divide-embed-border-default border-b border-embed-border-default mobile:grid-cols-1 mobile:divide-x-0 mobile:divide-y">
      <MediaExplorer />
      <RoomIndex />
      <FloorPlanExplorer />
    </div>
  );
}
