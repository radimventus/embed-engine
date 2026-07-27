import { useWalkthrough } from '../../../walkthrough';
import type { MediaMode } from '@embed-engine/contracts';

import { TourSegmentedControl } from './TourSegmentedControl';

const OPTIONS: readonly { value: MediaMode; label: string }[] = [
  { value: 'video', label: 'VIDEO' },
  { value: 'photo', label: 'FOTKY' },
];

/** Re-export shared shell helpers for FloorSelector. */
export {
  TOUR_SEGMENTED_SHELL_CLASS,
  tourSegmentedButtonClass,
} from './TourSegmentedControl';

/**
 * VIDEO / FOTKY — design from published Embed; functionality unchanged.
 */
export function MediaModeToggle() {
  const { mediaMode, setMediaMode } = useWalkthrough();

  return (
    <TourSegmentedControl
      aria-label="Režim média"
      value={mediaMode}
      options={OPTIONS}
      onChange={setMediaMode}
    />
  );
}
