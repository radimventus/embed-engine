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
import type { SharedWorkspaceContext } from '../domain/workspaceContext';
import type { WorkspaceStudioSurface } from '../domain/workspaceStudioNavigation';
import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import {
  getSharedWorkspaceContext,
  updateSession,
} from '../session/authService';
import { loadPlatformSession } from '../session/sessionStore';

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
  // ARCH-01 — operator Client surface opens Workspace Host, not partner Embed Host.
  if (surface === 'client') return resolveWorkspaceHostHref();
  return resolveCloudStudioHref(surface);
}

function sessionStudioIdForSurface(
  surface: WorkspaceStudioSurface,
): 'office' | 'builder' | 'manager' | 'sales' {
  if (surface === 'client') return 'manager';
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

export function switchOperatorPartnerStudio(
  surface: WorkspaceStudioSurface,
  options?: { readonly navigate?: boolean },
): EnterOperatorPartnerEnvironmentResult {
  const ctx = getSharedWorkspaceContext();
  if (ctx === null) {
    return { ok: false, error: 'Operator PE mode není aktivní.' };
  }
  if (surface === 'office') {
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

  const session = loadPlatformSession();
  if (session === null) {
    return { ok: false, error: 'Nejste přihlášeni.' };
  }

  const workspaceContext: SharedWorkspaceContext = {
    ...ctx,
    activeStudio: surface,
  };

  const next = updateSession({
    companyId: ctx.companyId,
    workspaceId: ctx.workspaceId,
    projectId: ctx.projectId,
    activeStudioId: sessionStudioIdForSurface(surface),
    workspaceContext,
  });
  if (next === null) {
    return { ok: false, error: 'Session se nepodařilo aktualizovat.' };
  }

  const href = hrefForSurface(surface);
  if (options?.navigate !== false && typeof window !== 'undefined') {
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
