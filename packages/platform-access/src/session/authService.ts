/**
 * EPIC-BX-14 / BX-15 — Authentication Shell service (extensible, not production IAM).
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
  DEMO_USERS,
} from '../registry/defaults';
import { findActivatedInviteUser } from '../pilot/inviteStore';
import {
  clearPlatformSession,
  loadPlatformSession,
  savePlatformSession,
} from './sessionStore';

export type AuthResult =
  | { readonly ok: true; readonly session: PlatformSession }
  | { readonly ok: false; readonly error: string };

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
    user: input.user,
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
 * Pilot login — demo accounts, activated invites, or any email with password "demo".
 */
export function login(credentials: LoginCredentials): AuthResult {
  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password;
  if (email.length === 0 || password.length === 0) {
    return { ok: false, error: 'Zadejte e-mail a heslo.' };
  }

  const demo = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === email && user.password === password,
  );
  if (demo !== undefined) {
    const { password: _pw, ...user } = demo;
    const session = buildSession({
      user,
      rememberMe: credentials.rememberMe,
    });
    savePlatformSession(session);
    return { ok: true, session };
  }

  const invited = findActivatedInviteUser(email, password);
  if (invited !== null) {
    const session = buildSession({
      user: invited.user,
      rememberMe: credentials.rememberMe,
      tenantId: invited.tenantId,
      companyId: invited.companyId,
      workspaceId: invited.workspaceId,
      projectId: invited.projectId,
    });
    savePlatformSession(session);
    return { ok: true, session };
  }

  if (password === 'demo') {
    const user: PlatformUser = {
      id: `user-${email.replace(/[^a-z0-9]+/g, '-')}`,
      email,
      displayName: email.split('@')[0] ?? 'User',
      roles: ['builder'],
    };
    const session = buildSession({
      user,
      rememberMe: credentials.rememberMe,
    });
    savePlatformSession(session);
    return { ok: true, session };
  }

  return {
    ok: false,
    error: 'Neplatné přihlášení. Zkuste radim@conis.local / demo.',
  };
}

export function logout(): void {
  clearPlatformSession();
}

export function restoreSession(): PlatformSession | null {
  const session = loadPlatformSession();
  if (session === null) return null;
  // Migrate BX-14 sessions missing tenant / lastLogin.
  if (
    typeof (session as { tenantId?: string }).tenantId !== 'string' ||
    typeof (session as { lastLoginAt?: string }).lastLoginAt !== 'string'
  ) {
    const migrated = buildSession({
      user: session.user,
      rememberMe: session.rememberMe,
      activeStudioId: session.activeStudioId,
      companyId: session.companyId,
      workspaceId: session.workspaceId,
      projectId: session.projectId,
    });
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
  const next: PlatformSession = {
    ...current,
    ...patch,
  };
  savePlatformSession(next);
  return next;
}
