import {
  healthGlyph,
  healthLabel,
  type KnowledgeCategoryView,
  type KnowledgeHealth,
} from './knowledgeProjection';

type KnowledgeCategoryCardProps = {
  readonly category: KnowledgeCategoryView;
  readonly selected: boolean;
  readonly onOpen: () => void;
};

/**
 * EPIC-BX-04 — Knowledge category card.
 */
export function KnowledgeCategoryCard({
  category,
  selected,
  onOpen,
}: KnowledgeCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-[14px] border bg-white p-4 text-left shadow-sm transition hover:border-builder-navy/30 ${
        selected
          ? 'border-builder-navy ring-2 ring-builder-navy/15'
          : 'border-[#E3E3E3]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-builder-ink">
            {category.label}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-builder-muted">
            {category.summary || category.description}
          </p>
        </div>
        <HealthBadge health={category.health} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-builder-muted">
        <span>{category.itemCount} položek</span>
        <span aria-hidden>·</span>
        <span>
          {new Date(category.updatedAt).toLocaleString('cs-CZ', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      </div>
      <p className="mt-3 text-[11px] text-builder-muted">
        Používá: {category.dependencies.join(' · ')}
      </p>
    </button>
  );
}

function HealthBadge({ health }: { readonly health: KnowledgeHealth }) {
  const className =
    health === 'complete'
      ? 'bg-builder-successBg text-builder-success'
      : 'bg-[#E4ECF7] text-builder-navy';
  return (
    <span
      className={`shrink-0 rounded-[10px] px-2.5 py-1 text-sm font-semibold ${className}`}
    >
      {healthGlyph(health)} {healthLabel(health)}
    </span>
  );
}
