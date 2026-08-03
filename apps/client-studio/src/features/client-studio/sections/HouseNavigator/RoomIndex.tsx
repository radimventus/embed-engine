import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';
import { SpatialContextPanel } from './SpatialContextPanel';
import {
  HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS,
  SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS,
  SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS,
} from '../spatial-terminal-layout';

/**
 * Room menu column:
 * 20 px from display (pl), 20 px to floor plan via floor-plan column pl.
 * Title-band spacer matches Media Explorer so Top(menu) == Top(display).
 * Mobile mounts SpatialContextPanel as room detail (RCS-03) — desktop SSOT unchanged.
 */
export function RoomIndex() {
  return (
    <section
      aria-label="Seznam místností"
      className="relative z-20 flex h-full min-w-0 shrink-0 flex-col content-start items-stretch gap-0 overflow-x-hidden pb-section pl-[20px] pr-0 mobile:px-section mobile:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className={SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS} aria-hidden="true">
        <span className="invisible">.</span>
      </div>
      <div className="mb-2 border-b border-embed-border-default pb-2 desktop:hidden">
        <SpatialContextPanel />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-start pt-0">
        <RoomPanel />
      </div>
      <div className={`${SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS} justify-center pb-1`}>
        <div className={`${HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS} z-20`}>
          <MediaModeToggle />
        </div>
      </div>
    </section>
  );
}
