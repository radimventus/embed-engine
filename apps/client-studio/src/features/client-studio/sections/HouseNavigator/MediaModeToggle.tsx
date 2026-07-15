import { useWalkthrough } from '../../../walkthrough';
import {
  SEGMENTED_CONTROL_SEGMENT_ACTIVE_CLASS,
  SEGMENTED_CONTROL_SEGMENT_INACTIVE_CLASS,
  SEGMENTED_CONTROL_SHELL_CLASS,
} from '../spatial-terminal-layout';

export function MediaModeToggle() {
  const { mediaMode, setMediaMode } = useWalkthrough();
  const videoActive = mediaMode === 'video';
  const photoActive = mediaMode === 'photo';

  return (
    <div className={SEGMENTED_CONTROL_SHELL_CLASS}>
      <button
        type="button"
        aria-pressed={videoActive}
        className={videoActive ? SEGMENTED_CONTROL_SEGMENT_ACTIVE_CLASS : SEGMENTED_CONTROL_SEGMENT_INACTIVE_CLASS}
        onClick={() => setMediaMode('video')}
      >
        VIDEO
      </button>
      <button
        type="button"
        aria-pressed={photoActive}
        className={photoActive ? SEGMENTED_CONTROL_SEGMENT_ACTIVE_CLASS : SEGMENTED_CONTROL_SEGMENT_INACTIVE_CLASS}
        onClick={() => setMediaMode('photo')}
      >
        FOTKY
      </button>
    </div>
  );
}
