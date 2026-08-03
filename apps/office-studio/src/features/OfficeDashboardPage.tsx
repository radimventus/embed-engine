import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  buildOfficeDashboardCards,
  buildOfficeFollowUpDashboard,
  listOfficePartnerSummaries,
  listOfficeWaitingActions,
  listOfficeWorkspaceSummaries,
} from '../office/officeDashboardData';
import {
  formatOfficeEventTime,
  listRecentOfficeEvents,
} from '../office/officeEventCatalog';
import type { PartnerCommercialFollowUp } from '../office/officeCommercialFollowUpModel';
import { listPartnerAdminDashboardRows } from '../office/officePartnerAdministration';

function formatSummaryDate(iso: string | null): string {
  if (iso === null) return '—';
  return formatOfficeEventTime(iso);
}

function FollowUpList({
  items,
  empty,
}: {
  readonly items: readonly PartnerCommercialFollowUp[];
  readonly empty: string;
}) {
  if (items.length === 0) {
    return <p className="office-dashboard__hint">{empty}</p>;
  }
  return (
    <ul className="office-list" data-testid="followup-list">
      {items.map((item) => (
        <li key={item.partnerId} className="office-list__item">
          <div>
            <p className="office-list__title">{item.partnerName}</p>
            <p className="office-list__meta">{item.email}</p>
          </div>
          <PlatformStatusBadge tone="info">{item.statusLabel}</PlatformStatusBadge>
        </li>
      ))}
    </ul>
  );
}

/**
 * OF-01 — Office Dashboard (overview + recent activity).
 * OF-02 — Partner summaries derived from Partner Registry.
 * PE-08 — Commercial Follow-up buckets.
 * PE-10 / PE-11 — Workspace Summary for active Partner Environments.
 * PE-12 — Partner Administration overview.
 */
export function OfficeDashboardPage() {
  const cards = buildOfficeDashboardCards();
  const partners = listOfficePartnerSummaries();
  const waiting = listOfficeWaitingActions();
  const followUp = buildOfficeFollowUpDashboard();
  const workspaceSummaries = listOfficeWorkspaceSummaries();
  const adminRows = listPartnerAdminDashboardRows();
  const recent = listRecentOfficeEvents(8);

  return (
    <div className="office-dashboard" data-testid="office-dashboard">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Dashboard</p>
        <h1 className="office-dashboard__title">Provozní centrum</h1>
        <p className="office-dashboard__lead">
          Přehled partnerů, Partner Environment a posledních událostí.
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

      <PlatformCard
        title="Workspace Summary"
        description="Stav dlouhodobého Partner Environment"
      >
        {workspaceSummaries.length === 0 ? (
          <p className="office-dashboard__hint">
            Po potvrzení nabídky se zde zobrazí Active Partner workspace.
          </p>
        ) : (
          <ul className="office-list" data-testid="workspace-summary-list">
            {workspaceSummaries.map((summary) => (
              <li key={summary.partnerId} className="office-list__item">
                <div>
                  <p className="office-list__title">{summary.partnerName}</p>
                  <p className="office-list__meta">
                    {summary.activePackage} · {summary.licence}
                  </p>
                  <p className="office-list__meta">
                    Aktivace {formatSummaryDate(summary.activatedAt)} · Změna{' '}
                    {formatSummaryDate(summary.statusChangedAt)}
                  </p>
                  <p className="office-list__meta">
                    {summary.statusChangeReason ?? '—'} ·{' '}
                    {summary.lastAdminActionLabel}
                  </p>
                </div>
                <PlatformStatusBadge
                  tone={
                    summary.lifecycleStatus === 'active'
                      ? 'pass'
                      : summary.lifecycleStatus === 'suspended'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {summary.lifecycleStatusLabel}
                </PlatformStatusBadge>
              </li>
            ))}
          </ul>
        )}
      </PlatformCard>

      <PlatformCard
        title="Partner Administration"
        description="Aktuální konfigurace aktivních partnerů a historie změn"
      >
        {adminRows.length === 0 ? (
          <p className="office-dashboard__hint">
            Po aktivaci Partner Environment se zde zobrazí administrativní přehled.
          </p>
        ) : (
          <ul className="office-list" data-testid="partner-admin-dashboard">
            {adminRows.map((row) => (
              <li key={row.partnerId} className="office-list__item">
                <div>
                  <p className="office-list__title">{row.partnerName}</p>
                  <p className="office-list__meta">
                    {row.packageName} · {row.licence}
                  </p>
                  <p className="office-list__meta">
                    {row.contactName} · {row.contactEmail}
                  </p>
                  <p className="office-list__meta">
                    {row.lastChangeSummary}
                    {row.lastChangeAt
                      ? ` · ${formatSummaryDate(row.lastChangeAt)}`
                      : ''}
                    {row.notesCount > 0 ? ` · ${row.notesCount} poznámek` : ''}
                  </p>
                </div>
                <PlatformStatusBadge tone="info">admin</PlatformStatusBadge>
              </li>
            ))}
          </ul>
        )}
      </PlatformCard>

      <div
        className="office-dashboard__grid"
        data-testid="commercial-followup-dashboard"
      >
        <PlatformCard
          title="Čekají na aktivaci"
          description="Pilot odeslán · účet ještě není aktivní"
        >
          <FollowUpList
            items={followUp.waitingActivation}
            empty="Žádný partner nečeká na aktivaci."
          />
        </PlatformCard>
        <PlatformCard
          title="Nově aktivovaní"
          description="Aktivace během posledních 48 hodin"
        >
          <FollowUpList
            items={followUp.newlyActivated}
            empty="Žádní nově aktivovaní partneři."
          />
        </PlatformCard>
        <PlatformCard
          title="Připraveni k follow-up"
          description="Připraveni k obchodnímu kontaktu"
        >
          <FollowUpList
            items={followUp.readyForFollowUp}
            empty="Žádný partner nečeká na obchodní kontakt."
          />
        </PlatformCard>
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
