import { IntroText } from './IntroText';
import { PriorityCards } from './PriorityCards';
import { RecommendationPanel } from './RecommendationPanel';
import { SectionHeader } from './SectionHeader';

export function PriorityEngine() {
  return (
    <section
      aria-label="Priority Engine"
      className="border-b border-embed-border-default px-section py-section"
    >
      <SectionHeader />
      <div className="mt-section grid min-h-[18rem] grid-cols-[52fr_48fr] items-stretch gap-section mobile:grid-cols-1">
        <PriorityCards />
        <IntroText />
      </div>
      <RecommendationPanel />
    </section>
  );
}
