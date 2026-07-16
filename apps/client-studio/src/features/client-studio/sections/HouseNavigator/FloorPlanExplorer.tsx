import { FloorPlan } from './FloorPlan';
import { FloorSelector } from './FloorSelector';
import { SectionHeader } from './SectionHeader';
import { SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS } from '../spatial-terminal-layout';

export function FloorPlanExplorer() {
  return (
    <section
      aria-label="Floor Plan Explorer"
      className="grid h-full w-full min-w-0 grid-rows-[1fr_auto] content-start items-start gap-0 overflow-x-hidden px-section pb-section pt-5"
    >
      <div className="relative min-h-0">
        <SectionHeader className="pointer-events-none absolute inset-x-0 top-0 z-10" />
        <FloorPlan />
      </div>
      <div className={SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS}>
        <FloorSelector />
      </div>
    </section>
  );
}
