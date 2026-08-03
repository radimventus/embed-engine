/**
 * OF-05 — Builder Handoff model (MVP).
 * PaymentReceived → Implementation → Builder Workspace / Project / Object.
 * Out of scope: Publish, Runtime Deployment, AI, OCR, Licence, post-payment invoicing.
 */

export type OfficeHandoffStatus =
  | 'waiting_payment'
  | 'payment_received'
  | 'builder_ready';

export type OfficeBuilderObject = {
  readonly id: string;
  readonly name: string;
  readonly kind: 'house';
};

export type OfficeBuilderProject = {
  readonly id: string;
  readonly name: string;
  readonly packageId: string;
  readonly packageLabel: string;
  readonly object: OfficeBuilderObject;
};

export type OfficeBuilderWorkspace = {
  readonly id: string;
  readonly name: string;
  readonly builderHref: string;
  readonly project: OfficeBuilderProject;
};

export type OfficePartnerContext = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly companyLegalName: string;
  readonly contactEmail: string;
  readonly packageId: string | null;
  readonly packageLabel: string | null;
  readonly amountCzk: number | null;
};

export type OfficeHandoffSummary = {
  readonly partnerId: string;
  readonly status: OfficeHandoffStatus;
  readonly partnerContext: OfficePartnerContext;
  readonly workspace: OfficeBuilderWorkspace | null;
  readonly paymentReceivedAt: string | null;
  readonly workspaceCreatedAt: string | null;
  readonly builderReadyAt: string | null;
};

export const OFFICE_HANDOFF_STATUS_LABELS: Record<
  OfficeHandoffStatus,
  string
> = {
  waiting_payment: 'Waiting Payment',
  payment_received: 'PaymentReceived',
  builder_ready: 'Builder Ready',
};

export function handoffStatusTone(
  status: OfficeHandoffStatus,
): 'gold' | 'warning' | 'pass' {
  switch (status) {
    case 'waiting_payment':
      return 'gold';
    case 'payment_received':
      return 'warning';
    case 'builder_ready':
      return 'pass';
  }
}
