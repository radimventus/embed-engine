import { CircularPlaceholder } from './CircularPlaceholder';

export function FloorPlan() {
  return (
    <div className="relative mt-section flex aspect-square w-full max-w-full shrink-0 grow-0 items-center justify-center border border-embed-border-default bg-embed-status-warning/15">
      <div className="absolute bottom-section left-section">
        <CircularPlaceholder />
      </div>
      <p className="text-base text-embed-foreground-secondary">pole s půdorysem</p>
    </div>
  );
}
