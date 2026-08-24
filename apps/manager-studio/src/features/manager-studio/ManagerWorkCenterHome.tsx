import {
  managerHouseIntelligence,
  managerProjectIntelligence,
  useHouseOperationalCases,
  type ManagerHouseIntelligence,
} from "@embed-engine/platform-access";
import {
  PlatformCard,
  PlatformStatusBadge,
} from "@embed-engine/platform-shell";

function formatPercent(value: number | null): string {
  return value === null ? "Zatím neměřeno" : `${Math.round(value)} %`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Product definition of the approved "Index ztráty zájmu".
 *
 * It is NOT a sequential funnel/drop-off claim.
 *
 * It expresses the share of REAL Profiles for which CONIS did not capture
 * the selected decision signal. This gives the manager a comparable
 * weakening indicator without inventing anonymous visitor denominators.
 */
function lossOfInterestIndex(
  signalProfiles: number,
  realProfiles: number,
): number | null {
  if (realProfiles === 0) return null;

  return clampPercent(((realProfiles - signalProfiles) / realProfiles) * 100);
}

const ROOM_LABELS: Readonly<Record<string, string>> = {
  exterior: "Exteriér",
  kitchen: "Kuchyně",
  "living-room": "Obývací pokoj",
  vestibule: "Zádveří",
  wardrobe: "Šatna",
  bedroom: "Ložnice",
  bathroom: "Koupelna",
  toilet: "WC",
  "children-room": "Dětský pokoj",
  office: "Pracovna",
  "technical-room": "Technická místnost",
};

function roomLabel(roomId: string): string {
  const canonical = ROOM_LABELS[roomId];
  if (canonical !== undefined) return canonical;

  return roomId
    .replace(/[-_]+/g, " ")
    .replace(/^\p{Ll}/u, (value) => value.toUpperCase());
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
          <div className="grid gap-5 desktop:grid-cols-[1fr_300px]">
            <div>
              <p className="text-sm text-[var(--platform-navy)] opacity-70">
                Jakmile začnou vznikat reálné Profily zájemce, CONIS zde ukáže
                jejich připravenost, rozhodovací trajektorii a podklady pro
                zlepšení Client Experience.
              </p>
            </div>

            <div className="rounded-[14px] bg-[var(--platform-cream-light)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--platform-accent)]">
                Pre-data stav
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--platform-navy)]">
                Žádné metriky ani doporučení nejsou dopočítávány z reference
                dat.
              </p>
            </div>
          </div>
        </PlatformCard>
      </section>
    );
  }

  const measured = intelligence.measuredReadinessCount;
  const highReadiness = intelligence.readinessDistribution["75-100"];

  const lossSignals = [
    {
      id: "tour",
      label: "TOUR",
      value: lossOfInterestIndex(
        intelligence.trajectory.tourProfiles,
        intelligence.realProfileCount,
      ),
    },
    {
      id: "priorities",
      label: "Priority",
      value: lossOfInterestIndex(
        intelligence.trajectory.priorityProfiles,
        intelligence.realProfileCount,
      ),
    },
    {
      id: "faq",
      label: "FAQ",
      value: lossOfInterestIndex(
        intelligence.trajectory.faqProfiles,
        intelligence.realProfileCount,
      ),
    },
    {
      id: "chat",
      label: "Chat",
      value: lossOfInterestIndex(
        intelligence.trajectory.chatProfiles,
        intelligence.realProfileCount,
      ),
    },
    {
      id: "tour-return",
      label: "Návrat do TOUR",
      value: lossOfInterestIndex(
        intelligence.trajectory.tourReturnProfiles,
        intelligence.realProfileCount,
      ),
    },
  ] as const;

  return (
    <section id="manager-work-center" className="mb-8 space-y-6">
      <div className="grid gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-6">
          <ExecutiveDashboard
            intelligence={intelligence}
            measured={measured}
            highReadiness={highReadiness}
          />

          <section id="manager-readiness">
            <div className="grid gap-5 min-[900px]:grid-cols-2">
              <PlatformCard
                title="Připravenost zákazníků"
                description="Distribuce skutečně měřených Profilů podle Indexu připravenosti."
                action={
                  <PlatformStatusBadge tone="gold">
                    Kvalita pipeline
                  </PlatformStatusBadge>
                }
              >
                <ReadinessDistribution intelligence={intelligence} />
              </PlatformCard>

              <PlatformCard
                title="Co rozhoduje"
                description="Nejsilnější deklarovaná témata v Profilech zájemce."
                action={
                  intelligence.priorities[0] === undefined ? undefined : (
                    <PlatformStatusBadge tone="gold">
                      {`Top: ${intelligence.priorities[0].label}`}
                    </PlatformStatusBadge>
                  )
                }
              >
                <PriorityChart intelligence={intelligence} />
              </PlatformCard>
            </div>
          </section>

          <section id="manager-trajectory">
            <PlatformCard
              title="Rozhodovací trajektorie"
              description="Skutečně zachycené rozhodovací signály. Nejde o anonymní návštěvnický funnel."
            >
              <TrajectoryVisual intelligence={intelligence} />
            </PlatformCard>
          </section>

          <section id="manager-interests">
            <div className="grid gap-5 min-[900px]:grid-cols-2">
              <PlatformCard
                title="Průměrná připravenost zájemce"
                description="Rychlá manažerská interpretace průměrného Indexu."
                action={
                  <PlatformStatusBadge tone="gold">Ø Index</PlatformStatusBadge>
                }
              >
                <AverageReadinessDonut
                  average={intelligence.averageReadiness}
                  highReadiness={highReadiness}
                />
              </PlatformCard>

              <PlatformCard
                title="Index ztráty zájmu"
                description="Podíl REAL profilů bez zachyceného signálu v dané oblasti. Nejde o prokázaný sekvenční drop-off."
                action={
                  <PlatformStatusBadge tone="gold">
                    Signál oslabení
                  </PlatformStatusBadge>
                }
              >
                <LossOfInterestChart items={lossSignals} />
              </PlatformCard>
            </div>

            <div className="mt-5">
              <PlatformCard
                title="Co si klienti ověřují"
                description="FAQ jako místo aktivního hledání jistoty."
              >
                {intelligence.faq.length === 0 ? (
                  <EmptyEvidence />
                ) : (
                  intelligence.faq
                    .slice(0, 5)
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
            </div>
          </section>

          <section id="manager-engagement">
            <div className="grid gap-5 min-[900px]:grid-cols-2">
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
                        label={roomLabel(room.roomId)}
                        primary={`${room.profileCount} profilů`}
                        secondary={`${room.repeatVisitCount} opakovaných návštěv`}
                      />
                    ))
                )}
              </PlatformCard>

              <PlatformCard
                title="Média a video"
                description="Opakované prohlížení a přehrávání jako další známka rozhodovací práce."
              >
                <MediaEvidence intelligence={intelligence} />
              </PlatformCard>
            </div>
          </section>

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

          <section id="manager-improvements">
            <PlatformCard
              title="Doporučená vylepšení Experience"
              description="CONIS vidí vzorec → ukáže důkazy → navrhne zásah."
            >
              {intelligence.recommendations.length === 0 ? (
                <p className="text-sm text-[var(--platform-navy)] opacity-70">
                  Zatím není dostatek evidence pro spolehlivé doporučení.
                </p>
              ) : (
                <div className="grid gap-3">
                  {intelligence.recommendations.map((item, index) => (
                    <article
                      key={item.id}
                      className="grid gap-3 rounded-[14px] border border-[var(--platform-line)] bg-[var(--platform-cream-light)] p-4 tablet:grid-cols-[32px_1fr]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--platform-accent)] text-xs font-bold text-white">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-bold text-[var(--platform-navy)]">
                          {item.observation}
                        </p>

                        <ul className="mt-2 space-y-1 text-sm text-[var(--platform-navy)] opacity-70">
                          {item.evidence.map((evidence) => (
                            <li key={evidence}>{evidence}</li>
                          ))}
                        </ul>

                        <p className="mt-3 text-sm font-semibold text-[var(--platform-navy)]">
                          Doporučení: {item.recommendation}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </PlatformCard>
          </section>
        </div>

        <ManagerAttentionRail
          intelligence={intelligence}
          highReadiness={highReadiness}
        />
      </div>
    </section>
  );
}

function ExecutiveDashboard({
  intelligence,
  measured,
  highReadiness,
}: {
  readonly intelligence: ManagerHouseIntelligence;
  readonly measured: number;
  readonly highReadiness: number;
}) {
  return (
    <PlatformCard
      title="Jak si projekt vede a co změnit"
      description="Rychlý obraz kvality zájemců, rozhodovacích témat a příležitostí ke zlepšení Experience."
      action={
        <PlatformStatusBadge tone="gold">
          Manager Intelligence
        </PlatformStatusBadge>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2 text-[11px] text-[var(--platform-navy)]">
        <span className="rounded-full border border-[var(--platform-accent)] bg-[var(--platform-cream-light)] px-3 py-1.5 font-bold">
          PILOT
        </span>
        <span className="rounded-full border border-[var(--platform-line)] px-3 py-1.5">
          MTD {intelligence.profilePeriods.monthToDate}
        </span>
        <span className="rounded-full border border-[var(--platform-line)] px-3 py-1.5">
          QTD {intelligence.profilePeriods.quarterToDate}
        </span>
        <span className="rounded-full border border-[var(--platform-line)] px-3 py-1.5">
          YTD {intelligence.profilePeriods.yearToDate}
        </span>
      </div>

      <div className="grid gap-3 tablet:grid-cols-2 min-[900px]:grid-cols-4">
        <MetricBox
          label="Profily zájemce"
          value={String(intelligence.realProfileCount)}
          detail="reálné obchodní případy"
        />
        <MetricBox
          label="Ø Index připravenosti"
          value={formatPercent(intelligence.averageReadiness)}
          detail={`${measured} měřených profilů`}
        />
        <MetricBox
          label="Vysoká připravenost"
          value={String(highReadiness)}
          detail="pásmo 75–100"
        />
        <MetricBox
          label="Konverze"
          value={String(intelligence.trajectory.convertedProfiles)}
          detail="zachycené konverzní případy"
        />
      </div>
    </PlatformCard>
  );
}

function MetricBox({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--platform-line)] bg-[var(--platform-cream-light)] px-4 py-4 text-[var(--platform-navy)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-60">
        {label}
      </p>
      <b className="mt-2 block text-[28px] leading-none">{value}</b>
      <p className="mt-2 text-[11px] opacity-60">{detail}</p>
    </div>
  );
}

function ReadinessDistribution({
  intelligence,
}: {
  readonly intelligence: ManagerHouseIntelligence;
}) {
  const values = [
    ["0–24", intelligence.readinessDistribution["0-24"]],
    ["25–49", intelligence.readinessDistribution["25-49"]],
    ["50–74", intelligence.readinessDistribution["50-74"]],
    ["75–100", intelligence.readinessDistribution["75-100"]],
  ] as const;

  const max = Math.max(1, ...values.map(([, value]) => value));

  return (
    <div className="grid h-[190px] grid-cols-4 items-end gap-3 pt-4">
      {values.map(([label, value], index) => (
        <div
          key={label}
          className="flex h-full flex-col justify-end text-center"
        >
          <div className="flex h-[130px] items-end rounded-[10px] bg-[var(--platform-cream-light)] px-2">
            <div
              className={[
                "w-full rounded-t-[8px]",
                index === 3
                  ? "bg-[var(--platform-accent)]"
                  : "bg-[var(--platform-navy)]",
              ].join(" ")}
              style={{
                height: `${Math.max(
                  value === 0 ? 4 : 12,
                  (value / max) * 100,
                )}%`,
              }}
            />
          </div>

          <b className="mt-2 text-sm text-[var(--platform-navy)]">{value}</b>
          <span className="text-[10px] text-[var(--platform-navy)] opacity-55">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function AverageReadinessDonut({
  average,
  highReadiness,
}: {
  readonly average: number | null;
  readonly highReadiness: number;
}) {
  const value = average === null ? 0 : clampPercent(average);

  const background =
    average === null
      ? "conic-gradient(var(--platform-line) 0 100%)"
      : `conic-gradient(var(--platform-accent) 0 ${value}%, var(--platform-line) ${value}% 100%)`;

  return (
    <div className="grid items-center gap-5 tablet:grid-cols-[160px_1fr]">
      <div className="relative mx-auto h-[150px] w-[150px]">
        <div className="absolute inset-0 rounded-full" style={{ background }} />
        <div className="absolute inset-[18px] flex items-center justify-center rounded-full bg-white text-center">
          <div>
            <b className="block text-[28px] leading-none text-[var(--platform-navy)]">
              {formatPercent(average)}
            </b>
            <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--platform-navy)] opacity-50">
              průměrná připravenost
            </span>
          </div>
        </div>
      </div>

      <div className="text-sm text-[var(--platform-navy)]">
        <p className="font-semibold">
          Index vyjadřuje rozsah zachycené rozhodovací práce, nikoli
          pravděpodobnost nákupu.
        </p>

        <p className="mt-3 text-xs opacity-65">
          V pásmu nejvyšší připravenosti 75–100 je aktuálně {highReadiness}{" "}
          profilů.
        </p>
      </div>
    </div>
  );
}

function TrajectoryVisual({
  intelligence,
}: {
  readonly intelligence: ManagerHouseIntelligence;
}) {
  const items = [
    ["TOUR", intelligence.trajectory.tourProfiles],
    ["Priority", intelligence.trajectory.priorityProfiles],
    ["FAQ", intelligence.trajectory.faqProfiles],
    ["Chat", intelligence.trajectory.chatProfiles],
    ["Návraty", intelligence.trajectory.tourReturnProfiles],
    ["Konverze", intelligence.trajectory.convertedProfiles],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
      {items.map(([label, value], index) => (
        <div
          key={label}
          className={[
            "rounded-[12px] border p-3 text-center",
            index === 2 || index === 5
              ? "border-[var(--platform-accent)] bg-[var(--platform-cream-light)]"
              : "border-[var(--platform-line)] bg-white",
          ].join(" ")}
        >
          <b className="block text-xl text-[var(--platform-navy)]">{value}</b>
          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--platform-navy)] opacity-55">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function LossOfInterestChart({
  items,
}: {
  readonly items: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: number | null;
  }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[105px_1fr_46px] items-center gap-3"
        >
          <span className="text-xs font-semibold text-[var(--platform-navy)]">
            {item.label}
          </span>

          <div className="h-3 overflow-hidden rounded-full bg-[var(--platform-line)]">
            <div
              className="h-full rounded-full bg-[var(--platform-accent)]"
              style={{
                width: `${item.value ?? 0}%`,
              }}
            />
          </div>

          <b className="text-right text-xs text-[var(--platform-navy)]">
            {item.value === null ? "—" : `${item.value} %`}
          </b>
        </div>
      ))}

      <p className="pt-2 text-[10px] leading-relaxed text-[var(--platform-navy)] opacity-55">
        Index ztráty zájmu je manažerský indikátor chybějícího rozhodovacího
        signálu mezi REAL Profily. Není interpretován jako anonymní návštěvnický
        drop-off.
      </p>
    </div>
  );
}

function PriorityChart({
  intelligence,
}: {
  readonly intelligence: ManagerHouseIntelligence;
}) {
  if (intelligence.priorities.length === 0) {
    return <EmptyEvidence />;
  }

  return (
    <div className="space-y-3">
      {intelligence.priorities.slice(0, 6).map((priority) => {
        const percent =
          priority.averageImportance === null
            ? 0
            : clampPercent(priority.averageImportance * 100);

        return (
          <div
            key={priority.id}
            className="grid grid-cols-[105px_1fr_44px] items-center gap-3"
          >
            <span className="truncate text-xs font-semibold text-[var(--platform-navy)]">
              {priority.label}
            </span>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--platform-line)]">
              <div
                className="h-full rounded-full bg-[var(--platform-accent)]"
                style={{ width: `${percent}%` }}
              />
            </div>

            <b className="text-right text-xs text-[var(--platform-navy)]">
              {priority.averageImportance === null ? "—" : `${percent}%`}
            </b>
          </div>
        );
      })}
    </div>
  );
}

function MediaEvidence({
  intelligence,
}: {
  readonly intelligence: ManagerHouseIntelligence;
}) {
  const topImage = intelligence.media[0];
  const topVideo = intelligence.video[0];

  if (topImage === undefined && topVideo === undefined) {
    return <EmptyEvidence />;
  }

  return (
    <div>
      {topImage === undefined ? null : (
        <EvidenceRow
          label="Nejsledovanější obrazový obsah"
          primary={`${topImage.profileCount} profilů`}
          secondary={`${topImage.repeatViewCount} opakovaných zobrazení`}
        />
      )}

      {topVideo === undefined ? null : (
        <>
          <EvidenceRow
            label="Video — spuštění"
            primary={`${topVideo.profileCount} profilů`}
            secondary={`${topVideo.startCount} skutečných spuštění`}
          />
          <EvidenceRow
            label="Video — ≥50 %"
            primary={`${topVideo.halfProfileCount} profilů`}
            secondary="dosáhlo poloviny videa"
          />
          <EvidenceRow
            label="Video — dokončeno"
            primary={`${topVideo.completedProfileCount} profilů`}
            secondary={`${topVideo.replayProfileCount} profilů video spustilo znovu`}
          />
        </>
      )}
    </div>
  );
}

function ManagerAttentionRail({
  intelligence,
  highReadiness,
}: {
  readonly intelligence: ManagerHouseIntelligence;
  readonly highReadiness: number;
}) {
  const recommendations = intelligence.recommendations.slice(0, 3);

  return (
    <aside className="space-y-4 min-[1180px]:sticky min-[1180px]:top-4">
      <PlatformCard
        title="Vyžaduje pozornost"
        description="Nejdůležitější doložené signály pro manažerské rozhodnutí."
      >
        <div className="space-y-4">
          {highReadiness > 0 ? (
            <AttentionItem
              index={1}
              title={`${highReadiness} profilů má vysokou připravenost`}
              detail="Konkrétní případy a jejich rozhodovací cesta jsou dostupné v Sales Studiu."
            />
          ) : null}

          {recommendations.map((item, index) => (
            <AttentionItem
              key={item.id}
              index={index + (highReadiness > 0 ? 2 : 1)}
              title={item.observation}
              detail={item.recommendation}
            />
          ))}

          {highReadiness === 0 && recommendations.length === 0 ? (
            <p className="text-sm text-[var(--platform-navy)] opacity-65">
              Zatím není zachycen signál, který by vyžadoval manažerskou
              pozornost.
            </p>
          ) : null}
        </div>
      </PlatformCard>

      <PlatformCard
        title="Manažerské shrnutí"
        description="CONIS převádí zachycené rozhodovací signály do srozumitelného obrazu."
      >
        <p className="text-sm leading-relaxed text-[var(--platform-navy)] opacity-75">
          Dashboard ukazuje, jakou rozhodovací práci zákazníci před kontaktem
          skutečně udělali, co aktivně ověřovali a kde má Experience prostor ke
          zlepšení.
        </p>
      </PlatformCard>
    </aside>
  );
}

function AttentionItem({
  index,
  title,
  detail,
}: {
  readonly index: number;
  readonly title: string;
  readonly detail: string;
}) {
  return (
    <div className="border-b border-[var(--platform-line)] pb-4 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--platform-cream-light)] text-[10px] font-bold text-[var(--platform-accent)]">
          {index}
        </span>

        <div>
          <p className="text-sm font-bold text-[var(--platform-navy)]">
            {title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--platform-navy)] opacity-60">
            {detail}
          </p>
        </div>
      </div>
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
