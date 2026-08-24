import {
  managerHouseIntelligence,
  managerProjectIntelligence,
  useHouseOperationalCases,
} from "@embed-engine/platform-access";
import {
  PlatformCard,
  PlatformStatusBadge,
} from "@embed-engine/platform-shell";

function formatPercent(value: number | null): string {
  return value === null ? "Zatím neměřeno" : `${Math.round(value)} %`;
}

export function ManagerWorkCenterHome() {
  const operational = useHouseOperationalCases();

  const visibleHouseId =
    operational.activeHouseId ??
    operational.cases[0]?.houseId ??
    operational.houses[0]?.houseId ??
    "project";

  const visibleHouseName =
    operational.activeHouseName ??
    (operational.activeHouseId === null
      ? "Celý projekt"
      : (operational.cases[0]?.houseName ?? "Dům"));

  const houseIntelligences = operational.houses.map((house) =>
    managerHouseIntelligence({
      houseId: house.houseId,
      houseName: house.houseName,
      cases: operational.cases.filter((item) => item.houseId === house.houseId),
      decisionSnapshots: operational.decisionSessions.filter(
        (item) => item.houseId === house.houseId,
      ),
    }),
  );

  const projectIntelligence =
    operational.activeHouseId === null
      ? managerProjectIntelligence(houseIntelligences)
      : null;

  const intelligence =
    operational.activeHouseId === null
      ? managerHouseIntelligence({
          houseId: visibleHouseId,
          houseName: visibleHouseName,
          cases: operational.cases,
          decisionSnapshots: operational.decisionSessions,
        })
      : (houseIntelligences.find(
          (item) => item.houseId === operational.activeHouseId,
        ) ??
        managerHouseIntelligence({
          houseId: visibleHouseId,
          houseName: visibleHouseName,
          cases: operational.cases,
          decisionSnapshots: operational.decisionSessions,
        }));

  if (intelligence.preData) {
    return (
      <section
        id="manager-work-center"
        className="mb-8"
        data-testid="manager-operational-empty"
      >
        <PlatformCard
          title="Manager Intelligence"
          description="Pro tento dům zatím nejsou k dispozici skutečná provozní data."
        >
          <p className="text-sm text-[var(--platform-navy)] opacity-70">
            Jakmile začnou vznikat reálné Profily zájemce, CONIS zde ukáže
            jejich připravenost, rozhodovací trajektorii a podklady pro zlepšení
            Client Experience.
          </p>
        </PlatformCard>
      </section>
    );
  }

  const measured = intelligence.measuredReadinessCount;

  return (
    <section id="manager-work-center" className="mb-8 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--platform-accent)]">
          Manager Intelligence
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--platform-navy)]">
          Co nám zákazníci říkají o tomto domě
        </h2>
        <p className="mt-1 text-sm text-[var(--platform-navy)] opacity-70">
          Pouze skutečná House-scoped data. Reference případy nejsou součástí
          obchodních KPI.
        </p>
      </div>

      <PlatformCard
        title="Připravenost klientů"
        description="Index připravenosti vyjadřuje zachycenou rozhodovací práci, nikoli pravděpodobnost nákupu."
      >
        <div className="mb-5 grid gap-3 tablet:grid-cols-3">
          <MetricBox
            label="Tento měsíc"
            value={String(intelligence.profilePeriods.monthToDate)}
          />
          <MetricBox
            label="Tento kvartál"
            value={String(intelligence.profilePeriods.quarterToDate)}
          />
          <MetricBox
            label="Tento rok"
            value={String(intelligence.profilePeriods.yearToDate)}
          />
        </div>

        <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
          <MetricBox
            label="Profily zájemce"
            value={String(intelligence.realProfileCount)}
          />
          <MetricBox label="Měřené profily" value={String(measured)} />
          <MetricBox
            label="Ø Index připravenosti"
            value={formatPercent(intelligence.averageReadiness)}
          />
          <MetricBox
            label="Přijaté případy"
            value={String(intelligence.acceptedCaseCount)}
          />
        </div>

        <div className="mt-5 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
          {(
            [
              ["0–24", intelligence.readinessDistribution["0-24"]],
              ["25–49", intelligence.readinessDistribution["25-49"]],
              ["50–74", intelligence.readinessDistribution["50-74"]],
              ["75–100", intelligence.readinessDistribution["75-100"]],
            ] as const
          ).map(([label, value]) => (
            <MetricBox
              key={label}
              label={`Index ${label}`}
              value={String(value)}
            />
          ))}
        </div>
      </PlatformCard>

      <div className="grid gap-6 desktop:grid-cols-2">
        <PlatformCard
          title="Rozhodovací trajektorie"
          description="Skutečně zachycené signály mezi Profily zájemce. Nejde o návštěvnický drop-off funnel."
        >
          <TrajectoryRow
            label="TOUR"
            value={intelligence.trajectory.tourProfiles}
            denominator={intelligence.realProfileCount}
          />
          <TrajectoryRow
            label="Priority"
            value={intelligence.trajectory.priorityProfiles}
            denominator={intelligence.realProfileCount}
          />
          <TrajectoryRow
            label="FAQ"
            value={intelligence.trajectory.faqProfiles}
            denominator={intelligence.realProfileCount}
          />
          <TrajectoryRow
            label="Chat"
            value={intelligence.trajectory.chatProfiles}
            denominator={intelligence.realProfileCount}
          />
          <TrajectoryRow
            label="Návrat do TOUR"
            value={intelligence.trajectory.tourReturnProfiles}
            denominator={intelligence.realProfileCount}
          />
        </PlatformCard>

        <PlatformCard
          title="Co klienty skutečně zajímá"
          description="Priority deklarované v Profilu zájemce."
          action={
            intelligence.priorities[0] === undefined ? undefined : (
              <PlatformStatusBadge tone="gold">
                {`Top: ${intelligence.priorities[0].label}`}
              </PlatformStatusBadge>
            )
          }
        >
          {intelligence.priorities.length === 0 ? (
            <EmptyEvidence />
          ) : (
            intelligence.priorities
              .slice(0, 6)
              .map((priority) => (
                <EvidenceRow
                  key={priority.id}
                  label={priority.label}
                  primary={`${priority.profileCount} profilů`}
                  secondary={
                    priority.averageImportance === null
                      ? "Intenzita zatím neměřena"
                      : `Ø intenzita ${Math.round(priority.averageImportance * 100)} %`
                  }
                />
              ))
          )}
        </PlatformCard>
      </div>

      <div className="grid gap-6 desktop:grid-cols-2">
        <PlatformCard
          title="FAQ"
          description="Otázky, které si klienti aktivně ověřují."
        >
          {intelligence.faq.length === 0 ? (
            <EmptyEvidence />
          ) : (
            intelligence.faq
              .slice(0, 6)
              .map((item) => (
                <EvidenceRow
                  key={item.questionId}
                  label={item.prompt ?? item.questionId}
                  primary={`${item.profileCount} profilů`}
                  secondary={`${item.openCount} otevření`}
                />
              ))
          )}
        </PlatformCard>

        <PlatformCard
          title="Engagement domu"
          description="Místnosti, ke kterým se klienti při rozhodování vracejí."
        >
          {intelligence.rooms.length === 0 ? (
            <EmptyEvidence />
          ) : (
            intelligence.rooms
              .slice(0, 6)
              .map((room) => (
                <EvidenceRow
                  key={room.roomId}
                  label={room.roomId}
                  primary={`${room.profileCount} profilů`}
                  secondary={`${room.repeatVisitCount} opakovaných návštěv`}
                />
              ))
          )}
        </PlatformCard>
      </div>

      {projectIntelligence === null ? null : (
        <PlatformCard
          title="Srovnání domů v projektu"
          description="Každý dům si zachovává vlastní House identitu a vlastní měřená data."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm text-[var(--platform-navy)]">
              <thead>
                <tr className="border-b border-[var(--platform-line)]">
                  <th className="py-2 pr-4">Dům</th>
                  <th className="py-2 pr-4">Profily</th>
                  <th className="py-2 pr-4">Ø Index</th>
                  <th className="py-2">75–100</th>
                </tr>
              </thead>
              <tbody>
                {projectIntelligence.houses.map((house) => (
                  <tr
                    key={house.houseId}
                    className="border-b border-[var(--platform-line)] last:border-0"
                  >
                    <td className="py-3 pr-4 font-semibold">
                      {house.houseName}
                    </td>
                    <td className="py-3 pr-4">{house.realProfileCount}</td>
                    <td className="py-3 pr-4">
                      {formatPercent(house.averageReadiness)}
                    </td>
                    <td className="py-3">
                      {house.preData
                        ? "Zatím bez dat"
                        : house.highReadinessCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PlatformCard>
      )}

      <PlatformCard
        title="Doporučená vylepšení Experience"
        description="Každé doporučení vzniká pouze z doložitelné evidence."
      >
        {intelligence.recommendations.length === 0 ? (
          <p className="text-sm text-[var(--platform-navy)] opacity-70">
            Zatím není dostatek evidence pro spolehlivé doporučení.
          </p>
        ) : (
          <div className="space-y-4">
            {intelligence.recommendations.map((item) => (
              <article
                key={item.id}
                className="rounded-[14px] bg-[var(--platform-cream-light)] p-4"
              >
                <p className="font-bold text-[var(--platform-navy)]">
                  {item.observation}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--platform-navy)] opacity-75">
                  {item.evidence.map((evidence) => (
                    <li key={evidence}>{evidence}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-semibold text-[var(--platform-navy)]">
                  Doporučení: {item.recommendation}
                </p>
              </article>
            ))}
          </div>
        )}
      </PlatformCard>
    </section>
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
      <b className="mt-1 block text-sm">{value}</b>
    </div>
  );
}

function TrajectoryRow({
  label,
  value,
  denominator,
}: {
  readonly label: string;
  readonly value: number;
  readonly denominator: number;
}) {
  const percent =
    denominator === 0 ? null : Math.round((value / denominator) * 100);

  return (
    <div className="mb-3 grid grid-cols-[120px_1fr_auto] items-center gap-3">
      <span className="text-sm font-semibold text-[var(--platform-navy)]">
        {label}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--platform-line)]">
        <div
          className="h-full rounded-full bg-[var(--platform-accent)]"
          style={{ width: `${percent ?? 0}%` }}
        />
      </div>
      <span className="text-right text-sm font-bold text-[var(--platform-navy)]">
        {value} / {denominator}
      </span>
    </div>
  );
}

function EvidenceRow({
  label,
  primary,
  secondary,
}: {
  readonly label: string;
  readonly primary: string;
  readonly secondary: string;
}) {
  return (
    <div className="border-b border-[var(--platform-line)] py-3 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-[var(--platform-navy)]">
          {label}
        </span>
        <span className="text-sm font-bold text-[var(--platform-navy)]">
          {primary}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--platform-navy)] opacity-65">
        {secondary}
      </p>
    </div>
  );
}

function EmptyEvidence() {
  return (
    <p className="text-sm text-[var(--platform-navy)] opacity-70">
      Pro tento pohled zatím není dostatek zachycených dat.
    </p>
  );
}
