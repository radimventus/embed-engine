import type { PropertyFeatureGroupId } from './propertyExplorerModel';

type PropertyExplorerNavProps = {
  readonly groups: readonly {
    readonly id: PropertyFeatureGroupId;
    readonly title: string;
  }[];
  readonly activeId: PropertyFeatureGroupId;
  readonly onSelect: (id: PropertyFeatureGroupId) => void;
};

/**
 * Internal section navigation — local UI state only (SR-003).
 * Must not dispatch Runtime commands or invent meaning.
 */
export function PropertyExplorerNav({
  groups,
  activeId,
  onSelect,
}: PropertyExplorerNavProps) {
  return (
    <nav
      aria-label="Sekce Property Explorer"
      className="flex flex-wrap gap-2 border-b border-embed-border-default px-section py-3"
    >
      {groups.map((group) => {
        const active = group.id === activeId;
        return (
          <button
            key={group.id}
            type="button"
            aria-current={active ? 'true' : undefined}
            className={`rounded-[8px] px-3 py-2 text-sm transition-colors touch-manipulation ${
              active
                ? 'bg-embed-brand-navy font-medium text-embed-background-primary'
                : 'text-embed-foreground-primary/60 hover:bg-embed-background-primary hover:text-embed-foreground-primary'
            }`}
            onClick={() => {
              onSelect(group.id);
            }}
          >
            {group.title}
          </button>
        );
      })}
    </nav>
  );
}
