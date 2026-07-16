import type { DecisionCategory } from './decision-cards.constants';
import {
  DECISION_CARD_ACTIVE_CLASS,
  DECISION_CARD_FOCUS_CLASS,
  DECISION_CARD_HOVER_CLASS,
  DECISION_CARD_IDLE_CLASS,
  DECISION_CARD_SIZE_PX,
  DECISION_TRANSITION_CLASS,
} from './decision-cards-layout';
import { DecisionSlider } from './DecisionSlider';

type DecisionCardProps = {
  category: DecisionCategory;
  importance: number;
  isActive: boolean;
  onImportanceChange: (value: number) => void;
  onToggle: () => void;
};

export function DecisionCard({
  category,
  importance,
  isActive,
  onImportanceChange,
  onToggle,
}: DecisionCardProps) {
  return (
    <div
      className="relative shrink-0"
      style={{ height: DECISION_CARD_SIZE_PX, width: DECISION_CARD_SIZE_PX }}
    >
      <button
        type="button"
        aria-pressed={isActive}
        aria-label={`${category.title} decision category`}
        onClick={onToggle}
        className={`absolute inset-0 flex flex-col items-center overflow-hidden rounded-xl border px-2.5 transition-[transform,box-shadow,border-color] ${DECISION_TRANSITION_CLASS} ${DECISION_CARD_FOCUS_CLASS} ${
          isActive
            ? `${DECISION_CARD_ACTIVE_CLASS} justify-between py-2.5`
            : `${DECISION_CARD_IDLE_CLASS} ${DECISION_CARD_HOVER_CLASS} z-0 scale-100 justify-center py-3`
        }`}
        style={{ transformOrigin: 'center center' }}
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xl leading-none" aria-hidden="true">
            {category.icon}
          </span>
          <span
            className={`max-w-[96px] text-center text-[10px] font-medium leading-snug tracking-wide ${
              isActive ? 'text-embed-brand-navy' : 'text-embed-foreground-secondary'
            }`}
          >
            {category.title}
          </span>
        </div>
        <div
          className={`w-full transition-[opacity,transform,max-height] ${DECISION_TRANSITION_CLASS} ${
            isActive
              ? 'max-h-10 translate-y-0 border-t border-embed-neutral-100 pt-2 opacity-100'
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
