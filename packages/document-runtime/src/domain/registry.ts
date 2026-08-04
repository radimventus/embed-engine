/**
 * PT-15 — Document Registry (commercial catalog).
 * Sources live in docs/platform/office/deal.
 */

import {
  COMMERCIAL_DOCUMENT_LABELS,
  DEAL_PACKAGE_ROOT,
  type CommercialDocumentType,
  type DocumentCatalogEntry,
} from './types';

const SOURCE_FILES: Readonly<Record<CommercialDocumentType, string>> =
  Object.freeze({
    electronic_order: 'electronic-order.html',
    framework: 'framework-agreement.html',
    implementation_standard: 'implementation-standard.html',
    dpa: 'dpa.html',
    vop: 'vop.html',
    proforma: 'proforma-invoice.html',
  });

export const COMMERCIAL_DOCUMENT_CATALOG: readonly DocumentCatalogEntry[] =
  Object.freeze(
    (
      [
        'electronic_order',
        'framework',
        'implementation_standard',
        'dpa',
        'vop',
        'proforma',
      ] as const
    ).map((type) => ({
      type,
      label: COMMERCIAL_DOCUMENT_LABELS[type],
      sourcePath: `${DEAL_PACKAGE_ROOT}/${SOURCE_FILES[type]}`,
      individualized: type === 'electronic_order' || type === 'proforma',
      linkedToElectronicOrder: type !== 'proforma',
    })),
  );

export function getCatalogEntry(
  type: CommercialDocumentType,
): DocumentCatalogEntry {
  const found = COMMERCIAL_DOCUMENT_CATALOG.find((item) => item.type === type);
  if (found === undefined) {
    throw new Error(`Unknown commercial document type: ${type}`);
  }
  return found;
}

/** Documents issued with individualized electronic order (contractual frame). */
export const ELECTRONIC_ORDER_PACKAGE: readonly CommercialDocumentType[] =
  Object.freeze([
    'electronic_order',
    'framework',
    'implementation_standard',
    'dpa',
    'vop',
  ]);

export function documentsForBusinessEvent(
  eventKind: string,
): readonly CommercialDocumentType[] {
  switch (eventKind) {
    case 'OrderConfirmed':
      return ELECTRONIC_ORDER_PACKAGE;
    case 'ProformaGenerated':
      return ['proforma'];
    default:
      return [];
  }
}
