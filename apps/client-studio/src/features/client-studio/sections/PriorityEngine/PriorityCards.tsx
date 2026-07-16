import { DecisionCard } from './DecisionCard';
import { DecisionProgress } from './DecisionProgress';
import {
  DECISION_CTA_DISABLED_CLASS,
  DECISION_CTA_ENABLED_CLASS,
  DECISION_CTA_FOCUS_CLASS,
  DECISION_GRID_GAP_PX,
  DECISION_SURFACE_HEIGHT_PX,
  DECISION_SURFACE_WIDTH_PX,
} from './decision-cards-layout';
import { useDecisionCards } from './useDecisionCards';

export function PriorityCards() {
  const {
    cards,
    categories,
    minimumMet,
    minimumSelection,
    selectedCount,
    setImportance,
    toggleCard,
  } = useDecisionCards();

  return (
    <div className="flex min-w-0 flex-col">
      <DecisionProgress
        minimumMet={minimumMet}
        minimumSelection={minimumSelection}
        selectedCount={selectedCount}
      />
      <div
        aria-label="Decision Surface"
        className="grid shrink-0 grid-cols-5 overflow-visible"
        style={{
          gap: DECISION_GRID_GAP_PX,
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
      <button
        type="button"
        disabled={!minimumMet}
        className={`mt-4 w-fit ${DECISION_CTA_FOCUS_CLASS} ${minimumMet ? DECISION_CTA_ENABLED_CLASS : DECISION_CTA_DISABLED_CLASS}`}
      >
        Pokračovat
      </button>
    </div>
  );
}
