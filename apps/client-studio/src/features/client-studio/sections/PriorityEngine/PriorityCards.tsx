import { DecisionCard } from './DecisionCard';
import {
  DECISION_GRID_COLUMN_SIZE_PX,
  DECISION_GRID_GAP_PX,
  DECISION_SURFACE_HEIGHT_PX,
  DECISION_SURFACE_WIDTH_PX,
} from './decision-cards-layout';
import type { DecisionCategory } from './decision-cards.constants';

type DecisionCardState = {
  selected: boolean;
  importance: number;
};

type PriorityCardsProps = {
  cards: Record<string, DecisionCardState>;
  categories: readonly DecisionCategory[];
  setImportance: (id: string, importance: number) => void;
  toggleCard: (id: string) => void;
};

/**
 * Priority cards surface — presentation only; state owned by PriorityEngine.
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
        aria-label="Plocha Priorit"
        className="grid shrink-0 items-center justify-items-center overflow-visible"
        style={{
          gap: DECISION_GRID_GAP_PX,
          gridTemplateColumns: `repeat(5, ${DECISION_GRID_COLUMN_SIZE_PX}px)`,
          height: DECISION_SURFACE_HEIGHT_PX,
          width: DECISION_SURFACE_WIDTH_PX,
        }}
      >
        {categories.map((category) => {
          const card = cards[category.id];

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
