/**
 * EPIC-BX-14 — Authentication Shell service (extensible, not production IAM).
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
  DEFAULT_WORKSPACE_ID,
  DEMO_USERS,
} from '../registry/defaults';
import {
  clearPlatformSession,
  loadPlatformSession,
  savePlatformSession,
} from './sessionStore';

export type AuthResult =
  | { readonly ok: true; readonly session: PlatformSession }
  | { readonly ok: false; readonly error: string };

function buildSession(
  user: PlatformUser,
  rememberMe: boolean,
  activeStudioId: PlatformStudioId | null = null,
): PlatformSession {
  const issuedAt = new Date().toISOString();
  const expiresAt = rememberMe
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  return {
    user,
    companyId: DEFAULT_COMPANY_ID,
    workspaceId: DEFAULT_WORKSPACE_ID,
    projectId: DEFAULT_PROJECT_ID,
    activeStudioId,
    rememberMe,
    issuedAt,
    expiresAt,
  };
}

/**
 * Pilot login — demo accounts or any email with password "demo".
 * Architecture leaves room for OAuth / SSO adapters later.
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
    const session = buildSession(user, credentials.rememberMe, null);
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
    const session = buildSession(user, credentials.rememberMe, null);
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
  return loadPlatformSession();
}

export function updateSession(
  patch: Partial<
    Pick<
      PlatformSession,
      'companyId' | 'workspaceId' | 'projectId' | 'activeStudioId'
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
