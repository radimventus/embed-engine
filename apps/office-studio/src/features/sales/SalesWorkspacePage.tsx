import { useEffect, useMemo, useState } from 'react';

import {
  PlatformCard,
  PlatformEmptyState,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import { getPartner } from '../../office/officePartnerRegistry';
import {
  filterSalesCases,
  type SalesPipelineFilter,
} from '../../office/officeSalesFilters';
import {
  buildPackageComparison,
  formatCzk,
  getSalesPackage,
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
  markOfferViewed,
  selectSalesPackage,
} from '../../office/officeSalesRegistry';

type SalesWorkspacePageProps = {
  readonly selectedPartnerId: string | null;
  readonly onSelectPartner: (partnerId: string) => void;
};

/**
 * PE-09 — Pilot Offer & Checkout.
 * Package comparison → select → confirm order. No payment gateway.
 */
export function SalesWorkspacePage({
  selectedPartnerId,
  onSelectPartner,
}: SalesWorkspacePageProps) {
  const [revision, setRevision] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<SalesPipelineFilter>('all');

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

  const comparison = useMemo(() => buildPackageComparison(), []);

  const activeCase: OfficeSalesCase | null =
    (selectedPartnerId !== null
      ? getSalesCase(selectedPartnerId)
      : null) ??
    visible[0] ??
    null;

  useEffect(() => {
    if (activeCase === null) return;
    const current = getSalesCase(activeCase.partnerId);
    if (current?.offer.viewedAt != null) return;
    markOfferViewed(activeCase.partnerId);
    setRevision((value) => value + 1);
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
  const orderReady =
    activeCase !== null &&
    activeCase.offer.packageId !== null &&
    activeCase.order === null;

  return (
    <div className="office-sales" data-testid="office-sales-workspace">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Obchod</p>
        <h1 className="office-dashboard__title">Pilot Offer & Checkout</h1>
        <p className="office-dashboard__lead">
          Porovnejte balíčky, vyberte Pilot / Starter / Studio Partner a potvrďte
          objednávku bez platební brány.
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
              description="Pilot Offer pracuje s Partnerem jako vstupní entitou."
            />
          ) : (
            <>
              <header className="office-partner-detail__header">
                <div>
                  <p className="office-dashboard__eyebrow">Pilot Offer</p>
                  <h2 className="office-partner-detail__name">
                    {partner.name}
                  </h2>
                  <p className="office-partner-detail__next">
                    {partner.nextStep}
                  </p>
                </div>
                <PlatformStatusBadge
                  tone={pipelineStageTone(activeCase.stage)}
                >
                  {OFFICE_PIPELINE_STAGE_LABELS[activeCase.stage]}
                </PlatformStatusBadge>
              </header>

              <PlatformCard
                title="Pilot Offer"
                description="Balíčky Pilot · Starter · Studio Partner"
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
                          {pkg.recommended ? (
                            <span className="office-sales__package-badge">
                              doporučeno
                            </span>
                          ) : null}
                        </span>
                        <span className="office-sales__package-price">
                          {formatCzk(pkg.priceCzk)}
                        </span>
                        <span className="office-sales__package-meta">
                          {pkg.housesLabel} · {pkg.trialDays} dní · {pkg.summary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PlatformCard>

              <PlatformCard
                title="Package Comparison"
                description="Funkce a rozdíly mezi balíčky"
              >
                <div
                  className="office-sales__comparison-wrap"
                  data-testid="package-comparison"
                >
                  <table className="office-sales__comparison">
                    <thead>
                      <tr>
                        <th scope="col">Funkce</th>
                        {OFFICE_SALES_PACKAGES.map((pkg) => (
                          <th key={pkg.id} scope="col">
                            {pkg.name}
                            {pkg.recommended ? ' ★' : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((row) => (
                        <tr key={row.featureId}>
                          <th scope="row">{row.label}</th>
                          <td>{row.values.pilot}</td>
                          <td>{row.values.starter}</td>
                          <td>{row.values['studio-partner']}</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row">Cena</th>
                        {OFFICE_SALES_PACKAGES.map((pkg) => (
                          <td key={pkg.id}>{formatCzk(pkg.priceCzk)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </PlatformCard>

              <PlatformCard
                title="Checkout"
                description="MVP — výběr balíčku a potvrzení objednávky bez platební brány"
                className="pilot-checkout"
              >
                {selectedPackage === null ? (
                  <PlatformEmptyState
                    title="Nejprve vyberte balíček"
                    description="Po výběru potvrďte objednávku v checkoutu."
                  />
                ) : (
                  <div
                    className="office-sales__checkout"
                    data-testid="pilot-checkout"
                  >
                    <dl className="office-partner-dl">
                      <div>
                        <dt>Partner</dt>
                        <dd>{partner.name}</dd>
                      </div>
                      <div>
                        <dt>Balíček</dt>
                        <dd>{selectedPackage.name}</dd>
                      </div>
                      <div>
                        <dt>Cena</dt>
                        <dd>{formatCzk(selectedPackage.priceCzk)}</dd>
                      </div>
                      <div>
                        <dt>Licence</dt>
                        <dd>{selectedPackage.housesLabel}</dd>
                      </div>
                      <div>
                        <dt>Objednávka</dt>
                        <dd>
                          {activeCase.order !== null
                            ? `Potvrzena · ${formatCzk(activeCase.order.amountCzk)}`
                            : 'Připravena k potvrzení'}
                        </dd>
                      </div>
                    </dl>
                    <div
                      className="office-partner-actions"
                      role="group"
                      aria-label="Checkout actions"
                    >
                      <button
                        type="button"
                        className="platform-btn platform-btn--sm platform-btn--primary"
                        disabled={!orderReady}
                        onClick={() => {
                          confirmSalesOrder(activeCase.partnerId);
                          bump();
                        }}
                        data-testid="office-sales-confirm-order"
                      >
                        Potvrdit objednávku
                      </button>
                    </div>
                    <p className="office-dashboard__hint">
                      Bez platební brány a bez fakturace — pouze obchodní stav a
                      Timeline.
                    </p>
                  </div>
                )}
              </PlatformCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
