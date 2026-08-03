/**
 * EPIC-BX-15 / OF-07 — Invite flow store (local pilot; not production IAM).
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
import { recordPlatformActivity } from './pilotDiagnostics';

export const INVITE_STORAGE_KEY = 'conis.platform.invites.v1';

type InviteStore = {
  readonly invites: PilotInvite[];
};

let memoryStore: InviteStore = { invites: [] };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function normalizeInvite(raw: PilotInvite): PilotInvite {
  return {
    ...raw,
    lastSentAt: raw.lastSentAt ?? raw.createdAt,
    sendCount: raw.sendCount ?? 1,
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

export function createPilotInvite(input: {
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly invitedByUserId: string;
  readonly tenantId?: string;
  readonly companyId?: string;
  readonly workspaceId?: string;
}): PilotInvite {
  const store = loadStore();
  const sentAt = new Date().toISOString();
  const invite: PilotInvite = {
    id: `invite-${Date.now()}`,
    token: createToken(),
    email: input.email.trim().toLowerCase(),
    displayName: input.displayName.trim() || input.email,
    roles: input.roles,
    tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    companyId: input.companyId ?? DEFAULT_COMPANY_ID,
    workspaceId: input.workspaceId ?? DEFAULT_WORKSPACE_ID,
    status: 'pending',
    createdAt: sentAt,
    activatedAt: null,
    invitedByUserId: input.invitedByUserId,
    lastSentAt: sentAt,
    sendCount: 1,
  };
  saveStore({
    invites: [...store.invites, invite],
  });
  recordPlatformActivity({
    label: 'Pozvánka odeslána',
    detail: `${invite.email} · ${invite.token}`,
  });
  return invite;
}

export function findInviteByToken(token: string): PilotInvite | null {
  const store = loadStore();
  return store.invites.find((item) => item.token === token) ?? null;
}

export function listInvites(): readonly PilotInvite[] {
  return [...loadStore().invites].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function listPendingInvites(): readonly PilotInvite[] {
  return listInvites().filter((item) => item.status === 'pending');
}

/** Resend invitation e-mail — rotates token, keeps pending status. */
export function resendPilotInvite(inviteId: string): PilotInvite | null {
  const store = loadStore();
  const current = store.invites.find((item) => item.id === inviteId);
  if (current === undefined || current.status !== 'pending') return null;
  const sentAt = new Date().toISOString();
  const next: PilotInvite = {
    ...current,
    token: createToken(),
    lastSentAt: sentAt,
    sendCount: current.sendCount + 1,
  };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === inviteId ? next : item,
    ),
  });
  recordPlatformActivity({
    label: 'Pozvánka znovu odeslána',
    detail: `${next.email} · ${next.token}`,
  });
  return next;
}

export function revokePilotInvite(inviteId: string): PilotInvite | null {
  const store = loadStore();
  const current = store.invites.find((item) => item.id === inviteId);
  if (current === undefined || current.status !== 'pending') return null;
  const next: PilotInvite = { ...current, status: 'revoked' };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === inviteId ? next : item,
    ),
  });
  return next;
}

export function activateInvite(input: {
  readonly token: string;
  readonly password: string;
}):
  | { readonly ok: true; readonly invite: PilotInvite; readonly user: PlatformUser }
  | { readonly ok: false; readonly error: string } {
  const password = input.password.trim();
  if (password.length < 4) {
    return { ok: false, error: 'Heslo musí mít alespoň 4 znaky.' };
  }
  const store = loadStore();
  const invite = store.invites.find((item) => item.token === input.token);
  if (invite === undefined) {
    return { ok: false, error: 'Pozvánka neexistuje.' };
  }
  if (invite.status === 'revoked') {
    return { ok: false, error: 'Pozvánka byla zrušena.' };
  }
  if (invite.status === 'activated') {
    return { ok: false, error: 'Pozvánka už byla aktivována.' };
  }
  const activated: PilotInvite = {
    ...invite,
    status: 'activated',
    activatedAt: new Date().toISOString(),
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
    label: 'První nastavení hesla',
    detail: user.email,
  });
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
    projectId: DEFAULT_PROJECT_ID,
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
