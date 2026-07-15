import { FloorPlan } from './FloorPlan';
import { FloorSelector } from './FloorSelector';
import { SectionHeader } from './SectionHeader';
import { SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS } from '../spatial-terminal-layout';

export function FloorPlanExplorer() {
  return (
    <section
      aria-label="Floor Plan Explorer"
      className="grid h-full w-full min-w-0 grid-rows-[auto_1fr] content-start items-start gap-section overflow-x-hidden px-section py-section"
    >
      <SectionHeader />
      <div className="flex min-h-0 flex-col justify-end">
        <FloorPlan />
        <div className={SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS}>
          <FloorSelector />
        </div>
      </div>
    </section>
  );
}
