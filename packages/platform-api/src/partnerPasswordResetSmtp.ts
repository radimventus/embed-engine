import nodemailer, {
  type SendMailOptions,
} from 'nodemailer';

import type {
  PartnerPasswordResetDelivery,
  PartnerPasswordResetDeliveryInput,
} from './partnerPasswordResetDelivery';
import {
  UnavailablePartnerPasswordResetDelivery,
} from './partnerPasswordResetDelivery';

export type PartnerPasswordResetSmtpConfig = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
  readonly from: string;
  readonly resetUrl: string;
};

type PasswordResetMailTransport = {
  sendMail(input: SendMailOptions): Promise<unknown>;
};

function nonEmpty(value: string | undefined): string | null {
  const normalized = value?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
}

function readPort(value: string | undefined): number {
  const port = Number.parseInt(value ?? '587', 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('SMTP_PORT must be a valid TCP port.');
  }

  return port;
}

function readSecure(value: string | undefined): boolean {
  if (value === undefined || value.trim().length === 0) {
    return false;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1') {
    return true;
  }

  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  throw new Error('SMTP_SECURE must be true, false, 1 or 0.');
}

function readResetUrl(value: string | undefined): string {
  const configured =
    nonEmpty(value) ?? 'https://conis.cz/studio/';
  const url = new URL(configured);

  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      (url.hostname === '127.0.0.1' ||
        url.hostname === 'localhost')
    )
  ) {
    throw new Error(
      'PARTNER_PASSWORD_RESET_URL must use HTTPS outside localhost.',
    );
  }

  url.searchParams.delete('resetToken');
  return url.toString();
}

export function readPartnerPasswordResetSmtpConfig(
  environment: NodeJS.ProcessEnv = process.env,
): PartnerPasswordResetSmtpConfig | null {
  const host = nonEmpty(environment.SMTP_HOST);
  const user = nonEmpty(environment.SMTP_USER);
  const password = nonEmpty(
    environment.SMTP_PASSWORD ?? environment.SMTP_PASS,
  );

  if (host === null || user === null || password === null) {
    return null;
  }

  return {
    host,
    port: readPort(environment.SMTP_PORT),
    secure: readSecure(environment.SMTP_SECURE),
    user,
    password,
    from: nonEmpty(environment.SMTP_FROM) ?? user,
    resetUrl: readResetUrl(
      environment.PARTNER_PASSWORD_RESET_URL,
    ),
  };
}

export function createPartnerPasswordResetMail(
  config: PartnerPasswordResetSmtpConfig,
  input: PartnerPasswordResetDeliveryInput,
): SendMailOptions {
  const resetUrl = new URL(config.resetUrl);
  resetUrl.searchParams.set('resetToken', input.token);

  const expiry = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Prague',
  }).format(new Date(input.expiresAt));

  return {
    from: config.from,
    to: input.email,
    subject: 'CONIS – nastavení nového hesla',
    text: [
      'Dobrý den,',
      '',
      'obdrželi jsme žádost o nastavení nového hesla k vašemu partnerskému účtu CONIS.',
      '',
      `Odkaz pro změnu hesla: ${resetUrl.toString()}`,
      '',
      `Odkaz je platný do ${expiry} a lze jej použít pouze jednou.`,
      '',
      'Pokud jste o změnu hesla nežádali, tento e-mail ignorujte. Vaše současné heslo zůstává beze změny.',
      '',
      'CONIS',
    ].join('\n'),
  };
}

export class SmtpPartnerPasswordResetDelivery
  implements PartnerPasswordResetDelivery
{
  private readonly transport: PasswordResetMailTransport;

  constructor(
    private readonly config: PartnerPasswordResetSmtpConfig,
    transport?: PasswordResetMailTransport,
  ) {
    this.transport =
      transport ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });
  }

  async sendPasswordReset(
    input: PartnerPasswordResetDeliveryInput,
  ): Promise<void> {
    await this.transport.sendMail(
      createPartnerPasswordResetMail(this.config, input),
    );
  }
}

export function createEnvPartnerPasswordResetDelivery(
  environment: NodeJS.ProcessEnv = process.env,
): PartnerPasswordResetDelivery {
  const config = readPartnerPasswordResetSmtpConfig(environment);

  return config === null
    ? new UnavailablePartnerPasswordResetDelivery()
    : new SmtpPartnerPasswordResetDelivery(config);
}
