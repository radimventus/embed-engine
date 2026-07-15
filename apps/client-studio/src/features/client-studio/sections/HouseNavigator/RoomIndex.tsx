import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';
import { SPATIAL_TERMINAL_HEADER_CLASS } from '../spatial-terminal-layout';

export function RoomIndex() {
  return (
    <section
      aria-label="Room Index"
      className="grid h-full min-w-0 shrink-0 grid-rows-[auto_1fr_auto] content-start items-start gap-section overflow-x-hidden px-section py-section"
    >
      <div className={SPATIAL_TERMINAL_HEADER_CLASS} aria-hidden="true">
        <span className="invisible">.</span>
      </div>
      <RoomPanel />
      <MediaModeToggle />
    </section>
  );
}
