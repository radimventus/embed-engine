import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';
import {
  HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS,
  SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS,
  SPATIAL_TERMINAL_HEADER_CLASS,
  SPATIAL_TERMINAL_THUMBNAIL_ROW_CLASS,
} from '../spatial-terminal-layout';

export function RoomIndex() {
  return (
    <section
      aria-label="Room Index"
      className="grid h-full min-w-0 shrink-0 -translate-x-[5px] grid-rows-[auto_1fr_100px] content-start items-start gap-0 overflow-x-hidden px-section pb-section"
    >
      <div className={SPATIAL_TERMINAL_HEADER_CLASS} aria-hidden="true">
        <span className="invisible">.</span>
      </div>
      <RoomPanel />
      <div className={`flex ${SPATIAL_TERMINAL_THUMBNAIL_ROW_CLASS} flex-col justify-end`}>
        <div className={`${SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS} ml-[15px]`}>
          <div className={HOUSE_NAVIGATOR_SEGMENTED_WIDTH_CLASS}>
            <MediaModeToggle />
          </div>
        </div>
      </div>
    </section>
  );
}
