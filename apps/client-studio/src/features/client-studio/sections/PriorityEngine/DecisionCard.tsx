import type { DecisionCategory } from './decision-cards.constants';
import {
  DECISION_CARD_ACTIVE_CLASS,
  DECISION_CARD_FOCUS_CLASS,
  DECISION_CARD_HOVER_CLASS,
  DECISION_CARD_IDLE_CLASS,
  DECISION_CARD_PRIMARY_CLASS,
  DECISION_CARD_RELATED_CLASS,
  DECISION_CARD_SIZE_PX,
  DECISION_TRANSITION_CLASS,
} from './decision-cards-layout';
import { DecisionCategoryIcon } from './DecisionCategoryIcon';
import { DecisionSlider } from './DecisionSlider';

type DecisionCardProps = {
  category: DecisionCategory;
  importance: number;
  isActive: boolean;
  /** PT-002 — Runtime Decision Story primary. */
  isPrimary?: boolean;
  /** PT-002 — content related to primary priority. */
  isRelated?: boolean;
  onImportanceChange: (value: number) => void;
  onToggle: () => void;
};

/** Counters card active scale so icon pixel size stays constant across states. */
const ACTIVE_ICON_COUNTER_SCALE = 'scale-[0.893]';

export function DecisionCard({
  category,
  importance,
  isActive,
  isPrimary = false,
  isRelated = false,
  onImportanceChange,
  onToggle,
}: DecisionCardProps) {
  const highlightClass = isPrimary
    ? DECISION_CARD_PRIMARY_CLASS
    : isRelated
      ? DECISION_CARD_RELATED_CLASS
      : '';

  return (
    <div
      className="relative shrink-0"
      style={{ height: DECISION_CARD_SIZE_PX, width: DECISION_CARD_SIZE_PX }}
      data-pt002-highlight={
        isPrimary ? 'primary' : isRelated ? 'related' : undefined
      }
    >
      <button
        type="button"
        aria-pressed={isActive}
        aria-label={`${category.title} decision category`}
        onClick={onToggle}
        className={`absolute inset-0 flex flex-col items-center overflow-hidden rounded-[8px] px-2.5 touch-manipulation transition-[transform,box-shadow,border-color,border-width] ${DECISION_TRANSITION_CLASS} ${DECISION_CARD_FOCUS_CLASS} ${highlightClass} ${
          isActive
            ? `${DECISION_CARD_ACTIVE_CLASS} justify-between py-2.5`
            : `${DECISION_CARD_IDLE_CLASS} ${DECISION_CARD_HOVER_CLASS} z-0 scale-100 justify-center py-3`
        }`}
        style={{
          transformOrigin: 'center center',
          // Explicit solid border — embed boundary resets button border-style to none.
          borderStyle: 'solid',
          borderWidth: isActive ? 2 : 1,
          borderColor: '#D4AF37',
        }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <span
            className={`-mt-0.5 flex items-center justify-center leading-none ${
              isActive ? ACTIVE_ICON_COUNTER_SCALE : ''
            }`}
            aria-hidden="true"
          >
            <DecisionCategoryIcon categoryId={category.id} />
          </span>
          <span
            className={`max-w-[96px] text-center font-medium leading-snug tracking-wide ${
              isActive
                ? 'text-[10px] text-embed-foreground-primary'
                : 'text-[13px] text-embed-foreground-primary/70'
            }`}
          >
            {category.title}
          </span>
        </div>
        <div
          className={`w-full transition-[opacity,transform,max-height] ${DECISION_TRANSITION_CLASS} ${
            isActive
              ? 'max-h-10 translate-y-0 pt-2 opacity-100'
              : 'pointer-events-none max-h-0 translate-y-1 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {isActive ? <DecisionSlider value={importance} onChange={onImportanceChange} /> : null}
        </div>
      </button>
    </div>
  );
}
