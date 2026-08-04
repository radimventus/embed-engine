/**
 * CAP-OP-09 — Mail transport env configuration (.env).
 * Browser-safe: never touch bare `process` (Vite/browser has no Node process).
 */

export type SmtpEnvConfig = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
};

export type ImapEnvConfig = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
};

export type MailEnvConfig = {
  readonly smtp: SmtpEnvConfig | null;
  readonly imap: ImapEnvConfig | null;
};

function readProcessEnv(): Record<string, string | undefined> {
  try {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process;
    return proc?.env ?? {};
  } catch {
    return {};
  }
}

function readEnv(
  source: Record<string, string | undefined>,
  key: string,
): string | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSecure(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return fallback;
}

export function readSmtpEnvConfig(
  source: Record<string, string | undefined> = readProcessEnv(),
): SmtpEnvConfig | null {
  const host = readEnv(source, 'SMTP_HOST');
  const user = readEnv(source, 'SMTP_USER');
  const password =
    readEnv(source, 'SMTP_PASSWORD') ?? readEnv(source, 'SMTP_PASS');
  if (host === undefined || user === undefined || password === undefined) {
    return null;
  }
  return {
    host,
    port: parsePort(readEnv(source, 'SMTP_PORT'), 587),
    secure: parseSecure(readEnv(source, 'SMTP_SECURE'), false),
    user,
    password,
  };
}

export function readImapEnvConfig(
  source: Record<string, string | undefined> = readProcessEnv(),
): ImapEnvConfig | null {
  const host = readEnv(source, 'IMAP_HOST');
  const user = readEnv(source, 'IMAP_USER');
  const password = readEnv(source, 'IMAP_PASSWORD');
  if (host === undefined || user === undefined || password === undefined) {
    return null;
  }
  return {
    host,
    port: parsePort(readEnv(source, 'IMAP_PORT'), 993),
    secure: parseSecure(readEnv(source, 'IMAP_SECURE'), true),
    user,
    password,
  };
}

export function readMailEnvConfig(
  source: Record<string, string | undefined> = readProcessEnv(),
): MailEnvConfig {
  return {
    smtp: readSmtpEnvConfig(source),
    imap: readImapEnvConfig(source),
  };
}
