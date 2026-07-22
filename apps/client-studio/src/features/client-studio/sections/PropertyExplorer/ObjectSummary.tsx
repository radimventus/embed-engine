import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  formatAreaM2,
  type PropertyFact,
} from './propertyExplorerModel';

/**
 * Object Summary — identity facts from Runtime Context (SR-003).
 */
export function ObjectSummary() {
  const { experience } = useDecisionSessionRuntime();
  const object = experience.context.object;
  const house = experience.house;
  const floors = experience.context.navigation.floors.length;

  const facts: readonly PropertyFact[] = [
    { label: 'Typ objektu', value: object.construction },
    { label: 'Dispozice', value: `${house.roomCount} místností` },
    { label: 'Užitná plocha', value: formatAreaM2(object.usableArea) },
    { label: 'Pozemek', value: formatAreaM2(house.landArea) },
    { label: 'Podlaží', value: String(floors) },
    ...(object.energyClass.length > 0
      ? [{ label: 'Energetická třída', value: object.energyClass }]
      : []),
    {
      label: 'Lokalita',
      value: `${object.city} – ${object.district}`,
    },
  ];

  return (
    <header
      aria-label="Shrnutí objektu"
      className="border-b border-embed-border-default px-section py-section"
      data-object-id={object.id}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-embed-brand-gold">
        {object.reference}
      </p>
      <h2 className="mt-2 font-sans text-2xl font-bold tracking-tight text-embed-foreground-primary mobile:text-xl">
        {object.title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-embed-foreground-primary/70">
        Strukturovaný přehled charakteristik objektu.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 tablet:grid-cols-3 desktop:grid-cols-4 mobile:grid-cols-1">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-embed-foreground-primary/55">{fact.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-embed-foreground-primary">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
