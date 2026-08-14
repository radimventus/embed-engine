/**
 * OF-12 / OF-13 / OF-14 — CONIS Admin direct entry into Partner Environment Workspace.
 * No invite / NDA / Welcome. Preserves partner company context across studios.
 *
 * OF-14 — Operator Workspace state lives on PlatformSession.workspaceContext
 * (cookie-backed, shared across Studio hosts). No host-local localStorage.
 */

import {
  resolveCloudStudioHref,
  resolveWorkspaceHostHref,
} from '../cloud/cloudConfig';
import type { PlatformStudioId } from '../domain/types';
import type { SharedWorkspaceContext } from '../domain/workspaceContext';
import type { WorkspaceStudioSurface } from '../domain/workspaceStudioNavigation';
import { canAccessStudio } from '../domain/roles';
import { isOnWorkspaceHost } from '../domain/workspaceShellEmbed';
import { getSharedProject } from '../project/projectRepository';
import { resolvePilotWorkspace } from './provisionPilotWorkspace';
import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import {
  getSharedWorkspaceContext,
  updateSession,
} from '../session/authService';
import {
  loadPlatformSession,
  savePlatformSession,
} from '../session/sessionStore';
import { createPlatformAccessAuthClient } from '../api/platformAccessClient';

/**
 * @deprecated OF-14 — Workspace Context is on the platform session cookie.
 * Kept for export compatibility; never used for storage.
 */
export const OPERATOR_PE_STORAGE_KEY =
  'conis.platform.operator-pe.v1' as const;

/** @deprecated OF-13 — use WorkspaceStudioSurface */
export type OperatorPeStudioSurface = WorkspaceStudioSurface;

/** Compatible PE bookmark shape — derived from SharedWorkspaceContext. */
export type OperatorPartnerEnvironmentState = {
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly officePartnerId: string;
  readonly officeReturnHref: string;
  readonly previous: {
    readonly tenantId: string;
    readonly companyId: string;
    readonly workspaceId: string;
    readonly projectId: string | null;
  };
};

function toOperatorState(
  ctx: SharedWorkspaceContext,
): OperatorPartnerEnvironmentState {
  return {
    companyId: ctx.companyId,
    workspaceId: ctx.workspaceId,
    projectId: ctx.projectId,
    officePartnerId: ctx.partnerId,
    officeReturnHref: ctx.officeReturnHref,
    previous: ctx.previous,
  };
}

/** OF-14 — Shared Workspace Context from the platform session cookie. */
export function getOperatorPartnerEnvironment(): OperatorPartnerEnvironmentState | null {
  const ctx = getSharedWorkspaceContext();
  return ctx === null ? null : toOperatorState(ctx);
}

/**
 * Restores the existing Builder-owned Partner Environment for an authenticated
 * partner user whose session is already bound to its canonical scope.
 */
export function restoreAuthenticatedPartnerEnvironment(): SharedWorkspaceContext | null {
  const session = loadPlatformSession();
  if (
    session === null ||
    session.workspaceContext !== null ||
    (!session.user.roles.includes('manager') &&
      !session.user.roles.includes('salesman'))
  ) {
    return null;
  }
  const provision = resolvePilotWorkspace(session.companyId);
  if (
    provision === null ||
    provision.tenant.id !== session.tenantId ||
    provision.workspace.id !== session.workspaceId ||
    provision.project.id !== session.projectId
  ) {
    return null;
  }

  const workspaceContext: SharedWorkspaceContext = {
    operatorMode: true,
    partnerId: provision.company.id,
    companyId: provision.company.id,
    workspaceId: provision.workspace.id,
    projectId: provision.project.id,
    activeHouseId: session.activeHouseId,
    activeStudio: 'client',
    officeReturnHref: resolveCloudStudioHref('office'),
    previous: {
      tenantId: session.tenantId,
      companyId: session.companyId,
      workspaceId: session.workspaceId,
      projectId: session.projectId,
    },
  };
  return updateSession({
    activeStudioId: 'client',
    workspaceContext,
  })?.workspaceContext ?? null;
}

export function clearOperatorPartnerEnvironment(): void {
  const session = loadPlatformSession();
  if (session === null) return;
  if (session.workspaceContext === null) return;
  updateSession({ workspaceContext: null });
}

function resolveTenantId(companyId: string, fallback: string): string {
  const company = getDefaultCompanyRegistry().companies.find(
    (item) => item.id === companyId,
  );
  return company?.tenantId ?? fallback;
}

function hrefForSurface(surface: WorkspaceStudioSurface): string {
  // VR-04 — all operator Workspace surfaces live on Workspace Host.
  void surface;
  return resolveWorkspaceHostHref();
}

function sessionStudioIdForSurface(
  surface: WorkspaceStudioSurface,
): PlatformStudioId {
  return surface;
}

export type EnterOperatorPartnerEnvironmentInput = {
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly officePartnerId: string;
  readonly officeReturnHref: string;
  /** OF-13A default: client — open Client Studio as Workspace entry. */
  readonly initialSurface?: WorkspaceStudioSurface;
  /** When false, only bind session + context (tests). Default true. */
  readonly navigate?: boolean;
};

export type EnterOperatorPartnerEnvironmentResult =
  | {
      readonly ok: true;
      readonly state: OperatorPartnerEnvironmentState;
      readonly href: string;
      readonly surface: WorkspaceStudioSurface;
    }
  | { readonly ok: false; readonly error: string };

/**
 * Bind the logged-in CONIS admin session to a partner Workspace and open a studio.
 * Default entry is Client Studio (OF-13A). Context is cookie-shared (OF-14).
 */
export function enterOperatorPartnerEnvironment(
  input: EnterOperatorPartnerEnvironmentInput,
): EnterOperatorPartnerEnvironmentResult {
  const session = loadPlatformSession();
  if (session === null) {
    return { ok: false, error: 'Nejste přihlášeni.' };
  }

  const companyId = input.companyId.trim();
  const workspaceId = input.workspaceId.trim();
  const projectId = input.projectId.trim();
  if (
    companyId.length === 0 ||
    workspaceId.length === 0 ||
    projectId.length === 0
  ) {
    return { ok: false, error: 'Partner Environment není připraveno.' };
  }

  const surface = input.initialSurface ?? 'client';
  if (surface === 'office') {
    return { ok: false, error: 'Office není vstupní Workspace Studio.' };
  }

  const workspaceContext: SharedWorkspaceContext = {
    operatorMode: true,
    partnerId: input.officePartnerId.trim(),
    companyId,
    workspaceId,
    projectId,
    activeStudio: surface,
    officeReturnHref:
      input.officeReturnHref.trim() || resolveCloudStudioHref('office'),
    previous: {
      tenantId: session.tenantId,
      companyId: session.companyId,
      workspaceId: session.workspaceId,
      projectId: session.projectId,
    },
  };

  const tenantId = resolveTenantId(companyId, session.tenantId);
  const next = updateSession({
    tenantId,
    companyId,
    workspaceId,
    projectId,
    activeStudioId: sessionStudioIdForSurface(surface),
    workspaceContext,
  });
  if (next === null) {
    return { ok: false, error: 'Session se nepodařilo aktualizovat.' };
  }

  const state = toOperatorState(workspaceContext);
  const href = hrefForSurface(surface);
  if (input.navigate !== false && typeof window !== 'undefined') {
    window.location.assign(href);
  }
  return { ok: true, state, href, surface };
}

export async function enterOperatorPartnerEnvironmentAuthoritatively(
  input: EnterOperatorPartnerEnvironmentInput,
): Promise<EnterOperatorPartnerEnvironmentResult> {
  const session = loadPlatformSession();
  if (session === null) {
    return { ok: false, error: 'Nejste přihlášeni.' };
  }

  const companyId = input.companyId.trim();
  const workspaceId = input.workspaceId.trim();
  const projectId = input.projectId.trim();
  const partnerId = input.officePartnerId.trim();

  if (
    companyId.length === 0 ||
    workspaceId.length === 0 ||
    projectId.length === 0 ||
    partnerId.length === 0
  ) {
    return { ok: false, error: 'Partner Environment není připraveno.' };
  }

  const surface = input.initialSurface ?? 'client';
  if (surface === 'office') {
    return { ok: false, error: 'Office není vstupní Workspace Studio.' };
  }

  const tenantId = resolveTenantId(companyId, session.tenantId);
  const officeReturnHref =
    input.officeReturnHref.trim() || resolveCloudStudioHref('office');

  let result;
  try {
    result = await createPlatformAccessAuthClient().mutateSessionContext({
      action: 'enter',
      partnerId,
      tenantId,
      companyId,
      workspaceId,
      projectId,
      activeHouseId: session.activeHouseId,
      authoredHouseIdentities:
        session.workspaceContext?.authoredHouseIdentities,
      activeStudio: surface,
      officeReturnHref,
    });
  } catch {
    return {
      ok: false,
      error: 'Partner Environment se nepodařilo spojit s Platform API.',
    };
  }

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  savePlatformSession(result.session);

  const workspaceContext = result.session.workspaceContext;
  if (workspaceContext === null) {
    return {
      ok: false,
      error: 'Platform API nevrátilo aktivní Partner Environment.',
    };
  }

  const href = hrefForSurface(surface);
  if (input.navigate !== false && typeof window !== 'undefined') {
    window.location.assign(href);
  }

  return {
    ok: true,
    state: toOperatorState(workspaceContext),
    href,
    surface,
  };
}

export function switchOperatorPartnerStudio(
  surface: WorkspaceStudioSurface,
  options?: {
    readonly navigate?: boolean;
    /**
     * VR-04 — when true, Office stays inside Workspace (partner detail view).
     * When false, leave Workspace and restore CONIS Office session (legacy exit).
     * Default: true while already on Workspace Host; otherwise false.
     */
    readonly retainWorkspace?: boolean;
  },
): EnterOperatorPartnerEnvironmentResult {
  const ctx = getSharedWorkspaceContext();
  if (ctx === null) {
    return { ok: false, error: 'Operator PE mode není aktivní.' };
  }
  const session = loadPlatformSession();
  if (session === null) {
    return { ok: false, error: 'Nejste přihlášeni.' };
  }
  if (!canAccessStudio(session.user.roles, surface)) {
    return { ok: false, error: 'Pro tento účet nemáte přístup do Studia.' };
  }

  const retainWorkspace =
    options?.retainWorkspace ?? isOnWorkspaceHost();

  if (surface === 'office' && !retainWorkspace) {
    const returned = returnFromOperatorPartnerEnvironment({
      navigate: options?.navigate,
    });
    if (!returned.ok) {
      return { ok: false, error: returned.error };
    }
    return {
      ok: true,
      state: toOperatorState(ctx),
      href: returned.href,
      surface: 'office',
    };
  }

  /**
   * PT-OS-02 / B-02 / B-03 — never clobber Office-selected Shared Project id
   * with the PE provision template id (e.g. project-domy-s-energi-01).
   */
  const boundProjectId =
    session.projectId !== null &&
    session.projectId.length > 0 &&
    getSharedProject(session.projectId) !== null
      ? session.projectId
      : ctx.projectId;

  const workspaceContext: SharedWorkspaceContext = {
    ...ctx,
    activeStudio: surface,
    projectId: boundProjectId,
  };

  const next = updateSession({
    companyId: ctx.companyId,
    workspaceId: ctx.workspaceId,
    projectId: boundProjectId,
    activeStudioId: sessionStudioIdForSurface(surface),
    workspaceContext,
  });
  if (next === null) {
    return { ok: false, error: 'Session se nepodařilo aktualizovat.' };
  }

  const href = resolveWorkspaceHostHref();
  const shouldNavigate =
    options?.navigate !== false && !isOnWorkspaceHost();
  if (shouldNavigate && typeof window !== 'undefined') {
    window.location.assign(href);
  }
  return { ok: true, state: toOperatorState(workspaceContext), href, surface };
}

export function returnFromOperatorPartnerEnvironment(options?: {
  readonly navigate?: boolean;
}):
  | { readonly ok: true; readonly href: string }
  | { readonly ok: false; readonly error: string } {
  const ctx = getSharedWorkspaceContext();
  if (ctx === null) {
    return { ok: false, error: 'Operator PE mode není aktivní.' };
  }

  const href = ctx.officeReturnHref;
  const next = updateSession({
    tenantId: ctx.previous.tenantId,
    companyId: ctx.previous.companyId,
    workspaceId: ctx.previous.workspaceId,
    projectId: ctx.previous.projectId,
    activeStudioId: 'office',
    workspaceContext: null,
  });
  if (next === null) {
    return { ok: false, error: 'Session se nepodařilo obnovit.' };
  }

  if (options?.navigate !== false && typeof window !== 'undefined') {
    window.location.assign(href);
  }
  return { ok: true, href };
}

/** Test helper. */
export function resetOperatorPartnerEnvironmentForTests(): void {
  clearOperatorPartnerEnvironment();
}
