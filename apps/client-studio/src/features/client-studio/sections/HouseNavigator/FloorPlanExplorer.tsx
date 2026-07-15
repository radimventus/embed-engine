import { FloorPlan } from './FloorPlan';
import { FloorSelector } from './FloorSelector';
import { SectionHeader } from './SectionHeader';

export function FloorPlanExplorer() {
  return (
    <section
      aria-label="Floor Plan Explorer"
      className="grid h-full shrink-0 grid-rows-[auto_auto_auto] px-section py-section"
    >
      <SectionHeader />
      <FloorPlan />
      <FloorSelector />
    </section>
  );
}
