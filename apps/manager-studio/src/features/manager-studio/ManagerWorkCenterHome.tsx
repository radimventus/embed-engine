import {
  useHouseOperationalCases,
} from '@embed-engine/platform-access';
import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

/**
 * PR-005 — Manager jako pracovní centrum.
 * Operational metrics are derived from the shared House-scoped case path.
 */
export function ManagerWorkCenterHome() {
  const { aggregate } = useHouseOperationalCases();

  if (aggregate.caseCount === 0) {
    return (
      <section
        id="manager-work-center"
        className="mb-8"
        data-testid="manager-operational-empty"
      >
        <PlatformCard
          title="Provozní přehled"
          description="Pro tento dům zatím nejsou žádná provozní ani zákaznická data."
        >
          <p className="text-sm text-[var(--platform-navy)] opacity-70">
            Data vzniknou používáním Client Experience.
          </p>
        </PlatformCard>
      </section>
    );
  }

  const maxPriority =
    aggregate.priorityCounts[0]?.count ?? aggregate.caseCount;
  const topPriority = aggregate.priorityCounts[0]?.label ?? '—';

  return (
    <section id="manager-work-center" className="mb-8 space-y-6">
      <p
        className="text-xs text-[var(--platform-navy)] opacity-70"
        data-testid="manager-work-center-cases-label"
      >
        Odvozeno z kanonických případů tohoto domu
      </p>
      <div className="grid gap-6 desktop:grid-cols-2">
        <div id="mwc-dropoff" className="scroll-mt-4">
          <PlatformCard
            title="Provozní případy"
            description="Počty odvozené z kanonických záznamů domu"
          >
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
            >
              <MetricBox label="Případy" value={String(aggregate.caseCount)} />
              <MetricBox
                label="Konverze"
                value={String(aggregate.convertedCount)}
              />
              <MetricBox
                label="Vysoká jistota"
                value={String(aggregate.highIntentCount)}
              />
            </div>
            <div className="mt-5 border-t border-[var(--platform-line)] pt-4">
              {aggregate.journeyModuleCounts.map((item) => (
                <FunnelRow
                  key={item.module}
                  label={item.module}
                  width={Math.round(
                    (item.completedCount / aggregate.caseCount) * 100,
                  )}
                  value={String(item.completedCount)}
                />
              ))}
            </div>
          </PlatformCard>
        </div>

        <div id="mwc-factors" className="scroll-mt-4">
          <PlatformCard
            title="Co ovlivňuje rozhodnutí zákazníků"
            description="Prioritní témata z Profilu zájemce"
            action={
              <PlatformStatusBadge tone="gold">
                {`Top: ${topPriority}`}
              </PlatformStatusBadge>
            }
          >
            <div>
              {aggregate.priorityCounts.map((item) => (
                <FactorRow
                  key={item.label}
                  label={item.label}
                  width={Math.round((item.count / maxPriority) * 100)}
                  value={String(item.count)}
                />
              ))}
            </div>
          </PlatformCard>
        </div>
      </div>
    </section>
  );
}

function FunnelRow({
  label,
  width,
  value,
  critical = false,
}: {
  readonly label: string;
  readonly width: number;
  readonly value: string;
  readonly critical?: boolean;
}) {
  return (
    <div
      className="mb-3.5 grid items-center gap-4"
      style={{ gridTemplateColumns: '130px 1fr 60px' }}
    >
      <span
        className="text-sm font-semibold"
        style={{ color: critical ? 'var(--platform-red)' : 'var(--platform-navy)' }}
      >
        {label}
      </span>
      <div className="h-[22px] overflow-hidden rounded-full bg-[var(--platform-line)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: critical
              ? 'var(--platform-red)'
              : 'var(--platform-accent)',
          }}
        />
      </div>
      <span
        className="text-right text-sm font-bold"
        style={{ color: critical ? 'var(--platform-red)' : 'var(--platform-navy)' }}
      >
        {value}
      </span>
    </div>
  );
}

function FactorRow({
  label,
  width,
  value,
}: {
  readonly label: string;
  readonly width: number;
  readonly value: string;
}) {
  return (
    <div
      className="mb-3 grid items-center gap-3"
      style={{ gridTemplateColumns: '1fr 1fr 40px' }}
    >
      <span className="text-sm font-semibold text-[var(--platform-navy)]">
        {label}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--platform-line)]">
        <div
          className="h-full rounded-full bg-[var(--platform-accent)]"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-right text-sm font-bold text-[var(--platform-navy)]">
        {value}
      </span>
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] bg-[var(--platform-cream-light)] px-3 py-3 text-[12px] text-[var(--platform-navy)]">
      {label}
      <b className="mt-1 block text-sm text-[var(--platform-navy)]">{value}</b>
    </div>
  );
}
