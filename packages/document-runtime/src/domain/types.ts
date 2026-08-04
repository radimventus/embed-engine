/**
 * PT-15 — Commercial document domain types.
 * Pure — no React · no SMTP · no Office UI.
 */

export type CommercialDocumentType =
  | 'electronic_order'
  | 'framework'
  | 'implementation_standard'
  | 'dpa'
  | 'vop'
  | 'proforma';

export type DocumentLifecycleStatus =
  | 'draft'
  | 'generated'
  | 'attached'
  | 'sent'
  | 'archived';

export type DocumentContext = {
  readonly projectId: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly packageName: string;
  readonly orderId: string | null;
  readonly proformaNumber: string | null;
  readonly amountCzk: number | null;
  readonly issuedAt: string;
  readonly dueDate: string | null;
  readonly contactEmail: string | null;
};

export type DocumentCatalogEntry = {
  readonly type: CommercialDocumentType;
  readonly label: string;
  readonly sourcePath: string;
  readonly individualized: boolean;
  readonly linkedToElectronicOrder: boolean;
};

export type DocumentAttachment = {
  readonly fileName: string;
  readonly mimeType: 'application/pdf';
  readonly bytesBase64: string;
  readonly byteLength: number;
};

export type DocumentArtifact = {
  readonly id: string;
  readonly type: CommercialDocumentType;
  readonly label: string;
  readonly projectId: string;
  readonly version: number;
  readonly status: DocumentLifecycleStatus;
  readonly createdAt: string;
  readonly context: DocumentContext;
  readonly sourcePath: string;
  readonly attachment: DocumentAttachment;
  readonly businessEventKind: string | null;
};

export const COMMERCIAL_DOCUMENT_LABELS: Readonly<
  Record<CommercialDocumentType, string>
> = Object.freeze({
  electronic_order: 'Elektronická objednávka',
  framework: 'Rámcová smlouva',
  implementation_standard: 'Implementační standard',
  dpa: 'DPA',
  vop: 'VOP',
  proforma: 'Proforma faktura',
});

export const DEAL_PACKAGE_ROOT = 'docs/platform/office/deal' as const;
