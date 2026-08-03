import { useMemo, useState } from 'react';

import {
  PlatformCard,
  PlatformEmptyState,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  formatOfficeEventTime,
  listPartnerTimeline,
} from '../../office/officeEventCatalog';
import {
  handoffStatusTone,
  OFFICE_HANDOFF_STATUS_LABELS,
  type OfficeHandoffSummary,
} from '../../office/officeHandoffModel';
import {
  getHandoff,
  listHandoffs,
  receivePayment,
} from '../../office/officeHandoffRegistry';
import { getPartner } from '../../office/officePartnerRegistry';
import { formatCzk } from '../../office/officeSalesModel';

type ImplementationWorkspacePageProps = {
  readonly selectedPartnerId: string | null;
  readonly onSelectPartner: (partnerId: string) => void;
};

/**
 * OF-05 — Builder Handoff / Implementation Workspace.
 * PaymentReceived → Implementation → Builder Workspace bootstrap + Handoff Summary.
 */
export function ImplementationWorkspacePage({
  selectedPartnerId,
  onSelectPartner,
}: ImplementationWorkspacePageProps) {
  const [revision, setRevision] = useState(0);

  const handoffs = useMemo(() => {
    void revision;
    return listHandoffs();
  }, [revision]);

  const active: OfficeHandoffSummary | null =
    (selectedPartnerId !== null ? getHandoff(selectedPartnerId) : null) ??
    handoffs[0] ??
    null;

  const partner =
    active !== null ? getPartner(active.partnerId) : null;

  const timeline =
    active !== null ? listPartnerTimeline(active.partnerId, 12) : [];

  function bump() {
    setRevision((value) => value + 1);
  }

  return (
    <div className="office-handoff" data-testid="office-implementation-workspace">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Implementace</p>
        <h1 className="office-dashboard__title">Builder Handoff</h1>
        <p className="office-dashboard__lead">
          Po PaymentReceived partner přechází do Implementation a automaticky se
          připraví Builder Workspace, Project a Object.
        </p>
      </header>

      <div className="office-docs__grid">
        <PlatformCard
          title="Handoff Pipeline"
          description={`${handoffs.length} partnerů`}
        >
          <ul className="office-partners__list">
            {handoffs.map((entry) => {
              const rowPartner = getPartner(entry.partnerId);
              const isActive = active?.partnerId === entry.partnerId;
              return (
                <li key={entry.partnerId}>
                  <button
                    type="button"
                    className={
                      isActive
                        ? 'office-partners__item office-partners__item--active'
                        : 'office-partners__item'
                    }
                    onClick={() => onSelectPartner(entry.partnerId)}
                    data-testid={`office-handoff-row-${entry.partnerId}`}
                  >
                    <div className="office-partners__item-head">
                      <span className="office-partners__item-name">
                        {rowPartner?.name ?? entry.partnerId}
                      </span>
                      <PlatformStatusBadge
                        tone={handoffStatusTone(entry.status)}
                      >
                        {OFFICE_HANDOFF_STATUS_LABELS[entry.status]}
                      </PlatformStatusBadge>
                    </div>
                    <p className="office-partners__item-meta">
                      {entry.partnerContext.packageLabel ?? 'Bez balíčku'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          {handoffs.length === 0 ? (
            <p className="office-partners__empty">
              Žádný partner nečeká na handoff.
            </p>
          ) : null}
        </PlatformCard>

        <div className="office-docs__main">
          {active === null || partner === null ? (
            <PlatformEmptyState
              title="Vyberte partnera"
              description="Handoff začíná u partnera ve Waiting Payment."
            />
          ) : (
            <>
              <header className="office-partner-detail__header">
                <div>
                  <p className="office-dashboard__eyebrow">Partner</p>
                  <h2 className="office-partner-detail__name">
                    {partner.name}
                  </h2>
                  <p className="office-partner-detail__next">
                    {partner.nextStep}
                  </p>
                </div>
                <PlatformStatusBadge tone={handoffStatusTone(active.status)}>
                  {OFFICE_HANDOFF_STATUS_LABELS[active.status]}
                </PlatformStatusBadge>
              </header>

              <PlatformCard
                title="PaymentReceived"
                description="Potvrzení platby spouští automatický Builder Handoff"
              >
                {active.status === 'waiting_payment' ? (
                  <div className="office-partner-actions">
                    <button
                      type="button"
                      className="platform-btn platform-btn--primary"
                      onClick={() => {
                        receivePayment(active.partnerId);
                        bump();
                      }}
                      data-testid="office-payment-received"
                    >
                      PaymentReceived
                    </button>
                    <p className="office-list__meta">
                      Waiting Payment → Implementation + Builder Workspace
                    </p>
                  </div>
                ) : (
                  <div className="office-sales__waiting">
                    <PlatformStatusBadge tone="pass">
                      PaymentReceived
                    </PlatformStatusBadge>
                    <p className="office-dashboard__hint">
                      {active.paymentReceivedAt !== null
                        ? formatOfficeEventTime(active.paymentReceivedAt)
                        : '—'}
                      {active.partnerContext.amountCzk !== null
                        ? ` · ${formatCzk(active.partnerContext.amountCzk)}`
                        : ''}
                    </p>
                  </div>
                )}
              </PlatformCard>

              <PlatformCard
                title="Handoff Summary"
                description="Přehled úspěšného předání do Builderu"
              >
                {active.workspace === null ? (
                  <PlatformEmptyState
                    title="Builder Workspace ještě nevznikl"
                    description="Po PaymentReceived se vytvoří Workspace, Project a Object."
                  />
                ) : (
                  <dl className="office-partner-dl">
                    <div>
                      <dt>Partner Context</dt>
                      <dd>
                        {active.partnerContext.partnerName} ·{' '}
                        {active.partnerContext.contactEmail}
                      </dd>
                    </div>
                    <div>
                      <dt>Firma</dt>
                      <dd>{active.partnerContext.companyLegalName}</dd>
                    </div>
                    <div>
                      <dt>Balíček</dt>
                      <dd>
                        {active.partnerContext.packageLabel ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt>Builder Workspace</dt>
                      <dd>{active.workspace.name}</dd>
                    </div>
                    <div>
                      <dt>Project</dt>
                      <dd>{active.workspace.project.name}</dd>
                    </div>
                    <div>
                      <dt>Object</dt>
                      <dd>{active.workspace.project.object.name}</dd>
                    </div>
                    <div>
                      <dt>Builder</dt>
                      <dd>
                        <a
                          href={active.workspace.builderHref}
                          className="office-handoff__link"
                        >
                          Otevřít Builder Studio
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>BuilderReady</dt>
                      <dd>
                        {active.builderReadyAt !== null
                          ? formatOfficeEventTime(active.builderReadyAt)
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                )}
              </PlatformCard>

              <PlatformCard
                title="Timeline"
                description="PaymentReceived · BuilderWorkspaceCreated · BuilderReady"
              >
                {timeline.length === 0 ? (
                  <PlatformEmptyState
                    title="Zatím žádné události"
                    description="Handoff události se zapíší do Event Catalog."
                  />
                ) : (
                  <ol className="office-activity" aria-label="Handoff Timeline">
                    {timeline.map((event, index) => (
                      <li key={event.id} className="office-activity__item">
                        <div className="office-activity__rail" aria-hidden>
                          <span className="office-activity__dot" />
                          {index < timeline.length - 1 ? (
                            <span className="office-activity__line" />
                          ) : null}
                        </div>
                        <div className="office-activity__body">
                          <p className="office-activity__label">
                            {event.label}
                          </p>
                          <p className="office-activity__detail">
                            {event.detail}
                          </p>
                          <p className="office-activity__time">
                            {formatOfficeEventTime(event.occurredAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </PlatformCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
