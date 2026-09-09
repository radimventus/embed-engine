/**
 * TASK 108 — server-owned invitation deadlines.
 * Legacy records retain their original expiry.
 * Reading a deadline never starts or extends the activation window.
 */
export const FIRST_OPEN_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
export const ACTIVATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type InviteTiming = {
  readonly lifecycleVersion?: 2;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly firstOpenedAt?: string | null;
};

export type InviteAccessStatus =
  | 'pending'
  | 'activated'
  | 'revoked'
  | 'expired';

function timestamp(value: string): number {
  return Date.parse(value);
}

export function createInviteTiming(nowMs: number): InviteTiming {
  if (!Number.isFinite(nowMs)) throw new Error('Invalid server time.');
  return {
    lifecycleVersion: 2,
    createdAt: new Date(nowMs).toISOString(),
    firstOpenedAt: null,
    expiresAt: new Date(nowMs + FIRST_OPEN_WINDOW_MS).toISOString(),
  };
}

export function inviteDeadlineMs(invite: InviteTiming): number {
  const persistedDeadline = timestamp(invite.expiresAt);
  if (!Number.isFinite(persistedDeadline)) return Number.NaN;

  // Do not grant a fresh window to invitations issued under older rules.
  if (invite.lifecycleVersion !== 2) return persistedDeadline;

  const created = timestamp(invite.createdAt);
  if (!Number.isFinite(created)) return Number.NaN;

  let expected: number;
  if (invite.firstOpenedAt == null) {
    expected = created + FIRST_OPEN_WINDOW_MS;
  } else {
    const opened = timestamp(invite.firstOpenedAt);
    if (
      !Number.isFinite(opened) ||
      opened < created ||
      opened >= created + FIRST_OPEN_WINDOW_MS
    ) {
      return Number.NaN;
    }
    expected = opened + ACTIVATION_WINDOW_MS;
  }

  // A corrupt or shortened persisted deadline must not extend access.
  return Math.min(expected, persistedDeadline);
}

export function invitationStatus(
  invite: InviteTiming & { readonly status: InviteAccessStatus },
  nowMs: number,
): InviteAccessStatus {
  if (invite.status !== 'pending') return invite.status;
  const deadline = inviteDeadlineMs(invite);
  return Number.isFinite(nowMs) &&
    Number.isFinite(deadline) &&
    nowMs < deadline
    ? 'pending'
    : 'expired';
}

/**
 * Must be called inside the repository's serialized durable mutation.
 * Returns null when the invitation can no longer be opened.
 * Repeated calls preserve the first opening and its deadline.
 */
export function firstOpenInvite<
  T extends InviteTiming & { readonly status: InviteAccessStatus },
>(invite: T, nowMs: number): T | null {
  if (invitationStatus(invite, nowMs) !== 'pending') return null;

  // Preserve legacy deadlines and already-started windows.
  if (invite.lifecycleVersion !== 2 || invite.firstOpenedAt != null) {
    return invite;
  }

  if (nowMs < timestamp(invite.createdAt)) return null;

  return {
    ...invite,
    firstOpenedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + ACTIVATION_WINDOW_MS).toISOString(),
  };
}
