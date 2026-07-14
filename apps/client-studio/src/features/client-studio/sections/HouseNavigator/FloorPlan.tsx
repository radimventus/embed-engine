import { CircularPlaceholder } from './CircularPlaceholder';

export function FloorPlan() {
  return (
    <div className="relative flex min-h-96 flex-1 items-center justify-center border border-embed-border-default bg-embed-status-warning/15">
      <div className="absolute bottom-4 left-4">
        <CircularPlaceholder />
      </div>
      <p className="text-sm text-embed-foreground-secondary md:text-base">pole s půdorysem</p>
    </div>
  );
}
