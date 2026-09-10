export type PartnerPasswordResetDeliveryInput = {
  readonly email: string;
  readonly token: string;
  readonly expiresAt: string;
};

export interface PartnerPasswordResetDelivery {
  sendPasswordReset(
    input: PartnerPasswordResetDeliveryInput,
  ): Promise<void>;
}

/**
 * Fail-closed default until the production SMTP adapter is configured.
 * Public HTTP responses remain generic and never expose whether an account
 * or delivery exists.
 */
export class UnavailablePartnerPasswordResetDelivery
  implements PartnerPasswordResetDelivery
{
  async sendPasswordReset(): Promise<void> {
    throw new Error('Partner password-reset delivery is not configured.');
  }
}
