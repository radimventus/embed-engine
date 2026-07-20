import type { Runtime } from '@embed-engine/core';

import { DecisionActionArea } from './DecisionActionArea';
import { DecisionCard } from './DecisionCard';
import {
  DECISION_GRID_COLUMN_SIZE_PX,
  DECISION_GRID_GAP_PX,
  DECISION_SURFACE_HEIGHT_PX,
  DECISION_SURFACE_WIDTH_PX,
} from './decision-cards-layout';
import { EventTimeline } from './EventTimeline';
import { PriorityReasons } from './PriorityReasons';
import { useDecisionCards } from './useDecisionCards';

type PriorityCardsProps = {
  runtime: Runtime;
};

export function PriorityCards({ runtime }: PriorityCardsProps) {
  const {
    categories,
    elevatedPriorities,
    events,
    minimumMet,
    minimumSelection,
    priorityById,
    questionId,
    selectedCount,
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
          const priority = priorityById[category.id];
          const importance = priority?.weight ?? 0.35;

          return (
            <DecisionCard
              key={category.id}
              category={category}
              importance={importance}
              isActive={questionId === category.id}
              isHighlighted={priority?.highlighted === true}
              reason={priority?.reason}
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
      <div className="mt-5 grid w-[680px] grid-cols-2 gap-4">
        <EventTimeline events={events} />
        <PriorityReasons priorities={elevatedPriorities} />
      </div>
    </div>
  );
}
