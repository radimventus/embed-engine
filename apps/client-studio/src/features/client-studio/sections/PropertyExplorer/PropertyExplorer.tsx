import { HouseNavigator } from '../HouseNavigator/HouseNavigator';
import { MediaExplorer } from '../MediaExplorer/MediaExplorer';

export function PropertyExplorer() {
  return (
    <div className="grid grid-cols-[11fr_10fr] divide-x divide-embed-border-default border-b border-embed-border-default">
      <MediaExplorer />
      <HouseNavigator />
    </div>
  );
}
