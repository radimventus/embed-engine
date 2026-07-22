import { DecisionCard } from './DecisionCard';
import {
  DECISION_GRID_GAP_PX,
} from './decision-cards-layout';
import type { DecisionCategory } from './decision-cards.constants';
import type { DecisionCardState } from './useDecisionCards';

type PriorityCardsProps = {
  cards: Record<string, DecisionCardState>;
  categories: readonly DecisionCategory[];
  setImportance: (id: string, importance: number) => void;
  toggleCard: (id: string) => void;
};

/**
 * Priority catalogue surface — presentation only (CSCB-04).
 * Responsive grid; intensity via DecisionSlider on selected cards.
 */
export function PriorityCards({
  cards,
  categories,
  setImportance,
  toggleCard,
}: PriorityCardsProps) {
  return (
    <div className="flex min-w-0 flex-col self-start">
      <div
        aria-label="Katalog priorit"
        className="grid w-full max-w-[685px] grid-cols-5 justify-items-center overflow-visible mobile:grid-cols-2 tablet:grid-cols-3"
        style={{ gap: DECISION_GRID_GAP_PX }}
      >
        {categories.map((category) => {
          const card = cards[category.id];
          if (card === undefined) {
            return null;
          }

          return (
            <DecisionCard
              key={category.id}
              category={category}
              importance={card.importance}
              isActive={card.selected}
              onImportanceChange={(value) => setImportance(category.id, value)}
              onToggle={() => toggleCard(category.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
