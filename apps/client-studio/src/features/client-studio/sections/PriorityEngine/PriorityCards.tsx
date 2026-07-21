import {
  DECISION_GRID_COLUMN_SIZE_PX,
  DECISION_GRID_GAP_PX,
  DECISION_SURFACE_HEIGHT_PX,
  DECISION_SURFACE_WIDTH_PX,
} from './decision-cards-layout';
import { EventTimeline } from './EventTimeline';
import { PriorityCard } from './PriorityCard';
import { PriorityProgress } from './PriorityProgress';
import { PriorityReasons } from './PriorityReasons';
import { usePriorityExperience } from './usePriorityExperience';

/**
 * Priority cards grid — Interpretation-driven (S-003 MVP).
 */
export function PriorityCards() {
  const {
    status,
    cards,
    elevatedPriorities,
    events,
    minimumMet,
    minimumSelection,
    selectedCount,
    nextAction,
    focusPriority,
  } = usePriorityExperience();

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-[200px] min-w-0 flex-col justify-center self-start"
        aria-busy="true"
        aria-live="polite"
        data-testid="priority-loading"
      >
        <p className="text-sm text-embed-foreground-primary/60">
          Loading Priorities…
        </p>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div
        className="flex min-h-[200px] min-w-0 flex-col justify-center self-start"
        data-testid="priority-empty"
      >
        <p className="text-sm text-embed-foreground-primary/60">
          No Priorities yet. Explore the house, then return here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col self-start" data-testid="priority-ready">
      <div
        aria-label="Priority Surface"
        className="grid shrink-0 items-center justify-items-center overflow-visible"
        style={{
          gap: DECISION_GRID_GAP_PX,
          gridTemplateColumns: `repeat(5, ${DECISION_GRID_COLUMN_SIZE_PX}px)`,
          height: DECISION_SURFACE_HEIGHT_PX,
          width: DECISION_SURFACE_WIDTH_PX,
        }}
      >
        {cards.map((card) => (
          <PriorityCard
            key={card.presentation.id}
            card={card}
            onFocusPriority={() => focusPriority(card.presentation.id)}
          />
        ))}
      </div>
      <PriorityProgress
        minimumMet={minimumMet}
        minimumSelection={minimumSelection}
        selectedCount={selectedCount}
        nextAction={nextAction}
      />
      <div className="mt-5 grid w-[680px] grid-cols-2 gap-4 mobile:w-full mobile:grid-cols-1">
        <EventTimeline events={events} />
        <PriorityReasons priorities={elevatedPriorities} />
      </div>
    </div>
  );
}
