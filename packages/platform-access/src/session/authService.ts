/**
 * EPIC-BX-14 / BX-15 / OF-07 — Authentication service (MVP Identity & Access).
 */

import type {
  LoginCredentials,
  PlatformSession,
  PlatformStudioId,
  PlatformUser,
} from '../domain/types';
import type { SharedWorkspaceContext } from '../domain/workspaceContext';
import { isSharedWorkspaceContext } from '../domain/workspaceContext';
import {
  getCanonicalHouse,
  isCanonicalProjectId,
} from '../projection/canonicalProjectProjection';
import {
  DEFAULT_CANONICAL_PROJECT_ID,
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

/** CAP-VR38a — strict House ownership check for the shared Project/House scope. */
export function isHouseInProject(houseId: string, projectId: string): boolean {
  const normalizedHouseId = houseId.trim();
  const normalizedProjectId = projectId.trim();
  const house = getCanonicalHouse(normalizedHouseId);
  return (
    (house !== null &&
      normalizedProjectId.length > 0 &&
      house.project.projectId === normalizedProjectId) ||
    getSharedWorkspaceContext()?.authoredHouseIdentities?.some(
      (draft) =>
        draft.houseId === normalizedHouseId &&
        draft.canonicalProjectId === normalizedProjectId,
    ) === true
  );
}

function resolveScopedActiveHouseId(
  projectId: string | null,
  activeHouseId: string | null | undefined,
): string | null {
  if (activeHouseId === null || activeHouseId === undefined) return null;
  const houseId = activeHouseId.trim();
  return projectId !== null && isHouseInProject(houseId, projectId)
    ? houseId
    : null;
}

function normalizeUser(user: PlatformUser): PlatformUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles,
    status: user.status === 'inactive' ? 'inactive' : 'active',
    lastLoginAt: user.lastLoginAt ?? null,
    lastActivityAt: user.lastActivityAt ?? null,
    lastStudioId: user.lastStudioId ?? null,
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
  readonly activeHouseId?: string | null;
}): PlatformSession {
  const issuedAt = new Date().toISOString();
  const expiresAt = input.rememberMe
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  const requestedProjectId =
    input.projectId !== undefined ? input.projectId : DEFAULT_PROJECT_ID;
  const projectId =
    requestedProjectId === null
      ? null
      : isCanonicalProjectId(requestedProjectId)
        ? requestedProjectId
        : DEFAULT_CANONICAL_PROJECT_ID;
  return {
    user: normalizeUser(input.user),
    tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    companyId: input.companyId ?? DEFAULT_COMPANY_ID,
    workspaceId: input.workspaceId ?? DEFAULT_WORKSPACE_ID,
    projectId,
    activeHouseId: resolveScopedActiveHouseId(
      projectId,
      input.activeHouseId,
    ),
    activeStudioId: input.activeStudioId ?? null,
    workspaceContext: null,
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
  const workspaceContext = isSharedWorkspaceContext(session.workspaceContext)
    ? {
        ...session.workspaceContext,
        activeHouseId: resolveScopedActiveHouseId(
          session.workspaceContext.projectId,
          session.workspaceContext.activeHouseId,
        ),
      }
    : null;
  const activeHouseId = resolveScopedActiveHouseId(
    session.projectId,
    session.activeHouseId ?? workspaceContext?.activeHouseId,
  );
  // Migrate BX-14 sessions missing tenant / lastLogin / identity / workspace fields.
  if (
    typeof (session as { tenantId?: string }).tenantId !== 'string' ||
    typeof (session as { lastLoginAt?: string }).lastLoginAt !== 'string' ||
    session.user.status === undefined ||
    session.workspaceContext === undefined ||
    session.activeHouseId === undefined ||
    registryUser !== null
  ) {
    const migrated: PlatformSession = {
      ...session,
      user,
      tenantId: session.tenantId ?? DEFAULT_TENANT_ID,
      lastLoginAt: session.lastLoginAt ?? session.issuedAt,
      workspaceContext,
      activeHouseId,
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
      | 'activeHouseId'
      | 'activeStudioId'
      | 'workspaceContext'
    >
  >,
): PlatformSession | null {
  const current = loadPlatformSession();
  if (current === null) return null;
  if (current.user.id) {
    touchUserActivity(current.user.id);
  }
  const requestedProjectId =
    patch.projectId !== undefined ? patch.projectId : current.projectId;
  const currentProjectId =
    current.projectId !== null && isCanonicalProjectId(current.projectId)
      ? current.projectId
      : null;
  const projectId =
    requestedProjectId === null
      ? null
      : isCanonicalProjectId(requestedProjectId)
        ? requestedProjectId
        : currentProjectId;
  const requestedHouseId =
    patch.activeHouseId !== undefined
      ? patch.activeHouseId
      : patch.workspaceContext?.activeHouseId !== undefined
        ? patch.workspaceContext.activeHouseId
        : current.activeHouseId;
  const activeHouseId = resolveScopedActiveHouseId(
    projectId,
    requestedHouseId,
  );
  const requestedWorkspaceContext =
    patch.workspaceContext !== undefined
      ? patch.workspaceContext
      : (current.workspaceContext ?? null);
  const workspaceProjectId =
    requestedWorkspaceContext === null
      ? null
      : patch.projectId !== undefined
        ? projectId
        : isCanonicalProjectId(requestedWorkspaceContext.projectId)
          ? requestedWorkspaceContext.projectId
          : projectId;
  const workspaceContext =
    requestedWorkspaceContext === null || workspaceProjectId === null
      ? null
      : {
          ...requestedWorkspaceContext,
          projectId: workspaceProjectId,
          activeHouseId: resolveScopedActiveHouseId(
            workspaceProjectId,
            activeHouseId,
          ),
        };
  const next: PlatformSession = {
    ...current,
    ...patch,
    projectId,
    activeHouseId,
    workspaceContext,
  };
  savePlatformSession(next);
  return next;
}

/** OF-14 — read Shared Workspace Context from the platform session cookie. */
export function getSharedWorkspaceContext(): SharedWorkspaceContext | null {
  const session = loadPlatformSession();
  if (session === null) return null;
  return isSharedWorkspaceContext(session.workspaceContext)
    ? session.workspaceContext
    : null;
}

/** OF-14 — operator Workspace mode is active when Shared Workspace Context is set. */
export function isOperatorWorkspaceMode(): boolean {
  return getSharedWorkspaceContext() !== null;
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
