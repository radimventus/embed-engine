import type { DecisionCategory } from './decision-cards.constants';
import {
  DECISION_CARD_ACTIVE_CLASS,
  DECISION_CARD_ATTENTION_CLASS,
  DECISION_CARD_FOCUS_CLASS,
  DECISION_CARD_HOVER_CLASS,
  DECISION_CARD_IDLE_CLASS,
  DECISION_CARD_PRIMARY_CLASS,
  DECISION_CARD_RELATED_CLASS,
  DECISION_CARD_SHELL_CLASS,
  DECISION_TRANSITION_CLASS,
} from './decision-cards-layout';
import { DecisionCategoryIcon } from './DecisionCategoryIcon';
import { DecisionSlider } from './DecisionSlider';

type DecisionCardProps = {
  category: DecisionCategory;
  importance: number;
  isActive: boolean;
  hasSelectedCard: boolean;
  /** PT-002 — Runtime Decision Story primary. */
  isPrimary?: boolean;
  /** PT-002 — content related to primary priority. */
  isRelated?: boolean;
  onImportanceChange: (value: number) => void;
  onToggle: () => void;
};

/** Counters card active scale so content pixel size stays constant across states. */
const ACTIVE_CONTENT_COUNTER_SCALE = 'scale-[0.909] mobile:scale-[0.971]';

const IDLE_BORDER = '#E3E3E3';
const HOVER_BORDER = '#D4AF37';
const ACTIVE_BORDER = '#D4AF37';
const CARD_BG = '#F7F6F4';

export function DecisionCard({
  category,
  importance,
  isActive,
  hasSelectedCard,
  isPrimary = false,
  isRelated = false,
  onImportanceChange,
  onToggle,
}: DecisionCardProps) {
  const highlightClass = isActive
    ? ''
    : hasSelectedCard && isPrimary
      ? DECISION_CARD_PRIMARY_CLASS
      : hasSelectedCard && isRelated
        ? DECISION_CARD_RELATED_CLASS
        : '';

  return (
    <div
      className={DECISION_CARD_SHELL_CLASS}
      data-pt002-highlight={
        isPrimary ? 'primary' : isRelated ? 'related' : undefined
      }
    >
      <button
        type="button"
        aria-pressed={isActive}
        aria-label={`${category.title} decision category`}
        onClick={onToggle}
        className={`absolute inset-0 flex flex-col items-center overflow-hidden rounded-[8px] px-2.5 touch-manipulation transition-[transform,box-shadow,border-color,border-width,background-color] ${DECISION_TRANSITION_CLASS} ${DECISION_CARD_FOCUS_CLASS} ${highlightClass} ${
          isActive
            ? `${DECISION_CARD_ACTIVE_CLASS} justify-between py-2.5`
            : `${DECISION_CARD_IDLE_CLASS} ${DECISION_CARD_HOVER_CLASS} ${DECISION_CARD_ATTENTION_CLASS} z-0 scale-100 justify-center py-3`
        }`}
        style={{
          transformOrigin: 'center center',
          // Explicit solid border — embed boundary resets button border-style to none.
          borderStyle: 'solid',
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? ACTIVE_BORDER : IDLE_BORDER,
          backgroundColor: CARD_BG,
          borderRadius: 8,
        }}
        onMouseEnter={(event) => {
          if (isActive) {
            return;
          }
          event.currentTarget.style.borderColor = HOVER_BORDER;
          event.currentTarget.style.borderWidth = '1px';
          event.currentTarget.style.boxShadow = 'none';
          event.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
          event.currentTarget.style.zIndex = '5';
        }}
        onMouseLeave={(event) => {
          if (isActive) {
            return;
          }
          event.currentTarget.style.borderColor = IDLE_BORDER;
          event.currentTarget.style.borderWidth = '1px';
          event.currentTarget.style.boxShadow = 'none';
          event.currentTarget.style.transform = 'translateY(0) scale(1)';
          event.currentTarget.style.zIndex = '0';
        }}
      >
        <div
          className={`flex flex-col items-center gap-2.5 ${
            isActive ? 'translate-y-5' : ''
          }`}
        >
          <span
            className={`-mt-0.5 flex items-center justify-center leading-none ${
              isActive ? ACTIVE_CONTENT_COUNTER_SCALE : ''
            }`}
            aria-hidden="true"
          >
            <DecisionCategoryIcon categoryId={category.id} />
          </span>
          <span
            className={`max-w-full text-center font-medium leading-snug tracking-wide desktop:max-w-[96px] text-[16px] ${
              isActive
                ? `${ACTIVE_CONTENT_COUNTER_SCALE} text-embed-foreground-primary`
                : 'text-embed-foreground-primary/70'
            }`}
          >
            {category.title}
          </span>
        </div>
        <div
          className={`w-full transition-[opacity,transform,max-height] ${DECISION_TRANSITION_CLASS} ${
            isActive
              ? 'max-h-11 translate-y-0 pt-2 opacity-100 desktop:max-h-10'
              : 'pointer-events-none max-h-0 translate-y-1 opacity-0'
          }`}
        >
          {isActive ? (
          <div
            className="w-full min-w-0 overflow-visible mobile:block mobile:w-full mobile:overflow-visible"
            data-mobile-priority-intensity
          >
            <DecisionSlider
              value={importance}
              onChange={onImportanceChange}
            />
          </div>
        ) : null}
        </div>
      </button>
    </div>
  );
}
