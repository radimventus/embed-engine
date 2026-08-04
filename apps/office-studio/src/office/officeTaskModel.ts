/**
 * PT-16 — Office Task domain (automation-created work items).
 * Bound to active commercial project — no CRM · no scheduler.
 */

export type OfficeTaskId = string;

export type OfficeTaskKind =
  | 'waiting_send'
  | 'waiting_review'
  | 'waiting_payment'
  | 'waiting_builder';

export type OfficeTaskStatus = 'open' | 'done' | 'cancelled';

export type OfficeTask = {
  readonly id: OfficeTaskId;
  readonly projectId: string;
  readonly kind: OfficeTaskKind;
  readonly label: string;
  readonly status: OfficeTaskStatus;
  readonly sourceEventKind: string;
  readonly sourceEventId: string;
  readonly sourceActionId: string;
  readonly createdAt: string;
};

export const OFFICE_TASK_KIND_LABELS: Readonly<Record<OfficeTaskKind, string>> =
  Object.freeze({
    waiting_send: 'Čeká na odeslání',
    waiting_review: 'Čeká na kontrolu',
    waiting_payment: 'Čeká na platbu',
    waiting_builder: 'Čeká na Builder',
  });
