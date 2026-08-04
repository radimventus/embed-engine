/**
 * PE-07 / PT-CJ-00 — Pilot Delivery package / preview domain.
 * Finalizes the partner delivery package: Studio login, invitation, activation.
 */

export type PilotDeliveryStudioId = 'client' | 'manager' | 'sales';

/** Activation progress derived from the invitation lifecycle. */
export type PilotActivationStatus =
  | 'awaiting_activation'
  | 'activated'
  | 'expired'
  | 'revoked'
  | 'missing';

export type PilotDeliveryInviteSnapshot = {
  readonly token: string;
  readonly status: string;
  readonly expiresAt: string;
  readonly sendCount: number;
  readonly activationStatus: PilotActivationStatus;
};

export type PilotDeliveryPdfAttachment = {
  readonly id: string;
  readonly name: string;
  /** Document Runtime or legacy local attachment reference. */
  readonly href: string;
  readonly attached: true;
  readonly ready: true;
};

export type PilotDeliveryPreview = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly email: string;
  readonly projectName: string;
  readonly accessibleStudios: readonly PilotDeliveryStudioId[];
  readonly invite: PilotDeliveryInviteSnapshot | null;
  readonly activationStatus: PilotActivationStatus;
  /** CONIS Studio login entry (AuthShell). */
  readonly workspaceHref: string;
  readonly studioLoginHref: string;
  readonly loginEmail: string;
  readonly loginPassword: string;
  readonly heroLabel: string;
  readonly websiteUrl: string;
  readonly pdf: PilotDeliveryPdfAttachment;
};

export type PilotDeliveryRecord = {
  readonly id: string;
  readonly partnerId: string;
  readonly preparedAt: string;
  readonly deliveredAt: string;
  readonly preview: PilotDeliveryPreview;
  readonly package: {
    readonly pdf: PilotDeliveryPdfAttachment;
    readonly workspaceHref: string;
    readonly invite: PilotDeliveryInviteSnapshot;
    readonly activationStatus: PilotActivationStatus;
  };
};

export const PILOT_DELIVERY_STUDIOS: readonly PilotDeliveryStudioId[] =
  Object.freeze(['client', 'manager', 'sales']);

export function activationStatusLabel(
  status: PilotActivationStatus,
): string {
  switch (status) {
    case 'awaiting_activation':
      return 'Čeká na aktivaci';
    case 'activated':
      return 'Účet aktivován';
    case 'expired':
      return 'Pozvánka vypršela';
    case 'revoked':
      return 'Pozvánka zrušena';
    case 'missing':
      return 'Pozvánka chybí';
  }
}
