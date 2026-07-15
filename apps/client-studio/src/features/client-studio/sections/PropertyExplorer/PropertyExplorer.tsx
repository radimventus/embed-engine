import { FloorPlanExplorer } from '../HouseNavigator/FloorPlanExplorer';
import { MediaExplorer } from '../MediaExplorer/MediaExplorer';
import { RoomIndex } from '../HouseNavigator/RoomIndex';

export function PropertyExplorer() {
  return (
    <div
      id="walkthrough"
      tabIndex={-1}
      className="scroll-mt-header grid min-w-0 grid-cols-[65fr_35fr] items-stretch divide-x divide-embed-border-default overflow-x-hidden border-b border-embed-border-default mobile:grid-cols-1 mobile:divide-x-0 mobile:divide-y"
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,50fr)_minmax(120px,15fr)] items-stretch divide-x divide-embed-border-default mobile:grid-cols-1 mobile:divide-x-0 mobile:divide-y">
        <MediaExplorer />
        <RoomIndex />
      </div>
      <FloorPlanExplorer />
    </div>
  );
}
