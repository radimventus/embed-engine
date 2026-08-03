/**
 * OF-04 — Document Workspace registry (in-memory MVP workflow).
 * Prepare → Email Delivery → Click-wrap → Proforma. No DMS / PaymentReceived.
 */

import { appendOfficeEvent } from './officeEventCatalog';
import { getPartner, listPartners } from './officePartnerRegistry';
import { getSalesCase } from './officeSalesRegistry';
import { formatCzk, getSalesPackage } from './officeSalesModel';
import {
  OFFICE_DOCUMENT_TYPE_LABELS,
  type OfficeDocument,
  type OfficeDocumentPackage,
  type OfficeDocumentPackageStatus,
  type OfficeDocumentStatus,
  type OfficeDocumentType,
  type OfficeProforma,
} from './officeDocumentModel';

function nowIso(): string {
  return new Date().toISOString();
}

function documentName(
  partnerName: string,
  type: OfficeDocumentType,
): string {
  return `${OFFICE_DOCUMENT_TYPE_LABELS[type]} · ${partnerName}`;
}

function buildPreparedDocuments(
  partnerId: string,
  partnerName: string,
  createdAt: string,
  includeProformaDraft: boolean,
): OfficeDocument[] {
  const types: OfficeDocumentType[] = [
    'offer',
    'framework',
    'implementation_standard',
    'dpa',
    'vop',
  ];
  if (includeProformaDraft) {
    types.push('proforma');
  }
  return types.map((type) => ({
    id: `doc-${partnerId}-${type}`,
    partnerId,
    type,
    name: documentName(partnerName, type),
    status: 'prepared' as const,
    createdAt,
    sentAt: null,
  }));
}

function emptyPackage(partnerId: string): OfficeDocumentPackage {
  return {
    partnerId,
    status: 'empty',
    documents: [],
    clickWrapConfirmedAt: null,
    emailSentAt: null,
    emailTo: null,
    proforma: null,
  };
}

const SEED_PACKAGES: readonly OfficeDocumentPackage[] = Object.freeze([
  {
    partnerId: 'p-blokki',
    status: 'prepared',
    documents: buildPreparedDocuments(
      'p-blokki',
      'Blokki',
      '2026-08-02T15:00:00.000Z',
      false,
    ),
    clickWrapConfirmedAt: null,
    emailSentAt: null,
    emailTo: null,
    proforma: null,
  },
  {
    partnerId: 'p-linea',
    status: 'sent',
    documents: buildPreparedDocuments(
      'p-linea',
      'Linea Domů',
      '2026-08-02T12:00:00.000Z',
      false,
    ).map((doc) => ({
      ...doc,
      status: 'sent' as const,
      sentAt: '2026-08-02T13:30:00.000Z',
    })),
    clickWrapConfirmedAt: null,
    emailSentAt: '2026-08-02T13:30:00.000Z',
    emailTo: 'petr@lineadomu.cz',
    proforma: null,
  },
]);

let packages: OfficeDocumentPackage[] = SEED_PACKAGES.map((entry) => ({
  ...entry,
  documents: entry.documents.map((doc) => ({ ...doc })),
  proforma: entry.proforma === null ? null : { ...entry.proforma },
}));

function upsertPackage(next: OfficeDocumentPackage): OfficeDocumentPackage {
  const index = packages.findIndex(
    (entry) => entry.partnerId === next.partnerId,
  );
  if (index < 0) {
    packages = [...packages, next];
  } else {
    packages = packages.map((entry, i) => (i === index ? next : entry));
  }
  return next;
}

function ensurePackage(partnerId: string): OfficeDocumentPackage {
  const existing = packages.find((entry) => entry.partnerId === partnerId);
  if (existing !== undefined) return existing;
  return upsertPackage(emptyPackage(partnerId));
}

function resolveProformaAmount(partnerId: string): number {
  const sales = getSalesCase(partnerId);
  if (sales?.order != null) return sales.order.amountCzk;
  if (sales?.offer.packageId != null) {
    return getSalesPackage(sales.offer.packageId).priceCzk;
  }
  return 49_000;
}

export function listDocumentPackages(): readonly OfficeDocumentPackage[] {
  const partnerIds = new Set(listPartners().map((partner) => partner.id));
  for (const partnerId of partnerIds) {
    ensurePackage(partnerId);
  }
  return [...packages]
    .filter((entry) => partnerIds.has(entry.partnerId))
    .sort((a, b) => a.partnerId.localeCompare(b.partnerId));
}

export function getDocumentPackage(
  partnerId: string,
): OfficeDocumentPackage | null {
  if (getPartner(partnerId) === null) return null;
  return ensurePackage(partnerId);
}

export function getDocument(
  partnerId: string,
  documentId: string,
): OfficeDocument | null {
  const pack = getDocumentPackage(partnerId);
  return pack?.documents.find((doc) => doc.id === documentId) ?? null;
}

export function prepareDocumentPackage(
  partnerId: string,
): OfficeDocumentPackage | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const createdAt = nowIso();
  const next = upsertPackage({
    partnerId,
    status: 'prepared',
    documents: buildPreparedDocuments(partnerId, partner.name, createdAt, false),
    clickWrapConfirmedAt: null,
    emailSentAt: null,
    emailTo: null,
    proforma: null,
  });
  appendOfficeEvent({
    kind: 'documents.prepared',
    label: 'DocumentsPrepared',
    detail: `${partner.name} · ${next.documents.length} dokumentů`,
    partnerId,
  });
  return next;
}

export function sendDocumentPackage(
  partnerId: string,
  emailTo?: string,
): OfficeDocumentPackage | null {
  const partner = getPartner(partnerId);
  const current = getDocumentPackage(partnerId);
  if (partner === null || current === null) return null;
  if (current.documents.length === 0) return current;

  const sentAt = nowIso();
  const to =
    emailTo?.trim() ||
    partner.contact.email ||
    `office+${partnerId}@conis.cz`;
  const documents = current.documents.map((doc) => ({
    ...doc,
    status:
      doc.type === 'proforma' && doc.status === 'issued'
        ? ('issued' as const)
        : ('sent' as const),
    sentAt: doc.sentAt ?? sentAt,
  }));

  const next = upsertPackage({
    ...current,
    status: 'sent',
    documents,
    emailSentAt: sentAt,
    emailTo: to,
  });
  appendOfficeEvent({
    kind: 'documents.sent',
    label: 'DocumentsSent',
    detail: `${partner.name} · e-mail ${to}`,
    partnerId,
  });
  return next;
}

export function confirmClickWrap(
  partnerId: string,
): OfficeDocumentPackage | null {
  const partner = getPartner(partnerId);
  const current = getDocumentPackage(partnerId);
  if (partner === null || current === null) return null;
  if (current.documents.length === 0) return current;

  const confirmedAt = nowIso();
  const documents = current.documents.map((doc) =>
    doc.type === 'proforma' && doc.status === 'issued'
      ? doc
      : {
          ...doc,
          status: 'clickwrap_confirmed' as const,
        },
  );

  const next = upsertPackage({
    ...current,
    status: 'clickwrap_confirmed',
    documents,
    clickWrapConfirmedAt: confirmedAt,
  });
  appendOfficeEvent({
    kind: 'clickwrap.confirmed',
    label: 'ClickWrapConfirmed',
    detail: `${partner.name} · dokumentový balíček potvrzen`,
    partnerId,
  });
  return next;
}

export function issueProforma(
  partnerId: string,
): OfficeDocumentPackage | null {
  const partner = getPartner(partnerId);
  const current = getDocumentPackage(partnerId);
  if (partner === null || current === null) return null;
  if (current.documents.length === 0) {
    prepareDocumentPackage(partnerId);
  }
  const pack = getDocumentPackage(partnerId);
  if (pack === null) return null;

  const issuedAt = nowIso();
  const amountCzk = resolveProformaAmount(partnerId);
  const proformaDoc: OfficeDocument = {
    id: `doc-${partnerId}-proforma`,
    partnerId,
    type: 'proforma',
    name: documentName(partner.name, 'proforma'),
    status: 'issued',
    createdAt: issuedAt,
    sentAt: pack.emailSentAt,
  };
  const withoutOldProforma = pack.documents.filter(
    (doc) => doc.type !== 'proforma',
  );
  const proforma: OfficeProforma = {
    id: `proforma-${partnerId}`,
    partnerId,
    documentId: proformaDoc.id,
    number: `PF-${partnerId.toUpperCase()}-001`,
    amountCzk,
    issuedAt,
    dueLabel: '14 dní',
  };

  const next = upsertPackage({
    ...pack,
    status: 'proforma_issued',
    documents: [...withoutOldProforma, proformaDoc],
    proforma,
  });
  appendOfficeEvent({
    kind: 'proforma.issued',
    label: 'ProformaIssued',
    detail: `${proforma.number} · ${formatCzk(amountCzk)}`,
    partnerId,
  });
  return next;
}

export function filterDocuments(
  documents: readonly OfficeDocument[],
  query: string,
  typeFilter: 'all' | OfficeDocumentType,
): readonly OfficeDocument[] {
  const normalized = query.trim().toLowerCase();
  return documents.filter((doc) => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
    if (normalized.length === 0) return true;
    const haystack = [
      doc.name,
      OFFICE_DOCUMENT_TYPE_LABELS[doc.type],
      doc.status,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function resetDocumentRegistryForTests(): void {
  packages = SEED_PACKAGES.map((entry) => ({
    ...entry,
    documents: entry.documents.map((doc) => ({ ...doc })),
    proforma: entry.proforma === null ? null : { ...entry.proforma },
  }));
}

// silence unused type re-exports for consumers
export type {
  OfficeDocumentPackageStatus,
  OfficeDocumentStatus,
};
