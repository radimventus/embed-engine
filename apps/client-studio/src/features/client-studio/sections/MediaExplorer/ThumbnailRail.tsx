import { useWalkthrough } from '../../../walkthrough';

const THUMBNAIL_SLOT_COUNT = 4;

export function ThumbnailRail() {
  const { mediaMode, roomPhotos } = useWalkthrough();
  const photos = mediaMode === 'photo' ? roomPhotos : [];

  return (
    <div className="mt-section grid shrink-0 grid-cols-4 items-end gap-section">
      {Array.from({ length: THUMBNAIL_SLOT_COUNT }, (_, index) => {
        const photoSrc = photos[index];

        return (
          <div
            key={index}
            className="aspect-square border border-embed-border-default bg-embed-status-warning/15"
          >
            {photoSrc !== undefined ? (
              <img src={photoSrc} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
