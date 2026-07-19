import type { Runtime } from '@embed-engine/core';

import { DecisionActionArea } from './DecisionActionArea';
import { DecisionCard } from './DecisionCard';
import {
  DECISION_GRID_COLUMN_SIZE_PX,
  DECISION_GRID_GAP_PX,
  DECISION_SURFACE_HEIGHT_PX,
  DECISION_SURFACE_WIDTH_PX,
} from './decision-cards-layout';
import { useDecisionCards } from './useDecisionCards';

type PriorityCardsProps = {
  runtime: Runtime;
};

export function PriorityCards({ runtime }: PriorityCardsProps) {
  const {
    cards,
    categories,
    minimumMet,
    minimumSelection,
    selectedCount,
    setImportance,
    toggleCard,
  } = useDecisionCards(runtime);

  return (
    <div className="flex min-w-0 flex-col self-start">
      <div
        aria-label="Decision Surface"
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
      <DecisionActionArea
        minimumMet={minimumMet}
        minimumSelection={minimumSelection}
        selectedCount={selectedCount}
      />
    </div>
  );
}
