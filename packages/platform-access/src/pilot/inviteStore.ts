/**
 * EPIC-BX-15 / OF-07 / PE-04 — Invite flow store (local pilot; not production IAM).
 * Invitation validity, resend, NDA-gated first password activation.
 */

import type { PlatformRole, PlatformUser } from '../domain/types';
import type { PilotInvite } from '../domain/pilotTypes';
import {
  DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID,
  DEFAULT_TENANT_ID,
  DEFAULT_WORKSPACE_ID,
} from '../registry/defaults';
import {
  upsertActivatedUser,
  verifyUserPassword,
} from '../registry/userRegistry';
import {
  computeInviteExpiresAt,
  inviteLifecycleMessage,
  resolveInviteLifecycle,
} from './invitationWorkflow';
import { recordPlatformActivity } from './pilotDiagnostics';
import { prepareWelcomeJourney } from './welcomeStore';

export const INVITE_STORAGE_KEY = 'conis.platform.invites.v1';

type InviteStore = {
  readonly invites: PilotInvite[];
};

let memoryStore: InviteStore = { invites: [] };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function normalizeInvite(raw: PilotInvite): PilotInvite {
  const createdAt = raw.createdAt;
  const sendCount =
    typeof raw.sendCount === 'number' && Number.isFinite(raw.sendCount)
      ? raw.sendCount
      : raw.lastSentAt != null
        ? 1
        : 0;
  return {
    ...raw,
    projectId: raw.projectId ?? DEFAULT_PROJECT_ID,
    ndaAcceptedAt: raw.ndaAcceptedAt ?? null,
    openedAt: raw.openedAt ?? null,
    lastSentAt:
      raw.lastSentAt === undefined
        ? sendCount > 0
          ? createdAt
          : null
        : raw.lastSentAt,
    sendCount,
    expiresAt: raw.expiresAt ?? computeInviteExpiresAt(createdAt),
  };
}

function loadStore(): InviteStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(INVITE_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as {
      invites?: PilotInvite[];
      activatedPasswords?: Record<string, string>;
    };
    memoryStore = {
      invites: Array.isArray(parsed.invites)
        ? parsed.invites.map(normalizeInvite)
        : [],
    };
    // Migrate legacy activated passwords into user registry.
    if (
      parsed.activatedPasswords !== null &&
      typeof parsed.activatedPasswords === 'object'
    ) {
      for (const invite of memoryStore.invites) {
        if (invite.status !== 'activated') continue;
        const password = parsed.activatedPasswords[invite.email];
        if (typeof password !== 'string') continue;
        upsertActivatedUser({
          id: `user-invite-${invite.id}`,
          email: invite.email,
          displayName: invite.displayName,
          roles: invite.roles,
          password,
        });
      }
    }
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: InviteStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetInviteStore(): void {
  memoryStore = { invites: [] };
  if (canUseStorage()) {
    localStorage.removeItem(INVITE_STORAGE_KEY);
  }
}

function createToken(): string {
  return `inv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Persist expired status when a pending invite is past expiresAt. */
function materializeExpiry(invite: PilotInvite): PilotInvite {
  if (invite.status !== 'pending') return invite;
  if (resolveInviteLifecycle(invite) !== 'expired') return invite;
  return { ...invite, status: 'expired' };
}

function refreshInviteExpiries(): InviteStore {
  const store = loadStore();
  let changed = false;
  const invites = store.invites.map((raw) => {
    const invite = normalizeInvite(raw);
    const next = materializeExpiry(invite);
    if (next.status !== invite.status) changed = true;
    return next;
  });
  if (changed) {
    const nextStore = { invites };
    saveStore(nextStore);
    return nextStore;
  }
  return { invites };
}

export function createPilotInvite(input: {
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly invitedByUserId: string;
  readonly tenantId?: string;
  readonly companyId?: string;
  readonly workspaceId?: string;
  readonly projectId?: string;
  /** Optional override for tests (absolute ISO expiry). */
  readonly expiresAt?: string;
}): PilotInvite {
  const store = loadStore();
  const createdAt = new Date().toISOString();
  const invite: PilotInvite = {
    id: `invite-${Date.now()}`,
    token: createToken(),
    email: input.email.trim().toLowerCase(),
    displayName: input.displayName.trim() || input.email,
    roles: input.roles,
    tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    companyId: input.companyId ?? DEFAULT_COMPANY_ID,
    workspaceId: input.workspaceId ?? DEFAULT_WORKSPACE_ID,
    projectId: input.projectId ?? DEFAULT_PROJECT_ID,
    status: 'pending',
    createdAt,
    activatedAt: null,
    expiresAt: input.expiresAt ?? computeInviteExpiresAt(createdAt),
    ndaAcceptedAt: null,
    openedAt: null,
    invitedByUserId: input.invitedByUserId,
    lastSentAt: null,
    sendCount: 0,
  };
  saveStore({
    invites: [...store.invites, invite],
  });
  recordPlatformActivity({
    label: 'Pozvánka připravena',
    detail: `${invite.email} · ${invite.token}`,
  });
  return invite;
}

export function findInviteByToken(token: string): PilotInvite | null {
  return listInvites().find((item) => item.token === token) ?? null;
}

/**
 * PE-08 — mark invite opened when partner lands on InviteShell (idempotent).
 */
export function markInviteOpened(token: string): PilotInvite | null {
  const store = loadStore();
  const current = store.invites.find((item) => item.token === token.trim());
  if (current === undefined) return null;
  if (current.openedAt !== null) return normalizeInvite(current);
  const next: PilotInvite = {
    ...normalizeInvite(current),
    openedAt: new Date().toISOString(),
  };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === current.id ? next : item,
    ),
  });
  recordPlatformActivity({
    label: 'Pozvánka otevřena',
    detail: next.email,
  });
  return next;
}

export function listInvites(): readonly PilotInvite[] {
  const store = refreshInviteExpiries();
  return [...store.invites].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function listPendingInvites(): readonly PilotInvite[] {
  return listInvites().filter((item) => item.status === 'pending');
}

/**
 * PE-10 / PE-06 — stamp local invite delivery (no SMTP). Idempotent on first send.
 */
export function markInviteSent(inviteId: string): PilotInvite | null {
  const store = loadStore();
  const current = store.invites.find((item) => item.id === inviteId);
  if (current === undefined) return null;
  const invite = normalizeInvite(current);
  if (invite.sendCount > 0 && invite.lastSentAt !== null) {
    return invite;
  }
  const sentAt = new Date().toISOString();
  const next: PilotInvite = {
    ...invite,
    lastSentAt: sentAt,
    sendCount: Math.max(invite.sendCount, 1),
  };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === inviteId ? next : item,
    ),
  });
  recordPlatformActivity({
    label: 'Pozvánka odeslána',
    detail: `${next.email} · ${next.token}`,
  });
  return next;
}

/** Resend invitation — rotates token, extends validity, keeps pending. No SMTP. */
export function resendPilotInvite(inviteId: string): PilotInvite | null {
  const store = loadStore();
  const current = store.invites.find((item) => item.id === inviteId);
  if (current === undefined) return null;
  const lifecycle = resolveInviteLifecycle(current);
  if (lifecycle !== 'pending' && lifecycle !== 'expired') return null;
  const sentAt = new Date().toISOString();
  const normalized = normalizeInvite(current);
  const next: PilotInvite = {
    ...normalized,
    token: createToken(),
    status: 'pending',
    lastSentAt: sentAt,
    sendCount: normalized.sendCount + 1,
    expiresAt: computeInviteExpiresAt(sentAt),
  };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === inviteId ? next : item,
    ),
  });
  recordPlatformActivity({
    label:
      normalized.sendCount === 0
        ? 'Pozvánka odeslána'
        : 'Pozvánka znovu odeslána',
    detail: `${next.email} · ${next.token}`,
  });
  return next;
}

export function revokePilotInvite(inviteId: string): PilotInvite | null {
  const store = loadStore();
  const current = store.invites.find((item) => item.id === inviteId);
  if (current === undefined) return null;
  const lifecycle = resolveInviteLifecycle(current);
  if (lifecycle !== 'pending' && lifecycle !== 'expired') return null;
  const next: PilotInvite = { ...current, status: 'revoked' };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === inviteId ? next : item,
    ),
  });
  return next;
}

/**
 * PE-04 — Activate partner account: validate invite → NDA → first password → Welcome Journey.
 */
export function activateInvite(input: {
  readonly token: string;
  readonly password: string;
  /** PE-04 — NDA + consent required before password activation. */
  readonly ndaAccepted: boolean;
}):
  | { readonly ok: true; readonly invite: PilotInvite; readonly user: PlatformUser }
  | { readonly ok: false; readonly error: string } {
  const password = input.password.trim();
  if (password.length < 4) {
    return { ok: false, error: 'Heslo musí mít alespoň 4 znaky.' };
  }
  if (!input.ndaAccepted) {
    return {
      ok: false,
      error: 'Bez souhlasu s NDA není aktivace účtu možná.',
    };
  }
  const store = loadStore();
  const invite = store.invites.find((item) => item.token === input.token);
  if (invite === undefined) {
    return { ok: false, error: inviteLifecycleMessage('missing') };
  }
  const lifecycle = resolveInviteLifecycle(invite);
  if (lifecycle !== 'pending') {
    return { ok: false, error: inviteLifecycleMessage(lifecycle) };
  }
  const activatedAt = new Date().toISOString();
  const activated: PilotInvite = {
    ...invite,
    status: 'activated',
    activatedAt,
    ndaAcceptedAt: activatedAt,
  };
  const user = upsertActivatedUser({
    id: `user-invite-${invite.id}`,
    email: invite.email,
    displayName: invite.displayName,
    roles: invite.roles,
    password,
  });
  saveStore({
    invites: store.invites.map((item) =>
      item.id === invite.id ? activated : item,
    ),
  });
  recordPlatformActivity({
    label: 'Aktivace partnerského účtu',
    detail: user.email,
  });
  prepareWelcomeJourney(user.email);
  return { ok: true, invite: activated, user };
}

/**
 * Resolve tenant binding for an activated invite login.
 * Credentials are verified via User Registry.
 */
export function findActivatedInviteBinding(email: string): {
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
} | null {
  const store = loadStore();
  const normalized = email.trim().toLowerCase();
  const invite = store.invites.find(
    (item) => item.email === normalized && item.status === 'activated',
  );
  if (invite === undefined) return null;
  return {
    tenantId: invite.tenantId,
    companyId: invite.companyId,
    workspaceId: invite.workspaceId,
    projectId: invite.projectId ?? DEFAULT_PROJECT_ID,
  };
}

/** @deprecated Prefer User Registry login; kept for invite tenant binding. */
export function findActivatedInviteUser(
  email: string,
  password: string,
): {
  readonly user: PlatformUser;
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
} | null {
  const user = verifyUserPassword(email, password);
  if (user === null) return null;
  const binding = findActivatedInviteBinding(email);
  if (binding === null) return null;
  return { user, ...binding };
}
