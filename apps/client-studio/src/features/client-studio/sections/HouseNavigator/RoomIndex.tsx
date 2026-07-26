import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';
import {
  HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS,
  SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS,
  SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS,
} from '../spatial-terminal-layout';

/**
 * Room menu column (TOUR-31 / TOUR-32):
 * +20 px right (pl-10) for optical centering and larger menu↔plan gap.
 * Title-band spacer matches Media Explorer so Top(menu) == Top(display).
 */
export function RoomIndex() {
  return (
    <section
      aria-label="Seznam místností"
      className="relative z-20 flex h-full min-w-0 shrink-0 flex-col content-start items-stretch gap-0 overflow-x-hidden pb-section pl-10 pr-5"
    >
      <div className={SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS} aria-hidden="true">
        <span className="invisible">.</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-start pt-0">
        <RoomPanel />
      </div>
      <div className={`${SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS} pb-1`}>
        <div className={`${HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS} z-20`}>
          <MediaModeToggle />
        </div>
      </div>
    </section>
  );
}
