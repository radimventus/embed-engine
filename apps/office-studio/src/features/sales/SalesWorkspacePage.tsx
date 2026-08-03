import { useEffect, useMemo, useState } from 'react';

import {
  PlatformCard,
  PlatformEmptyState,
  PlatformField,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import { getPartner } from '../../office/officePartnerRegistry';
import {
  filterSalesCases,
  type SalesPipelineFilter,
} from '../../office/officeSalesFilters';
import {
  formatCzk,
  getSalesPackage,
  OFFICE_ORDER_STATUS_LABELS,
  OFFICE_PIPELINE_STAGE_LABELS,
  OFFICE_PIPELINE_STAGE_ORDER,
  OFFICE_SALES_PACKAGES,
  pipelineStageTone,
  type OfficePackageId,
  type OfficeSalesCase,
} from '../../office/officeSalesModel';
import {
  confirmSalesOrder,
  getSalesCase,
  listSalesCases,
  listWaitingPaymentCases,
  moveToWaitingPayment,
  selectSalesPackage,
  sendPersonalizedOffer,
  updatePersonalizedOffer,
} from '../../office/officeSalesRegistry';

type SalesWorkspacePageProps = {
  readonly selectedPartnerId: string | null;
  readonly onSelectPartner: (partnerId: string) => void;
};

/**
 * OF-03 — Sales Workspace (Click Model MVP).
 * Pipeline · Personalized Offer · Package Selection · Order · Waiting Payment.
 */
export function SalesWorkspacePage({
  selectedPartnerId,
  onSelectPartner,
}: SalesWorkspacePageProps) {
  const [revision, setRevision] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<SalesPipelineFilter>('all');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerNote, setOfferNote] = useState('');

  const cases = useMemo(() => {
    void revision;
    return listSalesCases();
  }, [revision]);

  const visible = useMemo(
    () => filterSalesCases(cases, searchQuery, stageFilter),
    [cases, searchQuery, stageFilter],
  );

  const waitingCount = useMemo(() => {
    void revision;
    return listWaitingPaymentCases().length;
  }, [revision]);

  const activeCase: OfficeSalesCase | null =
    (selectedPartnerId !== null
      ? getSalesCase(selectedPartnerId)
      : null) ??
    visible[0] ??
    null;

  useEffect(() => {
    if (activeCase === null) return;
    setOfferTitle(activeCase.offer.title);
    setOfferNote(activeCase.offer.personalNote);
  }, [activeCase?.partnerId]);

  function bump() {
    setRevision((value) => value + 1);
  }

  const partner =
    activeCase !== null ? getPartner(activeCase.partnerId) : null;
  const selectedPackage =
    activeCase?.offer.packageId != null
      ? getSalesPackage(activeCase.offer.packageId)
      : null;

  return (
    <div className="office-sales" data-testid="office-sales-workspace">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Obchod</p>
        <h1 className="office-dashboard__title">Sales Workspace</h1>
        <p className="office-dashboard__lead">
          Obchodní proces od personalizované nabídky přes pipeline až po Waiting
          Payment. Vstupní entitou je Partner.
        </p>
      </header>

      <div className="office-sales__grid">
        <PlatformCard
          className="office-sales__pipeline"
          title="Sales Pipeline"
          description={`${visible.length} případů · Waiting Payment: ${waitingCount}`}
        >
          <label className="office-partners__search">
            <span className="sr-only">Hledat v pipeline</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Hledat partnera / nabídku…"
              className="office-partners__search-input"
              data-testid="office-sales-search"
            />
          </label>

          <div
            className="office-partners__filters"
            role="group"
            aria-label="Filtr pipeline"
          >
            <button
              type="button"
              className={
                stageFilter === 'all'
                  ? 'office-partners__filter office-partners__filter--active'
                  : 'office-partners__filter'
              }
              onClick={() => setStageFilter('all')}
            >
              Vše
            </button>
            {OFFICE_PIPELINE_STAGE_ORDER.map((stage) => (
              <button
                key={stage}
                type="button"
                className={
                  stageFilter === stage
                    ? 'office-partners__filter office-partners__filter--active'
                    : 'office-partners__filter'
                }
                onClick={() => setStageFilter(stage)}
              >
                {OFFICE_PIPELINE_STAGE_LABELS[stage]}
              </button>
            ))}
          </div>

          <ul className="office-partners__list">
            {visible.map((entry) => {
              const rowPartner = getPartner(entry.partnerId);
              const active = activeCase?.partnerId === entry.partnerId;
              return (
                <li key={entry.partnerId}>
                  <button
                    type="button"
                    className={
                      active
                        ? 'office-partners__item office-partners__item--active'
                        : 'office-partners__item'
                    }
                    onClick={() => onSelectPartner(entry.partnerId)}
                    aria-current={active ? 'true' : undefined}
                    data-testid={`office-sales-row-${entry.partnerId}`}
                  >
                    <div className="office-partners__item-head">
                      <span className="office-partners__item-name">
                        {rowPartner?.name ?? entry.partnerId}
                      </span>
                      <PlatformStatusBadge
                        tone={pipelineStageTone(entry.stage)}
                      >
                        {OFFICE_PIPELINE_STAGE_LABELS[entry.stage]}
                      </PlatformStatusBadge>
                    </div>
                    <p className="office-partners__item-meta">
                      {entry.offer.title}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {visible.length === 0 ? (
            <p className="office-partners__empty">
              Žádný obchodní případ neodpovídá filtru.
            </p>
          ) : null}
        </PlatformCard>

        <div className="office-sales__detail">
          {activeCase === null || partner === null ? (
            <PlatformEmptyState
              title="Vyberte partnera v pipeline"
              description="Sales Workspace pracuje s Partnerem jako vstupní entitou."
            />
          ) : (
            <>
              <header className="office-partner-detail__header">
                <div>
                  <p className="office-dashboard__eyebrow">Offer Detail</p>
                  <h2 className="office-partner-detail__name">
                    {partner.name}
                  </h2>
                  <p className="office-partner-detail__next">
                    {OFFICE_PIPELINE_STAGE_LABELS[activeCase.stage]}
                  </p>
                </div>
                <PlatformStatusBadge
                  tone={pipelineStageTone(activeCase.stage)}
                >
                  {OFFICE_PIPELINE_STAGE_LABELS[activeCase.stage]}
                </PlatformStatusBadge>
              </header>

              <PlatformCard
                title="Personalized Offer"
                description="Personalizace nabídky pro partnera"
              >
                <div className="office-sales__offer-form">
                  <PlatformField label="Titulek nabídky">
                    <input
                      value={offerTitle}
                      onChange={(event) => setOfferTitle(event.target.value)}
                      data-testid="office-offer-title"
                    />
                  </PlatformField>
                  <PlatformField label="Personalizovaná zpráva">
                    <textarea
                      rows={3}
                      value={offerNote}
                      onChange={(event) => setOfferNote(event.target.value)}
                      data-testid="office-offer-note"
                    />
                  </PlatformField>
                  <p className="office-list__meta">
                    Stav nabídky:{' '}
                    <strong>{activeCase.offer.status}</strong>
                    {selectedPackage !== null
                      ? ` · ${selectedPackage.name}`
                      : ' · bez balíčku'}
                  </p>
                </div>
              </PlatformCard>

              <PlatformCard
                title="Package Selection"
                description="Výběr obchodního balíčku"
              >
                <div className="office-sales__packages" role="list">
                  {OFFICE_SALES_PACKAGES.map((pkg) => {
                    const selected = activeCase.offer.packageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        role="listitem"
                        className={
                          selected
                            ? 'office-sales__package office-sales__package--active'
                            : 'office-sales__package'
                        }
                        onClick={() => {
                          selectSalesPackage(
                            activeCase.partnerId,
                            pkg.id as OfficePackageId,
                          );
                          bump();
                        }}
                        data-testid={`office-package-${pkg.id}`}
                      >
                        <span className="office-sales__package-name">
                          {pkg.name}
                        </span>
                        <span className="office-sales__package-price">
                          {formatCzk(pkg.priceCzk)}
                        </span>
                        <span className="office-sales__package-meta">
                          {pkg.housesLabel} · {pkg.summary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PlatformCard>

              <div className="office-partner-detail__cards">
                <PlatformCard title="Order Summary">
                  {activeCase.order === null ? (
                    <PlatformEmptyState
                      title="Objednávka ještě není"
                      description="Po potvrzení nabídky se zobrazí souhrn objednávky."
                    />
                  ) : (
                    <dl className="office-partner-dl">
                      <div>
                        <dt>Balíček</dt>
                        <dd>
                          {getSalesPackage(activeCase.order.packageId).name}
                        </dd>
                      </div>
                      <div>
                        <dt>Částka</dt>
                        <dd>{formatCzk(activeCase.order.amountCzk)}</dd>
                      </div>
                      <div>
                        <dt>Partner</dt>
                        <dd>{partner.name}</dd>
                      </div>
                      <div>
                        <dt>Nabídka</dt>
                        <dd>{activeCase.offer.title}</dd>
                      </div>
                    </dl>
                  )}
                </PlatformCard>

                <PlatformCard title="Order Status">
                  {activeCase.order === null ? (
                    <p className="office-list__meta">Bez aktivní objednávky</p>
                  ) : (
                    <div className="office-sales__order-status">
                      <PlatformStatusBadge
                        tone={
                          activeCase.order.status === 'waiting_payment'
                            ? 'gold'
                            : 'warning'
                        }
                      >
                        {OFFICE_ORDER_STATUS_LABELS[activeCase.order.status]}
                      </PlatformStatusBadge>
                      <p className="office-list__meta">
                        Potvrzeno:{' '}
                        {new Date(
                          activeCase.order.confirmedAt,
                        ).toLocaleString('cs-CZ')}
                      </p>
                    </div>
                  )}
                </PlatformCard>
              </div>

              <PlatformCard
                title="Waiting Payment"
                description="Provozní fronta čekající na platbu (bez PaymentReceived)"
              >
                {activeCase.stage === 'waiting_payment' &&
                activeCase.order !== null ? (
                  <div className="office-sales__waiting">
                    <p className="office-dashboard__metric">
                      {formatCzk(activeCase.order.amountCzk)}
                    </p>
                    <p className="office-dashboard__hint">
                      Čeká na úhradu · {partner.name}
                    </p>
                  </div>
                ) : (
                  <PlatformEmptyState
                    title="Není ve Waiting Payment"
                    description="Přesuňte potvrzenou objednávku Quick Action do Waiting Payment."
                  />
                )}
              </PlatformCard>

              <PlatformCard
                title="Quick Actions"
                description="Obchodní kroky Click Model (bez PDF / e-mailu / handoff)"
              >
                <div
                  className="office-partner-actions"
                  role="group"
                  aria-label="Sales Quick Actions"
                >
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm"
                    onClick={() => {
                      updatePersonalizedOffer(activeCase.partnerId, {
                        title: offerTitle,
                        personalNote: offerNote,
                      });
                      bump();
                    }}
                    data-testid="office-sales-save-offer"
                  >
                    Uložit nabídku
                  </button>
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm platform-btn--primary"
                    disabled={activeCase.offer.packageId === null}
                    onClick={() => {
                      updatePersonalizedOffer(activeCase.partnerId, {
                        title: offerTitle,
                        personalNote: offerNote,
                      });
                      sendPersonalizedOffer(activeCase.partnerId);
                      bump();
                    }}
                    data-testid="office-sales-send-offer"
                  >
                    Odeslat nabídku
                  </button>
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm"
                    disabled={activeCase.offer.packageId === null}
                    onClick={() => {
                      confirmSalesOrder(activeCase.partnerId);
                      bump();
                    }}
                    data-testid="office-sales-confirm-order"
                  >
                    Potvrdit objednávku
                  </button>
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm"
                    disabled={activeCase.order === null}
                    onClick={() => {
                      moveToWaitingPayment(activeCase.partnerId);
                      bump();
                    }}
                    data-testid="office-sales-waiting-payment"
                  >
                    Waiting Payment
                  </button>
                </div>
              </PlatformCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
