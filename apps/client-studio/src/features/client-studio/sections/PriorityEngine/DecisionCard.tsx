import type { DecisionCategory } from './decision-cards.constants';
import {
  DECISION_CARD_ACTIVE_CLASS,
  DECISION_CARD_FOCUS_CLASS,
  DECISION_CARD_HOVER_CLASS,
  DECISION_CARD_IDLE_CLASS,
  DECISION_CARD_SIZE_PX,
  DECISION_TRANSITION_CLASS,
} from './decision-cards-layout';
import { DecisionCategoryIcon } from './DecisionCategoryIcon';
import { DecisionSlider } from './DecisionSlider';

type DecisionCardProps = {
  category: DecisionCategory;
  importance: number;
  isActive: boolean;
  isHighlighted: boolean;
  reason?: string;
  onToggle: () => void;
};

/** Counters card active scale so icon pixel size stays constant across states. */
const ACTIVE_ICON_COUNTER_SCALE = 'scale-[0.893]';

export function DecisionCard({
  category,
  importance,
  isActive,
  isHighlighted,
  reason,
  onToggle,
}: DecisionCardProps) {
  const percent = Math.round(importance * 100);

  return (
    <div
      className={`relative shrink-0 transition-[transform,box-shadow] duration-300 ease-out ${
        isHighlighted ? 'z-10 scale-[1.04]' : 'z-0 scale-100'
      }`}
      style={{ height: DECISION_CARD_SIZE_PX, width: DECISION_CARD_SIZE_PX }}
      title={reason}
    >
      <button
        type="button"
        aria-pressed={isActive}
        aria-label={`${category.title} decision category, priority ${percent}`}
        onClick={onToggle}
        className={`absolute inset-0 flex flex-col items-center overflow-hidden rounded-[8px] border px-2.5 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out ${DECISION_TRANSITION_CLASS} ${DECISION_CARD_FOCUS_CLASS} ${
          isActive
            ? `${DECISION_CARD_ACTIVE_CLASS} justify-between py-2.5`
            : `${DECISION_CARD_IDLE_CLASS} ${DECISION_CARD_HOVER_CLASS} justify-center py-3 ${
                isHighlighted ? 'border-embed-brand-gold/70 shadow-[0_0_0_1px_rgba(212,175,55,0.35)]' : ''
              }`
        }`}
        style={{ transformOrigin: 'center center' }}
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
          <span
            className={`text-[11px] font-semibold tabular-nums transition-[color,transform] duration-300 ${
              isHighlighted ? 'scale-110 text-embed-brand-gold' : 'text-embed-brand-gold'
            }`}
            data-testid={`priority-${category.id}`}
          >
            {percent}
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
          {isActive ? (
            <DecisionSlider value={importance} onChange={() => undefined} />
          ) : null}
        </div>
      </button>
    </div>
  );
}
