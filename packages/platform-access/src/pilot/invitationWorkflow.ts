/**
 * PE-04 — Invitation lifecycle (validity, status projection).
 * No SMTP — delivery is stamped locally; resend rotates the token.
 */

import type { PilotInvite, PilotInviteStatus } from '../domain/pilotTypes';

/** Default pilot invite validity: 30 minutes. */
export const INVITE_VALIDITY_MS = 30 * 60 * 1000;

export type InviteLifecycleState =
  | 'missing'
  | 'pending'
  | 'activated'
  | 'revoked'
  | 'expired';

export function computeInviteExpiresAt(fromIso: string): string {
  return new Date(Date.parse(fromIso) + INVITE_VALIDITY_MS).toISOString();
}

export function isInvitePastExpiry(
  invite: Pick<PilotInvite, 'expiresAt'>,
  nowMs = Date.now(),
): boolean {
  const expires = Date.parse(invite.expiresAt);
  if (Number.isNaN(expires)) return true;
  return nowMs > expires;
}

/**
 * Resolve actionable lifecycle for an invite.
 * Pending invites past expiresAt resolve as expired.
 */
export function resolveInviteLifecycle(
  invite: PilotInvite | null,
  nowMs = Date.now(),
): InviteLifecycleState {
  if (invite === null) return 'missing';
  if (invite.status === 'activated') return 'activated';
  if (invite.status === 'revoked') return 'revoked';
  if (invite.status === 'expired') return 'expired';
  if (invite.status === 'pending' && isInvitePastExpiry(invite, nowMs)) {
    return 'expired';
  }
  return 'pending';
}

export function inviteLifecycleMessage(state: InviteLifecycleState): string {
  switch (state) {
    case 'missing':
      return 'Pozvánka neexistuje.';
    case 'activated':
      return 'Pozvánka už byla aktivována.';
    case 'revoked':
      return 'Pozvánka byla zrušena.';
    case 'expired':
      return 'Platnost pozvánky vypršela. Požádejte o nové odeslání.';
    case 'pending':
      return 'Pozvánka je platná.';
  }
}

export function isInviteActivatable(
  invite: PilotInvite | null,
  nowMs = Date.now(),
): boolean {
  return resolveInviteLifecycle(invite, nowMs) === 'pending';
}

export function toPersistedInviteStatus(
  lifecycle: InviteLifecycleState,
): PilotInviteStatus | null {
  if (lifecycle === 'missing') return null;
  return lifecycle;
}
