import { PlatformCard, PlatformEmptyState, PlatformStatusBadge } from '@embed-engine/platform-shell';

import {
  listOfficePartnerSummaries,
  listOfficeWaitingActions,
} from '../office/officeDashboardData';
import {
  formatOfficeEventTime,
  listRecentOfficeEvents,
} from '../office/officeEventCatalog';
import type { OfficeRouteId } from '../office/officeRoutes';
import { officeRouteLabel } from '../office/officeRoutes';

type OfficeSectionPageProps = {
  readonly routeId: Exclude<OfficeRouteId, 'dashboard' | 'partners'>;
};

/**
 * OF-01 — Functional section shells for prepared routes.
 * Partner Workspace lives in PartnersWorkspacePage (OF-02).
 */
export function OfficeSectionPage({ routeId }: OfficeSectionPageProps) {
  const label = officeRouteLabel(routeId);

  if (routeId === 'activity') {
    const events = listRecentOfficeEvents(12);
    return (
      <div className="office-section" data-testid={`office-section-${routeId}`}>
        <header className="office-dashboard__header">
          <p className="office-dashboard__eyebrow">{label}</p>
          <h1 className="office-dashboard__title">{label}</h1>
          <p className="office-dashboard__lead">
            Kompletní provozní aktivita z Event Catalog.
          </p>
        </header>
        <PlatformCard title="Poslední události">
          <ul className="office-list">
            {events.map((event) => (
              <li key={event.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{event.label}</p>
                  <p className="office-list__meta">{event.detail}</p>
                </div>
                <span className="office-list__meta">
                  {formatOfficeEventTime(event.occurredAt)}
                </span>
              </li>
            ))}
          </ul>
        </PlatformCard>
      </div>
    );
  }

  if (routeId === 'sales') {
    const waiting = listOfficeWaitingActions();
    return (
      <div className="office-section" data-testid={`office-section-${routeId}`}>
        <header className="office-dashboard__header">
          <p className="office-dashboard__eyebrow">{label}</p>
          <h1 className="office-dashboard__title">{label}</h1>
          <p className="office-dashboard__lead">
            Obchodní provoz — položky čekající na akci.
          </p>
        </header>
        <PlatformCard title="Čeká na akci">
          <ul className="office-list">
            {waiting.map((action) => (
              <li key={action.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{action.title}</p>
                  <p className="office-list__meta">{action.owner}</p>
                </div>
                <PlatformStatusBadge tone="warning">
                  {action.dueLabel}
                </PlatformStatusBadge>
              </li>
            ))}
          </ul>
        </PlatformCard>
      </div>
    );
  }

  if (routeId === 'implementation') {
    const implementations = listOfficePartnerSummaries().filter(
      (partner) => partner.status === 'Implementace',
    );
    return (
      <div className="office-section" data-testid={`office-section-${routeId}`}>
        <header className="office-dashboard__header">
          <p className="office-dashboard__eyebrow">{label}</p>
          <h1 className="office-dashboard__title">{label}</h1>
          <p className="office-dashboard__lead">
            Probíhající implementace a handoff do Builderu.
          </p>
        </header>
        <PlatformCard title="Probíhající implementace">
          {implementations.length === 0 ? (
            <PlatformEmptyState
              title="Žádná aktivní implementace"
              description="Jakmile partner vstoupí do implementace, objeví se zde."
            />
          ) : (
            <ul className="office-list">
              {implementations.map((partner) => (
                <li key={partner.id} className="office-list__item">
                  <div>
                    <p className="office-list__title">{partner.name}</p>
                    <p className="office-list__meta">{partner.nextStep}</p>
                  </div>
                  <PlatformStatusBadge tone="gold">
                    {partner.status}
                  </PlatformStatusBadge>
                </li>
              ))}
            </ul>
          )}
        </PlatformCard>
      </div>
    );
  }

  if (routeId === 'documents') {
    return (
      <div className="office-section" data-testid={`office-section-${routeId}`}>
        <header className="office-dashboard__header">
          <p className="office-dashboard__eyebrow">{label}</p>
          <h1 className="office-dashboard__title">{label}</h1>
          <p className="office-dashboard__lead">
            Dokumenty partnerů a provozní podklady.
          </p>
        </header>
        <PlatformCard title="Dokumenty">
          <PlatformEmptyState
            title="Zatím žádné dokumenty v provozním přehledu"
            description="Dokumenty se zobrazí, až budou navázané na partnera v životním cyklu."
          />
        </PlatformCard>
      </div>
    );
  }

  return (
    <div className="office-section" data-testid={`office-section-${routeId}`}>
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">{label}</p>
        <h1 className="office-dashboard__title">{label}</h1>
        <p className="office-dashboard__lead">
          Nastavení provozního prostředí Office Studia.
        </p>
      </header>
      <PlatformCard title="Pracovní prostředí">
        <ul className="office-list">
          <li className="office-list__item">
            <div>
              <p className="office-list__title">Studio</p>
              <p className="office-list__meta">CONIS Office</p>
            </div>
          </li>
          <li className="office-list__item">
            <div>
              <p className="office-list__title">Vstup</p>
              <p className="office-list__meta">https://conis.cz/studio/office</p>
            </div>
          </li>
          <li className="office-list__item">
            <div>
              <p className="office-list__title">Režim</p>
              <p className="office-list__meta">
                Provozní centrum — životní cyklus partnera
              </p>
            </div>
          </li>
        </ul>
      </PlatformCard>
    </div>
  );
}
