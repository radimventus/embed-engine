import { FloorPlan } from './FloorPlan';
import { FloorSelector } from './FloorSelector';
import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';
import { SectionHeader } from './SectionHeader';

export function HouseNavigator() {
  return (
    <section
      aria-label="House Navigator"
      className="flex h-full flex-col border-b border-embed-border-default px-4 py-6 md:px-8 md:py-8"
    >
      <SectionHeader />
      <div className="mt-4 flex flex-1 flex-col">
        <div className="grid flex-1 grid-cols-[1fr_2fr] gap-4">
          <div className="flex flex-col">
            <RoomPanel />
            <MediaModeToggle />
          </div>
          <div className="flex flex-col">
            <FloorPlan />
            <FloorSelector />
          </div>
        </div>
      </div>
    </section>
  );
}
