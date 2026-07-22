import type { PropertyFeatureGroup } from './propertyExplorerModel';

type FeatureGroupsProps = {
  readonly group: PropertyFeatureGroup;
};

/**
 * Active feature group panel — presentation only (SR-003).
 */
export function FeatureGroups({ group }: FeatureGroupsProps) {
  return (
    <section
      aria-label={group.title}
      data-feature-group={group.id}
      className="px-section py-section"
    >
      <h3 className="text-lg font-semibold text-embed-foreground-primary">
        {group.title}
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-x-10 gap-y-4 mobile:grid-cols-1">
        {group.facts.map((fact) => (
          <div
            key={`${group.id}-${fact.label}`}
            className="border-b border-embed-border-default/70 pb-3"
          >
            <dt className="text-xs text-embed-foreground-primary/55">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-embed-foreground-primary">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
