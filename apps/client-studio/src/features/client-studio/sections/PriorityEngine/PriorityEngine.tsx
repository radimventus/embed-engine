import { IntroText } from './IntroText';
import { PriorityCards } from './PriorityCards';
import { RecommendationCard } from './RecommendationCard';
import { SectionHeader } from './SectionHeader';

export function PriorityEngine() {
  return (
    <section
      aria-label="Priority Engine"
      className="border-b border-embed-border-default px-4 py-6 md:px-8 md:py-8"
    >
      <SectionHeader />
      <div className="mt-4 grid grid-cols-[52fr_48fr] gap-4">
        <div>
          <PriorityCards />
          <RecommendationCard />
        </div>
        <IntroText />
      </div>
    </section>
  );
}
