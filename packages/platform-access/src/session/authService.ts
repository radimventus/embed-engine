/**
 * EPIC-BX-14 / BX-15 / OF-07 — Authentication service (MVP Identity & Access).
 */

import type {
  LoginCredentials,
  PlatformSession,
  PlatformStudioId,
  PlatformUser,
} from '../domain/types';
import {
  DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID,
  DEFAULT_TENANT_ID,
  DEFAULT_WORKSPACE_ID,
} from '../registry/defaults';
import {
  findUserByEmail,
  getUser,
  setUserPassword,
  touchUserActivity,
  touchUserLogin,
  verifyUserPassword,
} from '../registry/userRegistry';
import { findActivatedInviteBinding } from '../pilot/inviteStore';
import {
  completePasswordReset,
  findPasswordResetByToken,
  requestPasswordReset,
} from '../pilot/passwordResetStore';
import { recordPlatformActivity } from '../pilot/pilotDiagnostics';
import {
  clearPlatformSession,
  loadPlatformSession,
  savePlatformSession,
} from './sessionStore';

export type AuthResult =
  | { readonly ok: true; readonly session: PlatformSession }
  | { readonly ok: false; readonly error: string };

function normalizeUser(user: PlatformUser): PlatformUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles,
    status: user.status === 'inactive' ? 'inactive' : 'active',
    lastLoginAt: user.lastLoginAt ?? null,
    lastActivityAt: user.lastActivityAt ?? null,
  };
}

export function buildSession(input: {
  readonly user: PlatformUser;
  readonly rememberMe: boolean;
  readonly activeStudioId?: PlatformStudioId | null;
  readonly tenantId?: string;
  readonly companyId?: string;
  readonly workspaceId?: string;
  readonly projectId?: string | null;
}): PlatformSession {
  const issuedAt = new Date().toISOString();
  const expiresAt = input.rememberMe
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  return {
    user: normalizeUser(input.user),
    tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    companyId: input.companyId ?? DEFAULT_COMPANY_ID,
    workspaceId: input.workspaceId ?? DEFAULT_WORKSPACE_ID,
    projectId:
      input.projectId !== undefined ? input.projectId : DEFAULT_PROJECT_ID,
    activeStudioId: input.activeStudioId ?? null,
    rememberMe: input.rememberMe,
    issuedAt,
    expiresAt,
    lastLoginAt: issuedAt,
  };
}

/**
 * Login against User Registry. Invite-activated users keep tenant binding.
 */
export function login(credentials: LoginCredentials): AuthResult {
  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password;
  if (email.length === 0 || password.length === 0) {
    return { ok: false, error: 'Zadejte e-mail a heslo.' };
  }

  const user = verifyUserPassword(email, password);
  if (user === null) {
    return {
      ok: false,
      error: 'Neplatné přihlášení. Zkuste radim@conis.local / demo.',
    };
  }
  if (user.status === 'inactive') {
    return { ok: false, error: 'Účet je neaktivní.' };
  }

  const refreshed = touchUserLogin(user.id) ?? user;
  const binding = findActivatedInviteBinding(email);
  const session = buildSession({
    user: refreshed,
    rememberMe: credentials.rememberMe,
    tenantId: binding?.tenantId,
    companyId: binding?.companyId,
    workspaceId: binding?.workspaceId,
    projectId: binding?.projectId,
  });
  savePlatformSession(session);
  recordPlatformActivity({
    label: 'Login',
    detail: refreshed.email,
  });
  return { ok: true, session };
}

export function logout(): void {
  clearPlatformSession();
}

export function restoreSession(): PlatformSession | null {
  const session = loadPlatformSession();
  if (session === null) return null;
  const registryUser = getUser(session.user.id) ?? findUserByEmail(session.user.email);
  if (registryUser !== null && registryUser.status === 'inactive') {
    clearPlatformSession();
    return null;
  }
  const user = normalizeUser(registryUser ?? session.user);
  // Migrate BX-14 sessions missing tenant / lastLogin / identity fields.
  if (
    typeof (session as { tenantId?: string }).tenantId !== 'string' ||
    typeof (session as { lastLoginAt?: string }).lastLoginAt !== 'string' ||
    session.user.status === undefined ||
    registryUser !== null
  ) {
    const migrated: PlatformSession = {
      ...session,
      user,
      tenantId: session.tenantId ?? DEFAULT_TENANT_ID,
      lastLoginAt: session.lastLoginAt ?? session.issuedAt,
    };
    savePlatformSession(migrated);
    return migrated;
  }
  return session;
}

export function updateSession(
  patch: Partial<
    Pick<
      PlatformSession,
      | 'tenantId'
      | 'companyId'
      | 'workspaceId'
      | 'projectId'
      | 'activeStudioId'
    >
  >,
): PlatformSession | null {
  const current = loadPlatformSession();
  if (current === null) return null;
  if (current.user.id) {
    touchUserActivity(current.user.id);
  }
  const next: PlatformSession = {
    ...current,
    ...patch,
  };
  savePlatformSession(next);
  return next;
}

export function changePassword(input: {
  readonly email: string;
  readonly currentPassword: string;
  readonly nextPassword: string;
}): AuthResult {
  const email = input.email.trim().toLowerCase();
  const user = verifyUserPassword(email, input.currentPassword);
  if (user === null) {
    return { ok: false, error: 'Současné heslo není správné.' };
  }
  if (input.nextPassword.trim().length < 4) {
    return { ok: false, error: 'Nové heslo musí mít alespoň 4 znaky.' };
  }
  if (!setUserPassword(email, input.nextPassword)) {
    return { ok: false, error: 'Heslo se nepodařilo změnit.' };
  }
  touchUserActivity(user.id);
  recordPlatformActivity({
    label: 'Změna hesla',
    detail: email,
  });
  const session = loadPlatformSession();
  if (session !== null && session.user.email === email) {
    return { ok: true, session };
  }
  return {
    ok: true,
    session: buildSession({ user, rememberMe: false }),
  };
}

export function startPasswordReset(email: string):
  | { readonly ok: true; readonly token: string }
  | { readonly ok: false; readonly error: string } {
  const result = requestPasswordReset(email);
  if (!result.ok) return result;
  recordPlatformActivity({
    label: 'Reset hesla vyžádán',
    detail: result.reset.email,
  });
  return { ok: true, token: result.reset.token };
}

export function finishPasswordReset(input: {
  readonly token: string;
  readonly password: string;
  readonly passwordConfirm: string;
}):
  | { readonly ok: true; readonly email: string }
  | { readonly ok: false; readonly error: string } {
  if (input.password !== input.passwordConfirm) {
    return { ok: false, error: 'Hesla se neshodují.' };
  }
  const result = completePasswordReset({
    token: input.token,
    password: input.password,
  });
  if (!result.ok) return result;
  recordPlatformActivity({
    label: 'Reset hesla dokončen',
    detail: result.email,
  });
  return { ok: true, email: result.email };
}

export function peekPasswordResetToken(token: string): string | null {
  const reset = findPasswordResetByToken(token);
  if (reset === null || reset.status !== 'pending') return null;
  return reset.email;
}
