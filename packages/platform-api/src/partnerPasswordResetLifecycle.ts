import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

export const PASSWORD_RESET_WINDOW_MS = 60 * 60 * 1000;

export type PartnerPasswordResetStatus =
  | 'pending'
  | 'used'
  | 'revoked'
  | 'expired';

export type PartnerPasswordResetRecord = {
  readonly id: string;
  readonly accountId: string;
  readonly tokenVerifier: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly status: Exclude<PartnerPasswordResetStatus, 'expired'>;
  readonly usedAt: string | null;
  readonly revokedAt: string | null;
};

export type IssuedPartnerPasswordReset = {
  readonly token: string;
  readonly record: PartnerPasswordResetRecord;
};

export function createPartnerPasswordReset(
  accountId: string,
  nowMs = Date.now(),
): IssuedPartnerPasswordReset {
  const normalizedAccountId = accountId.trim();

  if (normalizedAccountId.length === 0 || !Number.isFinite(nowMs)) {
    throw new Error('A valid account and time are required.');
  }

  const token = randomBytes(32).toString('base64url');
  const createdAt = new Date(nowMs).toISOString();

  return {
    token,
    record: {
      id: `password-reset-${randomBytes(16).toString('hex')}`,
      accountId: normalizedAccountId,
      tokenVerifier: passwordResetTokenVerifier(token),
      createdAt,
      expiresAt: new Date(nowMs + PASSWORD_RESET_WINDOW_MS).toISOString(),
      status: 'pending',
      usedAt: null,
      revokedAt: null,
    },
  };
}

export function passwordResetTokenVerifier(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function passwordResetTokenMatches(
  record: PartnerPasswordResetRecord,
  token: string,
): boolean {
  const actual = Buffer.from(passwordResetTokenVerifier(token), 'hex');
  const expected = Buffer.from(record.tokenVerifier, 'hex');

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export function partnerPasswordResetStatus(
  record: PartnerPasswordResetRecord,
  nowMs = Date.now(),
): PartnerPasswordResetStatus {
  if (record.status !== 'pending') {
    return record.status;
  }

  const createdAt = Date.parse(record.createdAt);
  const expiresAt = Date.parse(record.expiresAt);

  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(createdAt) ||
    !Number.isFinite(expiresAt) ||
    expiresAt !== createdAt + PASSWORD_RESET_WINDOW_MS ||
    nowMs < createdAt ||
    nowMs >= expiresAt
  ) {
    return 'expired';
  }

  return 'pending';
}

export function usePartnerPasswordReset(
  record: PartnerPasswordResetRecord,
  nowMs = Date.now(),
): PartnerPasswordResetRecord | null {
  if (partnerPasswordResetStatus(record, nowMs) !== 'pending') {
    return null;
  }

  return {
    ...record,
    status: 'used',
    usedAt: new Date(nowMs).toISOString(),
  };
}

export function revokePartnerPasswordReset(
  record: PartnerPasswordResetRecord,
  nowMs = Date.now(),
): PartnerPasswordResetRecord {
  if (partnerPasswordResetStatus(record, nowMs) !== 'pending') {
    return record;
  }

  return {
    ...record,
    status: 'revoked',
    revokedAt: new Date(nowMs).toISOString(),
  };
}

export function revokePendingPasswordResets(
  records: readonly PartnerPasswordResetRecord[],
  accountId: string,
  nowMs = Date.now(),
): readonly PartnerPasswordResetRecord[] {
  return records.map((record) =>
    record.accountId === accountId
      ? revokePartnerPasswordReset(record, nowMs)
      : record,
  );
}
