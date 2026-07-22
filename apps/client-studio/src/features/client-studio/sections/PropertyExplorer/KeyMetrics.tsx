import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  formatAreaM2,
  formatPriceCzk,
  type PropertyFact,
} from './propertyExplorerModel';

/**
 * Key Metrics — visual metric strip from Runtime projections (SR-003).
 * No derived metrics (e.g. price/m²) unless Runtime provides them.
 */
export function KeyMetrics() {
  const { experience } = useDecisionSessionRuntime();
  const object = experience.context.object;
  const house = experience.house;

  const metrics: readonly PropertyFact[] = [
    { label: 'Cena', value: formatPriceCzk(house.price) },
    { label: 'Užitná plocha', value: formatAreaM2(object.usableArea) },
    { label: 'Pozemek', value: formatAreaM2(house.landArea) },
    { label: 'Místnosti', value: String(house.roomCount) },
  ];

  return (
    <section
      aria-label="Klíčové metriky"
      className="border-b border-embed-border-default px-section py-section"
    >
      <h3 className="text-xs font-bold uppercase tracking-wide text-embed-foreground-primary/55">
        Klíčové metriky
      </h3>
      <dl className="mt-4 grid grid-cols-4 gap-4 mobile:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[8px] bg-embed-background-primary px-4 py-3"
          >
            <dt className="text-xs text-embed-foreground-primary/55">
              {metric.label}
            </dt>
            <dd className="mt-1 text-lg font-bold text-embed-brand-gold mobile:text-base">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
