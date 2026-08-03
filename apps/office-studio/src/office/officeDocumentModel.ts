/**
 * OF-04 — Office Document Workspace model (MVP).
 * Guided document workflow after confirmed offer — not a DMS / file store.
 */

export type OfficeDocumentType =
  | 'offer'
  | 'framework'
  | 'implementation_standard'
  | 'dpa'
  | 'vop'
  | 'proforma';

export type OfficeDocumentStatus =
  | 'draft'
  | 'prepared'
  | 'sent'
  | 'clickwrap_confirmed'
  | 'issued';

export type OfficeDocumentPackageStatus =
  | 'empty'
  | 'prepared'
  | 'sent'
  | 'clickwrap_confirmed'
  | 'proforma_issued';

export type OfficeDocument = {
  readonly id: string;
  readonly partnerId: string;
  readonly type: OfficeDocumentType;
  readonly name: string;
  readonly status: OfficeDocumentStatus;
  readonly createdAt: string;
  readonly sentAt: string | null;
};

export type OfficeProforma = {
  readonly id: string;
  readonly partnerId: string;
  readonly documentId: string;
  readonly number: string;
  readonly amountCzk: number;
  readonly issuedAt: string;
  readonly dueLabel: string;
};

export type OfficeDocumentPackage = {
  readonly partnerId: string;
  readonly status: OfficeDocumentPackageStatus;
  readonly documents: readonly OfficeDocument[];
  readonly clickWrapConfirmedAt: string | null;
  readonly emailSentAt: string | null;
  readonly emailTo: string | null;
  readonly proforma: OfficeProforma | null;
};

export const OFFICE_DOCUMENT_TYPE_LABELS: Record<OfficeDocumentType, string> = {
  offer: 'Nabídka',
  framework: 'Rámcová smlouva',
  implementation_standard: 'Implementační standard',
  dpa: 'DPA',
  vop: 'VOP',
  proforma: 'Proforma',
};

export const OFFICE_DOCUMENT_STATUS_LABELS: Record<
  OfficeDocumentStatus,
  string
> = {
  draft: 'Koncept',
  prepared: 'Připraveno',
  sent: 'Odesláno',
  clickwrap_confirmed: 'Click-wrap',
  issued: 'Vydáno',
};

export const OFFICE_DOCUMENT_PACKAGE_STATUS_LABELS: Record<
  OfficeDocumentPackageStatus,
  string
> = {
  empty: 'Bez balíčku',
  prepared: 'Připraveno',
  sent: 'Odesláno',
  clickwrap_confirmed: 'Click-wrap potvrzen',
  proforma_issued: 'Proforma vydána',
};

export const OFFICE_DOCUMENT_TYPE_ORDER: readonly OfficeDocumentType[] =
  Object.freeze([
    'offer',
    'framework',
    'implementation_standard',
    'dpa',
    'vop',
    'proforma',
  ]);

export function documentStatusTone(
  status: OfficeDocumentStatus,
): 'draft' | 'info' | 'warning' | 'gold' | 'pass' {
  switch (status) {
    case 'draft':
      return 'draft';
    case 'prepared':
      return 'info';
    case 'sent':
      return 'warning';
    case 'clickwrap_confirmed':
      return 'gold';
    case 'issued':
      return 'pass';
  }
}

export function packageStatusTone(
  status: OfficeDocumentPackageStatus,
): 'draft' | 'info' | 'warning' | 'gold' | 'pass' {
  switch (status) {
    case 'empty':
      return 'draft';
    case 'prepared':
      return 'info';
    case 'sent':
      return 'warning';
    case 'clickwrap_confirmed':
      return 'gold';
    case 'proforma_issued':
      return 'pass';
  }
}
