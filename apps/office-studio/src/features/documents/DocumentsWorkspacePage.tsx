import { useEffect, useMemo, useState } from 'react';

import {
  PlatformCard,
  PlatformEmptyState,
  PlatformField,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  formatOfficeEventTime,
  listPartnerTimeline,
} from '../../office/officeEventCatalog';
import {
  documentStatusTone,
  OFFICE_DOCUMENT_PACKAGE_STATUS_LABELS,
  OFFICE_DOCUMENT_STATUS_LABELS,
  OFFICE_DOCUMENT_TYPE_LABELS,
  OFFICE_DOCUMENT_TYPE_ORDER,
  packageStatusTone,
  type OfficeDocument,
  type OfficeDocumentType,
} from '../../office/officeDocumentModel';
import {
  confirmClickWrap,
  filterDocuments,
  getDocumentPackage,
  listDocumentPackages,
  sendDocumentPackage,
} from '../../office/officeDocumentRegistry';
import { getPartner, listPartners } from '../../office/officePartnerRegistry';
import { formatCzk } from '../../office/officeSalesModel';

type DocumentsWorkspacePageProps = {
  readonly selectedPartnerId: string | null;
  readonly onSelectPartner: (partnerId: string) => void;
};

/**
 * OF-04 / PT-15 — Document Workspace (viewer surface).
 * Preview · Send · History · Status — documents are issued by Document Runtime.
 */
export function DocumentsWorkspacePage({
  selectedPartnerId,
  onSelectPartner,
}: DocumentsWorkspacePageProps) {
  const [revision, setRevision] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | OfficeDocumentType>(
    'all',
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [emailTo, setEmailTo] = useState('');

  const partners = useMemo(() => {
    void revision;
    return listPartners();
  }, [revision]);

  const packages = useMemo(() => {
    void revision;
    return listDocumentPackages();
  }, [revision]);

  const activePartnerId =
    selectedPartnerId ??
    packages.find((entry) => entry.documents.length > 0)?.partnerId ??
    partners[0]?.id ??
    null;

  const activePackage =
    activePartnerId !== null ? getDocumentPackage(activePartnerId) : null;
  const partner =
    activePartnerId !== null ? getPartner(activePartnerId) : null;

  const visibleDocs = useMemo(() => {
    if (activePackage === null) return [];
    return filterDocuments(activePackage.documents, searchQuery, typeFilter);
  }, [activePackage, searchQuery, typeFilter, revision]);

  useEffect(() => {
    if (partner === null) return;
    setEmailTo(partner.contact.email);
  }, [partner?.id]);

  useEffect(() => {
    if (visibleDocs.length === 0) {
      setSelectedDocumentId(null);
      return;
    }
    if (
      selectedDocumentId === null ||
      !visibleDocs.some((doc) => doc.id === selectedDocumentId)
    ) {
      setSelectedDocumentId(visibleDocs[0]!.id);
    }
  }, [visibleDocs, selectedDocumentId, activePartnerId]);

  const selectedDocument: OfficeDocument | null =
    visibleDocs.find((doc) => doc.id === selectedDocumentId) ?? null;

  const timeline =
    activePartnerId !== null ? listPartnerTimeline(activePartnerId, 12) : [];

  function bump() {
    setRevision((value) => value + 1);
  }

  return (
    <div className="office-docs" data-testid="office-documents-workspace">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Dokumenty</p>
        <h1 className="office-dashboard__title">Document Workspace</h1>
        <p className="office-dashboard__lead">
          Historie a stav obchodních dokumentů — Preview, Send, Download.
          Dokumenty vydává Document Runtime (Business Automation), ne Office.
        </p>
      </header>

      <div className="office-docs__grid">
        <PlatformCard
          className="office-docs__partners"
          title="Document Center"
          description="Dokumenty podle partnera"
        >
          <ul className="office-partners__list">
            {partners.map((entry) => {
              const pack = getDocumentPackage(entry.id);
              const active = entry.id === activePartnerId;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={
                      active
                        ? 'office-partners__item office-partners__item--active'
                        : 'office-partners__item'
                    }
                    onClick={() => onSelectPartner(entry.id)}
                    aria-current={active ? 'true' : undefined}
                    data-testid={`office-docs-partner-${entry.id}`}
                  >
                    <div className="office-partners__item-head">
                      <span className="office-partners__item-name">
                        {entry.name}
                      </span>
                      <PlatformStatusBadge
                        tone={packageStatusTone(pack?.status ?? 'empty')}
                      >
                        {
                          OFFICE_DOCUMENT_PACKAGE_STATUS_LABELS[
                            pack?.status ?? 'empty'
                          ]
                        }
                      </PlatformStatusBadge>
                    </div>
                    <p className="office-partners__item-meta">
                      {pack?.documents.length ?? 0} dokumentů
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </PlatformCard>

        <div className="office-docs__main">
          {partner === null || activePackage === null ? (
            <PlatformEmptyState
              title="Vyberte partnera"
              description="Document Workspace navazuje na potvrzenou nabídku partnera."
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
                    {
                      OFFICE_DOCUMENT_PACKAGE_STATUS_LABELS[
                        activePackage.status
                      ]
                    }
                  </p>
                </div>
                <PlatformStatusBadge
                  tone={packageStatusTone(activePackage.status)}
                >
                  {
                    OFFICE_DOCUMENT_PACKAGE_STATUS_LABELS[
                      activePackage.status
                    ]
                  }
                </PlatformStatusBadge>
              </header>

              <PlatformCard
                title="Lifecycle"
                description="Send · Click-wrap — bez vytváření dokumentů"
              >
                <div
                  className="office-partner-actions"
                  role="group"
                  aria-label="Document lifecycle actions"
                >
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm"
                    disabled={activePackage.documents.length === 0}
                    onClick={() => {
                      sendDocumentPackage(partner.id, emailTo);
                      bump();
                    }}
                    data-testid="office-docs-send"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm"
                    disabled={activePackage.documents.length === 0}
                    onClick={() => {
                      confirmClickWrap(partner.id);
                      bump();
                    }}
                    data-testid="office-docs-clickwrap"
                  >
                    Click-wrap
                  </button>
                </div>
              </PlatformCard>

              <div className="office-docs__split">
                <PlatformCard title="Seznam dokumentů">
                  <label className="office-partners__search">
                    <span className="sr-only">Hledat dokument</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Hledat dokument…"
                      className="office-partners__search-input"
                    />
                  </label>
                  <div
                    className="office-partners__filters"
                    role="group"
                    aria-label="Filtr typu dokumentu"
                  >
                    <button
                      type="button"
                      className={
                        typeFilter === 'all'
                          ? 'office-partners__filter office-partners__filter--active'
                          : 'office-partners__filter'
                      }
                      onClick={() => setTypeFilter('all')}
                    >
                      Vše
                    </button>
                    {OFFICE_DOCUMENT_TYPE_ORDER.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={
                          typeFilter === type
                            ? 'office-partners__filter office-partners__filter--active'
                            : 'office-partners__filter'
                        }
                        onClick={() => setTypeFilter(type)}
                      >
                        {OFFICE_DOCUMENT_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>

                  {visibleDocs.length === 0 ? (
                    <PlatformEmptyState
                      title="Žádné dokumenty"
                      description="Dokumenty vznikají z Business Event přes Document Runtime."
                    />
                  ) : (
                    <ul className="office-partners__list">
                      {visibleDocs.map((doc) => {
                        const active = doc.id === selectedDocument?.id;
                        return (
                          <li key={doc.id}>
                            <button
                              type="button"
                              className={
                                active
                                  ? 'office-partners__item office-partners__item--active'
                                  : 'office-partners__item'
                              }
                              onClick={() => setSelectedDocumentId(doc.id)}
                              data-testid={`office-doc-row-${doc.type}`}
                            >
                              <div className="office-partners__item-head">
                                <span className="office-partners__item-name">
                                  {OFFICE_DOCUMENT_TYPE_LABELS[doc.type]}
                                </span>
                                <PlatformStatusBadge
                                  tone={documentStatusTone(doc.status)}
                                >
                                  {
                                    OFFICE_DOCUMENT_STATUS_LABELS[
                                      doc.status
                                    ]
                                  }
                                </PlatformStatusBadge>
                              </div>
                              <p className="office-partners__item-meta">
                                {doc.name}
                              </p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </PlatformCard>

                <PlatformCard title="Document Detail">
                  {selectedDocument === null ? (
                    <PlatformEmptyState
                      title="Vyberte dokument"
                      description="Detail zobrazí název, typ, stav a data."
                    />
                  ) : (
                    <dl className="office-partner-dl">
                      <div>
                        <dt>Název</dt>
                        <dd>{selectedDocument.name}</dd>
                      </div>
                      <div>
                        <dt>Typ</dt>
                        <dd>
                          {
                            OFFICE_DOCUMENT_TYPE_LABELS[
                              selectedDocument.type
                            ]
                          }
                        </dd>
                      </div>
                      <div>
                        <dt>Stav</dt>
                        <dd>
                          <PlatformStatusBadge
                            tone={documentStatusTone(selectedDocument.status)}
                          >
                            {
                              OFFICE_DOCUMENT_STATUS_LABELS[
                                selectedDocument.status
                              ]
                            }
                          </PlatformStatusBadge>
                        </dd>
                      </div>
                      <div>
                        <dt>Datum vytvoření</dt>
                        <dd>
                          {formatOfficeEventTime(selectedDocument.createdAt)}
                        </dd>
                      </div>
                      <div>
                        <dt>Datum odeslání</dt>
                        <dd>
                          {selectedDocument.sentAt !== null
                            ? formatOfficeEventTime(selectedDocument.sentAt)
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  )}
                </PlatformCard>
              </div>

              <div className="office-partner-detail__cards">
                <PlatformCard
                  title="Email Delivery"
                  description="MVP odeslání dokumentového balíčku"
                >
                  <div className="office-sales__offer-form">
                    <PlatformField label="E-mail partnera">
                      <input
                        type="email"
                        value={emailTo}
                        onChange={(event) => setEmailTo(event.target.value)}
                        data-testid="office-docs-email"
                      />
                    </PlatformField>
                    <p className="office-list__meta">
                      {activePackage.emailSentAt !== null
                        ? `Odesláno ${formatOfficeEventTime(activePackage.emailSentAt)} → ${activePackage.emailTo}`
                        : 'Balíček zatím nebyl odeslán.'}
                    </p>
                  </div>
                </PlatformCard>

                <PlatformCard
                  title="Click-wrap"
                  description="Potvrzení dokumentového balíčku (bez e-podpisu)"
                >
                  {activePackage.clickWrapConfirmedAt !== null ? (
                    <div className="office-sales__waiting">
                      <PlatformStatusBadge tone="gold">
                        Potvrzeno
                      </PlatformStatusBadge>
                      <p className="office-dashboard__hint">
                        {formatOfficeEventTime(
                          activePackage.clickWrapConfirmedAt,
                        )}
                      </p>
                    </div>
                  ) : (
                    <PlatformEmptyState
                      title="Čeká na Click-wrap"
                      description="Partner potvrdí balíček jedním MVP krokem."
                    />
                  )}
                </PlatformCard>
              </div>

              <PlatformCard
                title="Proforma"
                description="Vytvoření a zobrazení proforma faktury"
              >
                {activePackage.proforma === null ? (
                  <PlatformEmptyState
                    title="Proforma ještě nevznikla"
                    description="Vydání Proforma zapíše ProformaIssued do Timeline."
                  />
                ) : (
                  <dl className="office-partner-dl">
                    <div>
                      <dt>Číslo</dt>
                      <dd>{activePackage.proforma.number}</dd>
                    </div>
                    <div>
                      <dt>Částka</dt>
                      <dd>
                        {formatCzk(activePackage.proforma.amountCzk)}
                      </dd>
                    </div>
                    <div>
                      <dt>Splatnost</dt>
                      <dd>{activePackage.proforma.dueLabel}</dd>
                    </div>
                    <div>
                      <dt>Vydáno</dt>
                      <dd>
                        {formatOfficeEventTime(
                          activePackage.proforma.issuedAt,
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </PlatformCard>

              <PlatformCard
                title="Timeline"
                description="Dokumentové události z Event Catalog"
              >
                {timeline.length === 0 ? (
                  <PlatformEmptyState
                    title="Zatím žádné události"
                    description="DocumentsPrepared / Sent / ClickWrap / Proforma se zapíší sem."
                  />
                ) : (
                  <ol className="office-activity" aria-label="Document Timeline">
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
