/**
 * PE-07 — Pilot Delivery package / preview domain (Office MVP, no SMTP).
 * Finalizes the partner delivery package: deep-link, invitation state, activation state.
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
  /** MVP local attachment reference — not SMTP binary transfer. */
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
  /** Deep-link into Partner Workspace with invite token. */
  readonly workspaceHref: string;
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
