import type { Runtime } from '@embed-engine/core';
import { createSignal, SignalType } from '@embed-engine/core/cognitive';

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
    categories,
    importanceById,
    minimumMet,
    minimumSelection,
    questionId,
    selectedCount,
    toggleCard,
  } = useDecisionCards(runtime);

  return (
    <div className="flex min-w-0 flex-col self-start">
      <div className="mb-3 flex flex-wrap gap-2" aria-label="Cognitive signal demo">
        <button
          type="button"
          className="rounded border border-embed-border-default bg-white px-2.5 py-1 text-[11px] text-embed-foreground-primary"
          onClick={() =>
            runtime.applySignal(
              createSignal({
                type: SignalType.ROOM_VIEWED,
                payload: { roomId: 'room-living' },
              }),
            )
          }
        >
          Signal: room
        </button>
        <button
          type="button"
          className="rounded border border-embed-border-default bg-white px-2.5 py-1 text-[11px] text-embed-foreground-primary"
          onClick={() =>
            runtime.applySignal(
              createSignal({
                type: SignalType.MEDIA_OPENED,
                payload: { mediaId: 'media-exterior' },
              }),
            )
          }
        >
          Signal: media
        </button>
        <button
          type="button"
          className="rounded border border-embed-border-default bg-white px-2.5 py-1 text-[11px] text-embed-foreground-primary"
          onClick={() =>
            runtime.applySignal(
              createSignal({
                type: SignalType.FLOOR_CHANGED,
                payload: { floorId: 'floor-1' },
              }),
            )
          }
        >
          Signal: floor
        </button>
      </div>
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
          const importance = importanceById[category.id] ?? 0.35;

          return (
            <DecisionCard
              key={category.id}
              category={category}
              importance={importance}
              isActive={questionId === category.id}
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
