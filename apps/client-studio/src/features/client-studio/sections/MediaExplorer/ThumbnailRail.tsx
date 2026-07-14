const THUMBNAIL_COUNT = 4;

export function ThumbnailRail() {
  return (
    <div className="mt-4 grid grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: THUMBNAIL_COUNT }).map((_, index) => (
        <div
          key={index}
          className="aspect-square border border-embed-border-default bg-embed-status-warning/15"
        />
      ))}
    </div>
  );
}
