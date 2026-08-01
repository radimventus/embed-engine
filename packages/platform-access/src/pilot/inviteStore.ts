/**
 * EPIC-BX-15 — Invite flow store (local pilot; not production IAM).
 */

import type { PlatformRole, PlatformUser } from '../domain/types';
import type { PilotInvite } from '../domain/pilotTypes';
import {
  DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID,
  DEFAULT_TENANT_ID,
  DEFAULT_WORKSPACE_ID,
} from '../registry/defaults';

export const INVITE_STORAGE_KEY = 'conis.platform.invites.v1';

type InviteStore = {
  readonly invites: PilotInvite[];
  readonly activatedPasswords: Record<string, string>;
};

let memoryStore: InviteStore = { invites: [], activatedPasswords: {} };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): InviteStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(INVITE_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as InviteStore;
    memoryStore = {
      invites: Array.isArray(parsed.invites) ? parsed.invites : [],
      activatedPasswords:
        parsed.activatedPasswords !== null &&
        typeof parsed.activatedPasswords === 'object'
          ? parsed.activatedPasswords
          : {},
    };
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
  memoryStore = { invites: [], activatedPasswords: {} };
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
    createdAt: new Date().toISOString(),
    activatedAt: null,
    invitedByUserId: input.invitedByUserId,
  };
  saveStore({
    ...store,
    invites: [...store.invites, invite],
  });
  return invite;
}

export function findInviteByToken(token: string): PilotInvite | null {
  const store = loadStore();
  return store.invites.find((item) => item.token === token) ?? null;
}

export function listPendingInvites(): readonly PilotInvite[] {
  return loadStore().invites.filter((item) => item.status === 'pending');
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
  const user: PlatformUser = {
    id: `user-invite-${invite.id}`,
    email: invite.email,
    displayName: invite.displayName,
    roles: invite.roles,
  };
  saveStore({
    invites: store.invites.map((item) =>
      item.id === invite.id ? activated : item,
    ),
    activatedPasswords: {
      ...store.activatedPasswords,
      [invite.email]: password,
    },
  });
  return { ok: true, invite: activated, user };
}

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
  const store = loadStore();
  const normalized = email.trim().toLowerCase();
  const invite = store.invites.find(
    (item) => item.email === normalized && item.status === 'activated',
  );
  if (invite === undefined) return null;
  if (store.activatedPasswords[normalized] !== password) return null;
  return {
    user: {
      id: `user-invite-${invite.id}`,
      email: invite.email,
      displayName: invite.displayName,
      roles: invite.roles,
    },
    tenantId: invite.tenantId,
    companyId: invite.companyId,
    workspaceId: invite.workspaceId,
    projectId: DEFAULT_PROJECT_ID,
  };
}
