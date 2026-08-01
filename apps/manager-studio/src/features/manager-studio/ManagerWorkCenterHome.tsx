import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

/**
 * PR-002 — Manager jako pracovní centrum (HTML click model).
 * Prezentace — bez nové capability / workflow.
 */
export function ManagerWorkCenterHome() {
  return (
    <section id="manager-work-center" className="mb-8 space-y-6">
      <div className="grid gap-6 desktop:grid-cols-2">
        <PlatformCard
          title="Místa ztráty zákazníků"
          description="Kde zájemci opouštějí rozhodovací proces (Decision Journey)"
          action={
            <PlatformStatusBadge tone="warning">
              Pokles ve kroku Finance
            </PlatformStatusBadge>
          }
        >
          <FunnelRow label="Experience" width={100} value="1000" />
          <FunnelRow label="Priority" width={87} value="870" />
          <FunnelRow label="Navigátor" width={69} value="690" />
          <FunnelRow label="Finance" width={43} value="430" critical />
          <FunnelRow label="Nabídka" width={31} value="310" />
          <FunnelRow label="Rezervace" width={19} value="190" />
          <div
            className="mt-5 grid gap-3 border-t border-[var(--platform-line)] pt-4"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            <MetricBox label="Nejkritičtější krok" value="Finance (−38 %)" />
            <MetricBox label="Celková konverze" value="19 %" />
            <MetricBox label="Doporučení" value="Doplnit kalkulačku" />
          </div>
        </PlatformCard>

        <PlatformCard
          title="Co ovlivňuje rozhodnutí zákazníků"
          description="Váha parametrů při vytváření osobního Decision Profile"
          action={
            <PlatformStatusBadge tone="gold">
              Top: Cena & Splátka
            </PlatformStatusBadge>
          }
        >
          <FactorRow label="Celková cena" width={92} value="92" />
          <FactorRow label="Měsíční splátka" width={87} value="87" />
          <FactorRow label="Energetická úspora" width={76} value="76" />
          <FactorRow label="Dispozice domu" width={69} value="69" />
          <FactorRow label="Velikost pozemku" width={58} value="58" />
          <FactorRow label="Design & Architektura" width={44} value="44" />
        </PlatformCard>
      </div>

      <PlatformCard
        title="Doporučená vylepšení Experience"
        description="Automatická diagnostika z Decision Signals pro zvýšení jistoty klientů"
      >
        <div className="grid gap-4 desktop:grid-cols-3">
          <ImproveCard
            tone="gold"
            impact="Vysoký dopad"
            title="Doplnit FAQ k financování"
            detail="Detekováno opuštění ve fázi Finance. Zodpovězení splátek předem odstraní nejistotu."
          />
          <ImproveCard
            tone="gold"
            impact="Vysoký dopad"
            title="Propojení House Navigatora s FVE"
            detail="Klienti řešící energetickou úsporu vyžadují pohled na střechu a orientaci ke světlu."
          />
          <ImproveCard
            tone="info"
            impact="Střední dopad"
            title="Rozšíření fotogalerie interiéru"
            detail="Opakované návraty do sekce Hero indikují potřebu více reálných detailů."
          />
        </div>
      </PlatformCard>
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
        style={{ color: critical ? 'var(--platform-red)' : 'var(--platform-ink)' }}
      >
        {label}
      </span>
      <div className="h-[22px] overflow-hidden rounded-full bg-[#EDF2F7]">
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
        style={{ color: critical ? 'var(--platform-red)' : 'var(--platform-ink)' }}
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
      <span className="text-sm font-semibold text-[var(--platform-ink)]">
        {label}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-[#EDF2F7]">
        <div
          className="h-full rounded-full bg-[var(--platform-accent)]"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-right text-sm font-bold">{value}</span>
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
    <div className="rounded-[12px] bg-[#FAFBFD] px-3 py-3 text-[12px] text-[var(--platform-muted)]">
      {label}
      <b className="mt-1 block text-sm text-[var(--platform-ink)]">{value}</b>
    </div>
  );
}

function ImproveCard({
  tone,
  impact,
  title,
  detail,
}: {
  readonly tone: 'gold' | 'info';
  readonly impact: string;
  readonly title: string;
  readonly detail: string;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--platform-line)] bg-[#FAFBFD] p-4">
      <PlatformStatusBadge tone={tone}>{impact}</PlatformStatusBadge>
      <h4 className="mt-2 text-[15px] font-semibold text-[var(--platform-ink)]">
        {title}
      </h4>
      <p className="mt-1 text-[12px] text-[var(--platform-muted)]">{detail}</p>
    </div>
  );
}
