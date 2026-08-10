import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';
import { useManagerStudioRuntime } from './runtime/DecisionSessionRuntimeProvider';

/**
 * PR-005 — Manager jako pracovní centrum (HTML click model).
 * DUP-09 / PT-PDM-03 — prezentace (ukázkové metriky); ne live analytics SSOT.
 */
export function ManagerWorkCenterHome() {
  const { houseDataMode } = useManagerStudioRuntime();

  if (houseDataMode !== 'REFERENCE_DEMO') {
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
            Data se zobrazí po přijetí skutečné provozní aktivity.
          </p>
        </PlatformCard>
      </section>
    );
  }

  return (
    <section id="manager-work-center" className="mb-8 space-y-6">
      <p
        className="text-xs text-[var(--platform-navy)] opacity-70"
        data-testid="manager-work-center-fixtures-label"
      >
        Ukázkové metriky (prezentace) — ne live analytics
      </p>
      <div className="grid gap-6 desktop:grid-cols-2">
        <div id="mwc-dropoff" className="scroll-mt-4">
          <PlatformCard
            title="Místa ztráty zákazníků"
            description="Kde zájemci opouštějí rozhodovací proces (rozhodovací cesta)"
            action={
              <PlatformStatusBadge tone="warning">
                Pokles ve kroku Finance
              </PlatformStatusBadge>
            }
          >
            <FunnelRow label="Prohlídka" width={100} value="1000" />
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
              <MetricBox label="Doporučení AI" value="Doplnit kalkulačku" />
            </div>
          </PlatformCard>
        </div>

        <div id="mwc-factors" className="scroll-mt-4">
          <PlatformCard
            title="Co ovlivňuje rozhodnutí zákazníků"
            description="Váha parametrů při vytváření osobního rozhodovacího profilu"
            action={
              <PlatformStatusBadge tone="gold">
                Top: Cena & Splátka
              </PlatformStatusBadge>
            }
          >
            <div className="grid gap-4 desktop:grid-cols-[1fr_200px]">
              <div>
                <FactorRow label="Celková cena" width={92} value="92" />
                <FactorRow label="Měsíční splátka" width={87} value="87" />
                <FactorRow label="Energetická úspora" width={76} value="76" />
                <FactorRow label="Dispozice domu" width={69} value="69" />
                <FactorRow label="Velikost pozemku" width={58} value="58" />
                <FactorRow label="Design & Architektura" width={44} value="44" />
              </div>
              <div className="rounded-[14px] border border-[var(--platform-line)] bg-[var(--platform-cream-light)] p-4">
                <div className="text-[12px] text-[var(--platform-navy)]">
                  Nejsilnější faktor
                </div>
                <div className="mt-1 text-[28px] font-bold text-[var(--platform-navy)]">
                  Cena
                </div>
                <div className="mt-4 text-[12px] font-semibold text-[var(--platform-navy)]">
                  Průměrná změna priorit
                </div>
                <div className="mt-1 text-[18px] font-bold text-[var(--platform-navy)]">
                  +31 %
                </div>
                <div className="mt-4 text-[12px] font-semibold text-[var(--platform-navy)]">
                  Nejcitlivější okamžik
                </div>
                <div className="mt-1 text-sm font-bold text-[var(--platform-navy)]">
                  Finanční kalkulace
                </div>
              </div>
            </div>
          </PlatformCard>
        </div>
      </div>

      <div id="mwc-improvements" className="scroll-mt-4">
        <PlatformCard
          title="Doporučená vylepšení zážitkové vrstvy"
          description="Automatická diagnostika z rozhodovacích signálů pro zvýšení jistoty klientů"
        >
          <div className="grid gap-4 desktop:grid-cols-3">
            <ImproveCard
              tone="info"
              impact="Vysoký dopad"
              title="Doplnit časté otázky k financování"
              detail="AI detekuje opuštění ve fázi Finance. Zodpovězení splátek předem odstraní nejistotu."
            />
            <ImproveCard
              tone="info"
              impact="Vysoký dopad"
              title="Propojení navigátoru domu s FVE"
              detail="Klienti řešící energetickou úsporu vyžadují pohled na střechu a orientaci ke světlu."
            />
            <ImproveCard
              tone="info"
              impact="Střední dopad"
              title="Rozšíření fotogalerie interiéru"
              detail="Opakované návraty do úvodní sekce indikují potřebu většího množství reálných detailů."
            />
          </div>
        </PlatformCard>
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
    <div className="rounded-[12px] border border-[var(--platform-line)] bg-[var(--platform-cream-light)] p-4">
      <PlatformStatusBadge tone={tone}>{impact}</PlatformStatusBadge>
      <h4 className="mt-2 text-[15px] font-semibold text-[var(--platform-navy)]">
        {title}
      </h4>
      <p className="mt-1 text-[12px] text-[var(--platform-navy)]">{detail}</p>
    </div>
  );
}
