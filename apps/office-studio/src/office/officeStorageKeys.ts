/**
 * OF-10 — Office localStorage key convention: conis.office.<domain>.v1
 */

export const OFFICE_STORAGE_KEYS = Object.freeze({
  partners: 'conis.office.partners.v1',
  sales: 'conis.office.sales.v1',
  documents: 'conis.office.documents.v1',
  events: 'conis.office.events.v1',
  handoffs: 'conis.office.handoffs.v1',
  lifecycle: 'conis.office.lifecycle.v1',
  administration: 'conis.office.administration.v1',
  /** PT-VR-01A — last active Working Terminal case. */
  workspaceRecovery: 'conis.office.workspaceRecovery.v1',
} as const);

export type OfficeStorageKey =
  (typeof OFFICE_STORAGE_KEYS)[keyof typeof OFFICE_STORAGE_KEYS];
