import { useWalkthrough } from '../../../walkthrough';

export function MediaModeToggle() {
  const { mediaMode } = useWalkthrough();
  const videoActive = mediaMode === 'video';
  const photoActive = mediaMode === 'photo';

  const segmentClass =
    'py-3 text-sm transition-colors duration-[125ms] ease-out';

  return (
    <div className="mt-section grid grid-cols-2 gap-px">
      <button
        type="button"
        aria-pressed={videoActive}
        className={
          videoActive
            ? `${segmentClass} bg-embed-brand-navy text-embed-white`
            : `${segmentClass} border border-embed-border-default bg-embed-background-primary text-embed-foreground-secondary`
        }
      >
        VIDEO
      </button>
      <button
        type="button"
        aria-pressed={photoActive}
        className={
          photoActive
            ? `${segmentClass} bg-embed-brand-navy text-embed-white`
            : `${segmentClass} border border-embed-border-default bg-embed-background-primary text-embed-foreground-secondary`
        }
      >
        FOTKY
      </button>
    </div>
  );
}
