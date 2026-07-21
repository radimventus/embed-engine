import {
  DECISION_CARD_ACTIVE_CLASS,
  DECISION_CARD_FOCUS_CLASS,
  DECISION_CARD_HOVER_CLASS,
  DECISION_CARD_IDLE_CLASS,
  DECISION_CARD_SIZE_PX,
  DECISION_TRANSITION_CLASS,
} from './decision-cards-layout';
import { DecisionCategoryIcon } from './DecisionCategoryIcon';
import type { PriorityCardModel } from './usePriorityExperience';

type PriorityCardProps = {
  card: PriorityCardModel;
  onFocusPriority: () => void;
};

/**
 * Priority card — renders Interpretation fields; click emits Signal via parent.
 * Weight meter is read-only (no local Cognitive mutation).
 */
export function PriorityCard({ card, onFocusPriority }: PriorityCardProps) {
  const { presentation, priority, isFocused, percent } = card;
  const isHighlighted = priority.highlighted === true;

  return (
    <div
      className={`relative shrink-0 transition-[transform,box-shadow] duration-300 ease-out ${
        isHighlighted ? 'z-10 scale-[1.04]' : 'z-0 scale-100'
      }`}
      style={{ height: DECISION_CARD_SIZE_PX, width: DECISION_CARD_SIZE_PX }}
      title={priority.reason}
    >
      <button
        type="button"
        aria-pressed={isFocused}
        aria-label={`${presentation.title}, priority ${percent}${
          priority.rank !== undefined ? `, rank ${priority.rank}` : ''
        }`}
        onClick={onFocusPriority}
        className={`absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-[8px] border px-2.5 py-2.5 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out ${DECISION_TRANSITION_CLASS} ${DECISION_CARD_FOCUS_CLASS} ${
          isFocused
            ? DECISION_CARD_ACTIVE_CLASS
            : `${DECISION_CARD_IDLE_CLASS} ${DECISION_CARD_HOVER_CLASS} ${
                isHighlighted
                  ? 'border-embed-brand-gold/70 shadow-[0_0_0_1px_rgba(212,175,55,0.35)]'
                  : ''
              }`
        }`}
        style={{ transformOrigin: 'center center' }}
      >
        {priority.rank !== undefined ? (
          <span className="absolute right-1.5 top-1.5 text-[9px] font-semibold tabular-nums text-embed-brand-gold">
            #{priority.rank}
          </span>
        ) : null}
        <div className="flex flex-col items-center gap-2">
          <span className="-mt-0.5 flex items-center justify-center leading-none" aria-hidden="true">
            <DecisionCategoryIcon categoryId={presentation.id} />
          </span>
          <span
            className={`max-w-[96px] text-center font-medium leading-snug tracking-wide ${
              isFocused
                ? 'text-[10px] text-embed-foreground-primary'
                : 'text-[13px] text-embed-foreground-primary/70'
            }`}
          >
            {presentation.title}
          </span>
          <span
            className={`text-[11px] font-semibold tabular-nums transition-[color,transform] duration-300 ${
              isHighlighted ? 'scale-110 text-embed-brand-gold' : 'text-embed-brand-gold'
            }`}
            data-testid={`priority-${presentation.id}`}
          >
            {percent}
          </span>
        </div>
        <div
          className="mt-1 h-1 w-full max-w-[72px] overflow-hidden rounded-full bg-embed-border-default"
          aria-hidden="true"
        >
          <div
            className={`h-full rounded-full bg-embed-brand-gold transition-[width] duration-300 ease-out ${DECISION_TRANSITION_CLASS}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </button>
    </div>
  );
}
