/**
 * SR-001 / SR-002 — Sales Studio: jedna pracovní obrazovka.
 * IA: Sales = zájemce · titulek = aktivní dům · breadcrumb bez názvu domu.
 */

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
  PlatformCard,
  PlatformShell,
  PlatformStatusBadge,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import {
  HIGH_INTENT_THRESHOLD,
  SALES_CLIENTS,
  clientPrimaryScore,
  houseDetailLine,
  houseListLine,
  resolveActiveHouse,
  type SalesClient,
} from './sales/salesClients';
import { getSalesCapabilityHost } from './studio/salesStudioComposition';

type IntentFilter = 'all' | 'high';

function matchesQuery(client: SalesClient, query: string): boolean {
  if (query.length === 0) return true;
  const houseText = client.houses
    .map((house) => `${house.houseName} ${house.land}`)
    .join(' ');
  const haystack = `${client.name} ${houseText}`.toLowerCase();
  return haystack.includes(query);
}

export function SalesStudioApp() {
  const { session, bootstrap, logout, clearStudio, selectStudio } =
    usePlatformSession();
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const [activeClientId, setActiveClientId] = useState(SALES_CLIENTS[0].id);
  const [activeHouseId, setActiveHouseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all');

  const query = searchQuery.trim().toLowerCase();
  const visibleClients = SALES_CLIENTS.filter((client) => {
    if (!matchesQuery(client, query)) return false;
    if (
      intentFilter === 'high' &&
      clientPrimaryScore(client) < HIGH_INTENT_THRESHOLD
    ) {
      return false;
    }
    return true;
  });

  const activeClient =
    visibleClients.find((client) => client.id === activeClientId) ??
    visibleClients[0] ??
    SALES_CLIENTS[0];

  const activeHouse = resolveActiveHouse(
    activeClient,
    activeClient.id === activeClientId ? activeHouseId : null,
  );

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: bootstrap?.company.name ?? 'Firma',
    projectLabel: bootstrap?.project?.name ?? '—',
    projects: [],
  });

  // SR-002 — CONIS / Sales / Projekt / Zájemce (bez názvu domu).
  const projectCrumb =
    bootstrap?.company.name ?? bootstrap?.project?.name ?? 'Projekt';
  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Sales' },
    { id: 'project', label: projectCrumb },
    { id: 'prospect', label: activeClient.name },
  ];

  const highIntentCount = SALES_CLIENTS.filter(
    (client) => clientPrimaryScore(client) >= HIGH_INTENT_THRESHOLD,
  ).length;

  function selectClient(clientId: string) {
    setActiveClientId(clientId);
    setActiveHouseId(null);
  }

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
      <main className="platform-studio-pad sales-desk min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="sales-desk__canvas">
          <header className="platform-title-bar sales-desk__title-bar">
            <div>
              <h1 className="platform-type-h1 sales-desk__house-title">
                {activeHouse.houseName}
              </h1>
              <p className="sales-desk__prospect-name">{activeClient.name}</p>
              <ul
                className="sales-desk__house-list"
                aria-label="Domy se zájmem"
              >
                {activeClient.houses.map((house) => {
                  const selected = house.id === activeHouse.id;
                  return (
                    <li key={house.id}>
                      <button
                        type="button"
                        className={`sales-desk__house-chip${selected ? ' sales-desk__house-chip--active' : ''}`}
                        onClick={() => setActiveHouseId(house.id)}
                        aria-current={selected ? 'true' : undefined}
                      >
                        <span>{house.houseName}</span>
                        <span className="sales-desk__house-chip-score">
                          {house.score} %
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <PlatformStatusBadge tone="gold">
              {`● ${highIntentCount} klienti s vysokou rozhodovací jistotou`}
            </PlatformStatusBadge>
          </header>

          <div className="sales-desk__grid">
            <PlatformCard
              className="sales-desk__cases"
              title="Případy k hovoru"
            >
              <label className="sales-desk__search">
                <span className="sr-only">Vyhledávání zájemců</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Hledat zájemce…"
                  className="sales-desk__search-input"
                />
              </label>

              <div
                className="sales-desk__filters"
                role="group"
                aria-label="Filtry případů"
              >
                <button
                  type="button"
                  className={`sales-desk__filter${intentFilter === 'all' ? ' sales-desk__filter--active' : ''}`}
                  onClick={() => setIntentFilter('all')}
                >
                  Všichni
                </button>
                <button
                  type="button"
                  className={`sales-desk__filter${intentFilter === 'high' ? ' sales-desk__filter--active' : ''}`}
                  onClick={() => setIntentFilter('high')}
                >
                  Vysoká jistota
                </button>
              </div>

              <ul className="sales-desk__client-list">
                {visibleClients.map((client) => {
                  const active = client.id === activeClient.id;
                  const primary = resolveActiveHouse(
                    client,
                    active && activeHouseId !== null ? activeHouseId : null,
                  );
                  return (
                    <li key={client.id}>
                      <button
                        type="button"
                        className={`sales-desk__client${active ? ' sales-desk__client--active' : ''}`}
                        onClick={() => selectClient(client.id)}
                        aria-current={active ? 'true' : undefined}
                      >
                        <div className="sales-desk__client-head">
                          <span className="sales-desk__client-name">
                            {client.name}
                          </span>
                          <span className="sales-desk__intent-score">
                            {primary.score} % Jistota
                          </span>
                        </div>
                        <p className="sales-desk__client-project">
                          {houseListLine(primary)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {visibleClients.length === 0 ? (
                <p className="sales-desk__empty">Žádný zájemce neodpovídá.</p>
              ) : null}
            </PlatformCard>

            <PlatformCard title="Detail nákupního záměru">
              <h2 className="sales-desk__detail-name">{activeClient.name}</h2>
              <p className="sales-desk__detail-project">
                {houseDetailLine(activeHouse)}
              </p>

              <div className="sales-desk__meter">
                <div className="sales-desk__meter-header">
                  <span>Index rozhodovací jistoty</span>
                  <span>{activeHouse.score} %</span>
                </div>
                <div className="sales-desk__meter-track">
                  <div
                    className="sales-desk__meter-fill"
                    style={{ width: `${activeHouse.score}%` }}
                  />
                </div>
              </div>

              <p className="platform-type-section sales-desk__priorities-label">
                Hlavní deklarované priority
              </p>
              <div className="sales-desk__tags">
                {activeHouse.tags.map((tag, index) => (
                  <PlatformStatusBadge
                    key={tag}
                    tone={index === 0 ? 'gold' : 'info'}
                  >
                    {tag}
                  </PlatformStatusBadge>
                ))}
              </div>

              <div className="sales-desk__insight">
                <h4>Doporučené téma rozhovoru</h4>
                <p>{activeHouse.insight}</p>
              </div>
            </PlatformCard>

            <PlatformCard
              title="Rozhodovací cesta (Decision Journey)"
              description="Pasivní chování vs. reálné Decision Signals"
            >
              <div className="sales-desk__timeline">
                {activeHouse.journey.map((step) => {
                  const stateClass = step.active
                    ? ' sales-desk__step--active'
                    : step.completed
                      ? ' sales-desk__step--completed'
                      : '';
                  return (
                    <div
                      key={`${step.module}-${step.title}`}
                      className={`sales-desk__step${stateClass}`}
                    >
                      <span className="sales-desk__step-node" aria-hidden />
                      <p className="sales-desk__step-module">{step.module}</p>
                      <p className="sales-desk__step-title">{step.title}</p>
                      <p className="sales-desk__step-detail">{step.detail}</p>
                    </div>
                  );
                })}
              </div>
            </PlatformCard>
          </div>
        </div>
      </main>
    </PlatformShell>
  );
}
