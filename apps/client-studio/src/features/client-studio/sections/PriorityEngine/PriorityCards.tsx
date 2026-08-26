import { useExperienceProjection } from '../../runtime/useExperienceProjection';
import { DecisionCard } from './DecisionCard';
import type { DecisionCategory } from './decision-cards.constants';
import type { DecisionCardState } from './useDecisionCards';

type PriorityCardsProps = {
  cards: Record<string, DecisionCardState>;
  categories: readonly DecisionCategory[];
  setImportance: (id: string, importance: number) => void;
  toggleCard: (id: string) => void;
};

/**
 * Priority catalogue surface — presentation only (CSCB-04 / PT-002).
 * Primary / related highlights come from ExperienceProjection (Runtime Story).
 */
export function PriorityCards({
  cards,
  categories,
  setImportance,
  toggleCard,
}: PriorityCardsProps) {
  const { highlight } = useExperienceProjection();
  const relatedSet = new Set(highlight.relatedPriorityIds);
  const hasSelectedCard = Object.values(cards).some((card) => card.selected);

  return (
    <div className="flex min-w-0 flex-col self-start">
      <div
        aria-label="Katalog priorit"
        data-pt002-primary={highlight.primaryPriorityId ?? ''}
        data-pt002-related={highlight.relatedPriorityIds.join(',')}
        className="grid w-full max-w-[685px] grid-cols-4 justify-items-center gap-[22px] overflow-visible tabletMin:max-w-none tabletMin:grid-cols-3 tabletMin:justify-items-stretch tabletMin:gap-4 tabletMax:max-w-none tabletMax:grid-cols-4 tabletMax:gap-[18px] mobile:max-w-none mobile:grid-cols-3 mobile:justify-items-stretch mobile:gap-3"
      >
        {categories.map((category) => {
          const card = cards[category.id];
          if (card === undefined) {
            return null;
          }

          const isPrimary = highlight.primaryPriorityId === category.id;
          const isRelated = !isPrimary && relatedSet.has(category.id);

          return (
            <DecisionCard
              key={category.id}
              category={category}
              importance={card.importance}
              isActive={card.selected}
              hasSelectedCard={hasSelectedCard}
              isPrimary={isPrimary}
              isRelated={isRelated}
              onImportanceChange={(value) => setImportance(category.id, value)}
              onToggle={() => toggleCard(category.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
