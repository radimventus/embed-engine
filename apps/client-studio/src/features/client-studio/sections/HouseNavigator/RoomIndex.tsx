import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';

export function RoomIndex() {
  return (
    <section
      aria-label="Room Index"
      className="grid h-full shrink-0 grow-0 grid-rows-[auto_1fr_auto] px-section py-section"
    >
      <div className="text-base font-bold tracking-wide opacity-0" aria-hidden="true">
        .
      </div>
      <RoomPanel />
      <MediaModeToggle />
    </section>
  );
}
