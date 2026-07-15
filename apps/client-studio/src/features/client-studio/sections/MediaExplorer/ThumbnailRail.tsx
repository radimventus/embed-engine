const THUMBNAIL_COUNT = 4;

export function ThumbnailRail() {
  return (
    <div className="mt-section grid shrink-0 grid-cols-4 items-end gap-section">
      {Array.from({ length: THUMBNAIL_COUNT }).map((_, index) => (
        <div
          key={index}
          className="aspect-square border border-embed-border-default bg-embed-status-warning/15"
        />
      ))}
    </div>
  );
}
