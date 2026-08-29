/**
 * SR-001 / SR-002 — Sales Studio: jedna pracovní obrazovka.
 * IA: Sales = zájemce · titulek = aktivní dům · breadcrumb bez názvu domu.
 * CAP-PLAT-04j — shell Project list from CPL Projects; desk houses = House ids.
 */

import { useEffect, useMemo, useState } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  listWorkspaceHouses,
  useHouseOperationalCases,
  usePlatformSession,
  useStudioBrandProjection,
  isWorkspaceShellEmbed,
  isHouseInProject,
  createWorkspaceHouseChangeMessage,
  resolveWorkspaceHostHref,
  workspaceStudiosForRoles,
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
  clientPrimaryReadiness,
  formatIndexPripravenosti,
  formatLandIntentPill,
  formatPriorityImportance,
  hasMeasuredReadiness,
  houseListLine,
  listSalesCanonicalProjects,
  resolveSalesActiveProjectId,
  resolveActiveHouse,
  findSalesCaseForContactHouse,
  toSalesClients,
  type SalesClient,
} from './sales/salesClients';
import { SalesWorkspaceScope } from './SalesWorkspaceScope';
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

function formatContactPhone(phone: string): string {
  const compact = phone.replace(/\s+/g, '');
  const match = compact.match(/^(\+420)?(\d{3})(\d{3})(\d{3})$/);
  if (!match) return phone;
  const [, prefix, a, b, c] = match;
  return `${prefix ? '+420 ' : ''}${a} ${b} ${c}`;
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

export function SalesStudioApp() {
  const { session, logout, clearStudio, selectStudio, updateWorkspaceScope } =
    usePlatformSession();
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const brand = useStudioBrandProjection();
  const salesProjects = useMemo(() => listSalesCanonicalProjects(), []);
  const activeProjectId = resolveSalesActiveProjectId(
    session?.projectId,
    salesProjects,
  );
  const activeProject =
    salesProjects.find((project) => project.id === activeProjectId) ?? null;
  const { cases, projectLeads, acceptLead, acceptReferenceCase } =
    useHouseOperationalCases();
  const scopedHouses = useMemo(
    () =>
      activeProjectId === null
        ? []
        : listWorkspaceHouses(activeProjectId).map((house) => ({
            houseId: house.houseId,
            houseName: house.name,
          })),
    [activeProjectId],
  );
  const scopedClients = useMemo(
    () =>
      toSalesClients(cases, {
        projectLeads,
        houses: scopedHouses,
      }),
    [cases, projectLeads, scopedHouses],
  );
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeInterestHouseId, setActiveInterestHouseId] = useState<string | null>(null);
  const [followContact, setFollowContact] = useState<{
    readonly email: string;
    readonly houseId: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all');
  const scopeHouseId = session?.activeHouseId ?? null;

  useEffect(() => {
    setActiveClientId(null);
    setActiveInterestHouseId(null);
  }, [scopeHouseId, activeProjectId]);

  useEffect(() => {
    if (followContact === null || scopeHouseId !== followContact.houseId) {
      return;
    }
    const match = findSalesCaseForContactHouse(scopedClients, followContact);
    if (match !== null) {
      setActiveClientId(match.id);
      setFollowContact(null);
    }
  }, [followContact, scopedClients, scopeHouseId]);

  const query = searchQuery.trim().toLowerCase();
  const visibleClients = scopedClients.filter((client) => {
    if (!matchesQuery(client, query)) return false;
    const score = clientPrimaryReadiness(client);
    if (
      intentFilter === 'high' &&
      (
        !hasMeasuredReadiness(score) ||
        score < HIGH_INTENT_THRESHOLD
      )
    ) {
      return false;
    }
    return true;
  });

  const activeClient =
    visibleClients.find((client) => client.id === activeClientId) ??
    visibleClients[0] ??
    null;

  const activeHouse =
    activeClient === null
      ? null
      : resolveActiveHouse(
          activeClient,
          activeClient.id === activeClientId ? activeInterestHouseId : null,
        );
  const landPill =
    activeHouse === null ? null : formatLandIntentPill(activeHouse.land);

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: brand.companyName,
    projectLabel: activeProject?.label ?? '—',
    projects: salesProjects,
  });

  // SR-002 — CONIS / Sales / Projekt / Zájemce (bez názvu domu).
  // PE-02 — company crumb from Brand Projection.
  const projectCrumb = activeProject?.label ?? brand.tradeMark;
  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Sales' },
    { id: 'project', label: projectCrumb },
    { id: 'prospect', label: activeClient?.name ?? 'Zájemce' },
  ];

  const preData = scopedClients.length === 0;

  function selectClient(clientId: string) {
    setActiveClientId(clientId);
    setActiveInterestHouseId(null);
    setFollowContact(null);
  }

  function publishHouseScope(houseId: string) {
    if (typeof window === 'undefined' || window.parent === window) {
      return;
    }
    window.parent.postMessage(
      createWorkspaceHouseChangeMessage(houseId),
      new URL(resolveWorkspaceHostHref()).origin,
    );
  }

  function openRelatedHouse(houseId: string) {
    if (
      activeClient === null ||
      activeHouse === null ||
      activeProjectId === null ||
      houseId === activeHouse.id ||
      !isHouseInProject(houseId, activeProjectId)
    ) {
      return;
    }
    if (activeClient.origin === 'LEAD' && activeClient.contactEmail.length > 0) {
      setFollowContact({
        email: activeClient.contactEmail,
        houseId,
      });
    }
    if (scopeHouseId === houseId) {
      return;
    }
    updateWorkspaceScope({ activeHouseId: houseId });
    publishHouseScope(houseId);
  }

  async function acceptActiveLead() {
    if (activeClient === null || activeHouse === null) {
      return;
    }
    if (activeClient.origin === 'LEAD' && activeClient.leadId !== null) {
      await acceptLead({
        leadId: activeClient.leadId,
        houseId: activeHouse.id,
      });
      return;
    }
    if (activeClient.origin === 'REFERENCE') {
      await acceptReferenceCase({
        caseId: activeClient.id,
        houseId: activeHouse.id,
      });
    }
  }

  const desk = (
      <main
        className="platform-studio-pad sales-desk"
        data-testid="sales-desk-scroll"
        data-workspace-embed-view={isWorkspaceShellEmbed() ? 'sales' : undefined}
      >
        <p
          className="platform-type-helper"
          style={{ marginBottom: 12 }}
          data-testid="sales-partner-brand"
        >
          {brand.companyName} · {brand.heroLabel}
        </p>
        <div className="sales-desk__canvas">
          <div className="sales-desk__grid">
            <PlatformCard
              className="sales-desk__cases"
              title="Případy k hovoru"
            >
              <SalesWorkspaceScope
                activeProjectId={activeProjectId}
                activeHouseId={scopeHouseId}
              />
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
                  Vyšší index
                </button>
              </div>

              {preData ? (
                <p
                  className="sales-desk__empty"
                  data-testid="sales-operational-empty"
                >
                  Pro tento dům zatím nejsou žádné případy. Objeví se
                  používáním Client Experience.
                </p>
              ) : (
                <ul className="sales-desk__client-list">
                  {visibleClients.map((client) => {
                    const active = client.id === activeClient?.id;
                    const primary = resolveActiveHouse(
                      client,
                      active && activeInterestHouseId !== null
                        ? activeInterestHouseId
                        : null,
                    );
                    const accepted = client.processingStatus === 'accepted';
                    return (
                      <li key={client.id}>
                        <button
                          type="button"
                          className={`sales-desk__client${accepted ? ' sales-desk__client--accepted' : ' sales-desk__client--new'}${active ? ' sales-desk__client--active' : ''}`}
                          onClick={() => selectClient(client.id)}
                          aria-current={active ? 'true' : undefined}
                        >
                          <div className="sales-desk__client-head">
                            <span className="sales-desk__client-name">
                              {client.name}
                              <span
                                style={{
                                  display: 'block',
                                  textAlign: 'left',
                                  fontSize: '0.75rem',
                                  fontWeight: 400,
                                }}
                              >
                                <a
                                  className="sales-desk__contact-link"
                                  href={`mailto:${client.contactEmail}`}
                                >
                                  {client.contactEmail}
                                </a>
                                {client.contactPhone ? (
                                  <>
                                    {' / '}
                                    <a
                                      className="sales-desk__contact-link"
                                      href={phoneHref(client.contactPhone)}
                                    >
                                      {formatContactPhone(client.contactPhone)}
                                    </a>
                                  </>
                                ) : null}
                              </span>
                            </span>
                            <span className="sales-desk__intent-score">
                              {formatIndexPripravenosti(primary.readinessScore)}
                            </span>
                          </div>
                          <div className="sales-desk__client-sub">
                            <p className="sales-desk__client-project">
                              {houseListLine(primary)}
                            </p>
                            <span
                              className={`sales-desk__accept-mark${accepted ? ' sales-desk__accept-mark--on' : ''}`}
                              aria-hidden="true"
                              data-testid="sales-accept-indicator"
                              data-accepted={accepted ? 'true' : 'false'}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!preData && visibleClients.length === 0 ? (
                <p className="sales-desk__empty">Žádný zájemce neodpovídá.</p>
              ) : null}
            </PlatformCard>

            <div className="sales-desk__center">
              {activeClient !== null && activeHouse !== null ? (
                <PlatformCard className="sales-desk__case">
                  <header className="sales-desk__case-header">
                    <h1
                      className="platform-type-h1 sales-desk__house-title"
                      data-testid="sales-case-house-title"
                    >
                      {activeHouse.houseName}
                    </h1>
                    <div
                      className="sales-desk__header-row"
                      data-testid="sales-case-header-row-2"
                    >
                      <div className="sales-desk__prospect">
                        <p
                          className="sales-desk__prospect-name"
                          data-testid="sales-case-client-name"
                        >
                          {activeClient.name}
                        </p>
                        <p
                          className="sales-desk__prospect-contact"
                          data-testid="sales-case-client-contact"
                        >
                          <a
                            className="sales-desk__contact-link"
                            href={`mailto:${activeClient.contactEmail}`}
                          >
                            {activeClient.contactEmail}
                          </a>
                          {activeClient.contactPhone ? (
                            <>
                              {' / '}
                              <a
                                className="sales-desk__contact-link"
                                href={phoneHref(activeClient.contactPhone)}
                              >
                                {formatContactPhone(activeClient.contactPhone)}
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                      {landPill !== null ? (
                        <span
                          className="sales-desk__land-pill"
                          data-testid="sales-case-land-pill"
                        >
                          {landPill}
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>
                    <div
                      className="sales-desk__header-row"
                      data-testid="sales-case-header-row-3"
                    >
                      <ul
                        className="sales-desk__house-list"
                        aria-label="Domy tohoto zájemce"
                        data-testid="sales-case-house-pills"
                      >
                        {activeClient.relatedHouses.map((house) => {
                          const selected = house.houseId === activeHouse.id;
                          if (selected) {
                            return (
                              <li key={house.houseId}>
                                <span
                                  className="sales-desk__house-chip sales-desk__house-chip--active"
                                  data-house-id={house.houseId}
                                  data-active="true"
                                >
                                  {house.houseName}
                                </span>
                              </li>
                            );
                          }
                          return (
                            <li key={house.houseId}>
                              <button
                                type="button"
                                className="sales-desk__house-chip"
                                data-house-id={house.houseId}
                                data-active="false"
                                data-testid="sales-related-house"
                                onClick={() => openRelatedHouse(house.houseId)}
                              >
                                {house.houseName}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {activeClient.processingStatus === 'accepted' ? (
                        <p
                          className="sales-desk__accepted"
                          data-testid="sales-lead-accepted"
                        >
                          PŘIJATO
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="sales-desk__accept"
                          data-testid="sales-lead-accept"
                          onClick={() => {
                            void acceptActiveLead();
                          }}
                        >
                          PŘIJMOUT
                        </button>
                      )}
                    </div>
                  </header>

                  <div className="sales-desk__meter">
                    <div className="sales-desk__meter-header">
                      <span>Index připravenosti</span>
                      <span>{formatIndexPripravenosti(activeHouse.readinessScore)}</span>
                    </div>
                    <div className="sales-desk__meter-track">
                      <div
                        className="sales-desk__meter-fill"
                        style={{
                          width: hasMeasuredReadiness(activeHouse.readinessScore)
                            ? `${Math.min(100, activeHouse.readinessScore)}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>

                  <div className="sales-desk__insight">
                    <h4>Doporučené téma rozhovoru</h4>
                    <p>{activeHouse.insight}</p>
                  </div>

                  <p className="platform-type-section sales-desk__priorities-label">
                    Profil zájemce
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

                  {activeHouse.priorities.length > 0 ? (
                    <div
                      className="sales-desk__facts"
                      data-testid="sales-profile-priorities"
                    >
                      <p className="platform-type-section sales-desk__priorities-label">
                        Priority a odpovědi
                      </p>
                      <ul className="sales-desk__fact-list">
                        {activeHouse.priorities.map((priority) => {
                          const importance = formatPriorityImportance(
                            priority.importance,
                          );
                          return (
                            <li key={priority.id} className="sales-desk__fact">
                              <p className="sales-desk__fact-title">
                                {priority.label}
                                {importance !== null ? ` · ${importance}` : ''}
                              </p>
                              {priority.answer !== null ? (
                                <p className="sales-desk__fact-detail">
                                  {priority.answer.questionLabel}:{' '}
                                  {priority.answer.answerLabel}
                                </p>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {activeHouse.openedQuestions.length > 0 ? (
                    <div
                      className="sales-desk__facts"
                      data-testid="sales-profile-faq"
                    >
                      <p className="platform-type-section sales-desk__priorities-label">
                        Otevřené FAQ · {activeHouse.openedQuestions.length}
                      </p>
                      <ul className="sales-desk__fact-list">
                        {activeHouse.openedQuestions.map((item) => (
                          <li key={item.questionId} className="sales-desk__fact">
                            <p className="sales-desk__fact-title">{item.label}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </PlatformCard>
              ) : (
                <PlatformCard title="Případ">
                  <p
                    className="sales-desk__empty"
                    data-testid="sales-operational-empty-detail"
                  >
                    Pro tento dům zatím nejsou provozní data. Vzniknou
                    používáním Client Experience.
                  </p>
                </PlatformCard>
              )}
            </div>

            <PlatformCard
              title="Rozhodovací cesta"
              description="Pasivní chování vs. reálné rozhodovací signály"
            >
              {activeHouse !== null ? (
                <div
                  className="sales-desk__timeline"
                  data-testid="sales-decision-journey"
                >
                  {activeHouse.journey.map((step) => {
                    const stateClass = step.active
                      ? ' sales-desk__step--active'
                      : step.completed
                        ? ' sales-desk__step--completed'
                        : '';
                    const lines = step.lines ?? [];
                    return (
                      <div
                        key={step.module}
                        className={`sales-desk__step${stateClass}`}
                      >
                        <span className="sales-desk__step-node" aria-hidden />
                        <p className="sales-desk__step-module">{step.module}</p>
                        {step.title.length > 0 ? (
                          <p className="sales-desk__step-title">{step.title}</p>
                        ) : null}
                        {lines.length > 0 ? (
                          <ul className="sales-desk__step-lines">
                            {lines.map((line, index) => (
                              <li
                                key={`${step.module}-${index}`}
                                className="sales-desk__step-line"
                              >
                                {line}
                              </li>
                            ))}
                          </ul>
                        ) : step.detail.length > 0 ? (
                          <p className="sales-desk__step-detail">{step.detail}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="sales-desk__empty">
                  Rozhodovací cesta se zobrazí s prvním případem tohoto domu.
                </p>
              )}
            </PlatformCard>
          </div>
        </div>
      </main>
  );

  if (isWorkspaceShellEmbed()) {
    return desk;
  }

  return (
    <PlatformShell
      activeStudioId="sales"
        availableStudioIds={workspaceStudiosForRoles(session?.user.roles ?? [])}
      userLabel={session?.user.displayName ?? 'Host'}
      roleLabel={
        session !== null
          ? PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]
          : undefined
      }
      workspace={workspaceState}
      partnerBrandLabel={brand.logoLabel}
      breadcrumb={breadcrumb}
      capabilityHost={capabilityHost}
      onLogout={logout}
      onOpenLanding={clearStudio}
      onSelectStudio={selectStudio}
      contentOnly={isWorkspaceShellEmbed()}
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
      {desk}
    </PlatformShell>
  );
}
