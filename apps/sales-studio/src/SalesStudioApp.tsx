import { useMemo, useState } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  CapabilityInspector,
  PlatformCard,
  PlatformShell,
  PlatformStatusBadge,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import { getSalesCapabilityHost } from './studio/salesStudioComposition';

type SalesClient = {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly project: string;
  readonly location: string;
  readonly land: string;
  readonly priorities: readonly string[];
  readonly insight: string;
  readonly journey: readonly {
    readonly label: string;
    readonly state: 'completed' | 'active' | 'pending';
    readonly detail: string;
  }[];
};

const SALES_CLIENTS: readonly SalesClient[] = [
  {
    id: 'novak',
    name: 'Jan Novák',
    score: 88,
    project: 'RD Harmony 124',
    location: 'Opava',
    land: 'Mám pozemek',
    priorities: ['Orientace ke světlu', 'Provozní náklady', 'Dispozice 4+kk'],
    insight:
      'Klient strávil nejvíce času sledováním vazby domu na pozemek v House Navigatoru a prosvětlení obývacího pokoje. Doporučujeme začít rozhovor potvrzením správné orientace domu.',
    journey: [
      {
        label: 'Experience',
        state: 'completed',
        detail: 'Prohlédl Hero a galerii',
      },
      {
        label: 'Priority',
        state: 'completed',
        detail: 'Potvrdil 3 priority',
      },
      {
        label: 'Navigátor',
        state: 'active',
        detail: 'Opakované návraty k orientaci',
      },
      {
        label: 'Finance',
        state: 'pending',
        detail: 'Ještě neotevřeno',
      },
    ],
  },
  {
    id: 'dvorak',
    name: 'Petr Dvořák',
    score: 72,
    project: 'Villa 168',
    location: 'Brno',
    land: 'Hledám pozemek',
    priorities: ['Velikost pozemku', 'Celková cena', 'Design'],
    insight:
      'Klient porovnává varianty pozemku. Otevřete rozhovor nabídkou lokalit a limitem rozpočtu.',
    journey: [
      {
        label: 'Experience',
        state: 'completed',
        detail: 'Krátká návštěva',
      },
      {
        label: 'Priority',
        state: 'active',
        detail: 'Změnil pořadí priorit',
      },
      {
        label: 'Navigátor',
        state: 'pending',
        detail: 'Čeká na pozemek',
      },
      {
        label: 'Finance',
        state: 'pending',
        detail: 'Ještě neotevřeno',
      },
    ],
  },
  {
    id: 'kucerova',
    name: 'Marie Kučerová',
    score: 65,
    project: 'Family 98',
    location: 'Olomouc',
    land: 'Mám pozemek',
    priorities: ['Dispozice', 'Energetická úspora', 'Měsíční splátka'],
    insight:
      'Klientka se vrací k FAQ o spotřebě. Připravte konkrétní čísla FVE a provozních nákladů.',
    journey: [
      {
        label: 'Experience',
        state: 'completed',
        detail: 'Prošla galerii',
      },
      {
        label: 'Priority',
        state: 'completed',
        detail: 'Potvrdila priority',
      },
      {
        label: 'Navigátor',
        state: 'completed',
        detail: 'Prošla dispozici',
      },
      {
        label: 'Finance',
        state: 'active',
        detail: 'Opakované otevření FAQ',
      },
    ],
  },
];

/**
 * PR-006 / PR-015 — Sales: stejná hierarchie jako Builder/Manager
 * (nav rail · title-bar · canvas · inspector).
 */
export function SalesStudioApp() {
  const { session, bootstrap, logout, clearStudio, selectStudio } =
    usePlatformSession();
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('customer-success');
  const [activeClientId, setActiveClientId] = useState(SALES_CLIENTS[0].id);
  const activeClient =
    SALES_CLIENTS.find((client) => client.id === activeClientId) ??
    SALES_CLIENTS[0];

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: bootstrap?.company.name ?? 'Firma',
    projectLabel: bootstrap?.project?.name ?? '—',
    projects: [],
    // PR-006 — horní lišta nepřepíná projekt.
  });

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Sales' },
    { id: 'company', label: bootstrap?.company.name ?? 'Firma' },
    { id: 'project', label: bootstrap?.project?.name ?? 'Projekt' },
    { id: 'section', label: activeClient.name },
  ];

  const highIntentCount = SALES_CLIENTS.filter(
    (client) => client.score >= 70,
  ).length;

  return (
    <PlatformShell
      activeStudioId="sales"
      userLabel={session?.user.displayName ?? 'Host'}
      roleLabel={
        session !== null
          ? PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]
          : undefined
      }
      workspace={workspaceState}
      breadcrumb={breadcrumb}
      capabilityHost={capabilityHost}
      activeCapabilityId="customer-success"
      onLogout={logout}
      onOpenLanding={clearStudio}
      onSelectStudio={selectStudio}
      onSubmitFeedback={(message) => {
        submitPlatformFeedback({
          message,
          email: session?.user.email ?? null,
          studioId: 'sales',
          companyId: session?.companyId ?? null,
        });
        recordPlatformActivity({
          label: 'Zpětná vazba',
          detail: message.slice(0, 80),
        });
      }}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="platform-nav-rail sticky top-0 h-full shrink-0 self-stretch overflow-y-auto">
          <div className="p-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
              Případy k hovoru
            </p>
            <ul className="space-y-2">
              {SALES_CLIENTS.map((client) => {
                const active = client.id === activeClient.id;
                return (
                  <li key={client.id}>
                    <button
                      type="button"
                      onClick={() => setActiveClientId(client.id)}
                      className="w-full rounded-[12px] border px-3.5 py-3 text-left platform-motion"
                      style={{
                        borderColor: active
                          ? 'var(--platform-blue)'
                          : 'var(--platform-line)',
                        background: active
                          ? 'var(--platform-cream-light)'
                          : 'var(--platform-surface)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[var(--platform-ink)]">
                          {client.name}
                        </span>
                        <span className="text-[13px] font-bold text-[var(--platform-blue)]">
                          {client.score} %
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[var(--platform-navy)]">
                        {client.project}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main className="platform-studio-pad min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1520px]">
            <header className="platform-title-bar">
              <div>
                <h1 className="platform-type-h1">Sales Studio</h1>
                <p className="platform-type-helper" style={{ marginTop: 4 }}>
                  {bootstrap?.company.name ?? 'Firma'} ·{' '}
                  {bootstrap?.project?.name ?? 'Projekt'}
                </p>
              </div>
              <PlatformStatusBadge tone="gold">
                {`● ${highIntentCount} klienti s vysokou rozhodovací jistotou`}
              </PlatformStatusBadge>
            </header>

            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              }}
            >
              <PlatformCard title="Detail nákupního záměru">
                <h2 className="mt-2 text-[22px] font-semibold text-[var(--platform-ink)]">
                  {activeClient.name}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--platform-navy)]">
                  {activeClient.project} ({activeClient.location}) ·{' '}
                  {activeClient.land}
                </p>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-[13px] font-semibold">
                    <span>Index rozhodovací jistoty</span>
                    <span>{activeClient.score} %</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#E3E3E3]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${activeClient.score}%`,
                        background: 'var(--platform-blue)',
                      }}
                    />
                  </div>
                </div>

                <p className="platform-type-section mt-5">
                  Hlavní deklarované priority
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeClient.priorities.map((priority, index) => (
                    <PlatformStatusBadge
                      key={priority}
                      tone={index === 0 ? 'gold' : 'info'}
                    >
                      {priority}
                    </PlatformStatusBadge>
                  ))}
                </div>

                <div
                  className="mt-5 rounded-[12px] p-4"
                  style={{
                    borderLeft: '4px solid var(--platform-gold)',
                    background: 'var(--platform-cream-light)',
                  }}
                >
                  <h4 className="text-sm font-semibold text-[var(--platform-ink)]">
                    Doporučené téma rozhovoru
                  </h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--platform-navy)]">
                    {activeClient.insight}
                  </p>
                </div>
              </PlatformCard>

              <PlatformCard
                title="Rozhodovací cesta (Decision Journey)"
                description="Pasivní chování vs. reálné Decision Signals"
              >
                <ol className="mt-3 space-y-4">
                  {activeClient.journey.map((step) => (
                    <li key={step.label} className="flex gap-3">
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{
                          background:
                            step.state === 'completed'
                              ? 'var(--platform-green)'
                              : step.state === 'active'
                                ? 'var(--platform-blue)'
                                : 'var(--platform-line)',
                        }}
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-semibold text-[var(--platform-ink)]">
                          {step.label}
                        </p>
                        <p className="text-[12px] text-[var(--platform-navy)]">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </PlatformCard>
            </div>
          </div>
        </main>

        <div className="platform-inspector-rail sticky top-0 h-full self-stretch overflow-hidden">
          <CapabilityInspector model={inspectorModel} />
        </div>
      </div>
    </PlatformShell>
  );
}
