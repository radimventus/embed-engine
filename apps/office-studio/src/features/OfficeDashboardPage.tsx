import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  buildOfficeDashboardCards,
  listOfficePartnerSummaries,
  listOfficeWaitingActions,
} from '../office/officeDashboardData';
import {
  formatOfficeEventTime,
  listRecentOfficeEvents,
} from '../office/officeEventCatalog';

/**
 * OF-01 — Office Dashboard (overview + recent activity).
 * OF-02 — Partner summaries derived from Partner Registry.
 */
export function OfficeDashboardPage() {
  const cards = buildOfficeDashboardCards();
  const partners = listOfficePartnerSummaries();
  const waiting = listOfficeWaitingActions();
  const recent = listRecentOfficeEvents(8);

  return (
    <div className="office-dashboard" data-testid="office-dashboard">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Dashboard</p>
        <h1 className="office-dashboard__title">Provozní centrum</h1>
        <p className="office-dashboard__lead">
          Přehled partnerů, akcí a posledních událostí životního cyklu.
        </p>
      </header>

      <div className="office-dashboard__cards" aria-label="Přehled">
        {cards.map((card) => (
          <PlatformCard key={card.id} title={card.title}>
            <p className="office-dashboard__metric">{card.value}</p>
            <p className="office-dashboard__hint">{card.hint}</p>
          </PlatformCard>
        ))}
      </div>

      <div className="office-dashboard__grid">
        <PlatformCard title="Moji partneři">
          <ul className="office-list">
            {partners.map((partner) => (
              <li key={partner.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{partner.name}</p>
                  <p className="office-list__meta">{partner.nextStep}</p>
                </div>
                <PlatformStatusBadge tone="info">
                  {partner.status}
                </PlatformStatusBadge>
              </li>
            ))}
          </ul>
        </PlatformCard>

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

      <PlatformCard
        title="Recent Activity"
        description="Poslední události životního cyklu partnera"
      >
        <ol className="office-activity" aria-label="Poslední události">
          {recent.map((event, index) => (
            <li key={event.id} className="office-activity__item">
              <div className="office-activity__rail" aria-hidden>
                <span className="office-activity__dot" />
                {index < recent.length - 1 ? (
                  <span className="office-activity__line" />
                ) : null}
              </div>
              <div className="office-activity__body">
                <p className="office-activity__label">{event.label}</p>
                <p className="office-activity__detail">{event.detail}</p>
                <p className="office-activity__time">
                  {formatOfficeEventTime(event.occurredAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </PlatformCard>
    </div>
  );
}
