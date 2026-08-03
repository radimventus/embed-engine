/**
 * OF-12 / OF-13 — CONIS Admin direct entry into Partner Environment Workspace.
 * No invite / NDA / Welcome. Preserves partner company context across studios.
 */

import {
  resolveClientStudioHref,
  resolveCloudStudioHref,
} from '../cloud/cloudConfig';
import type { WorkspaceStudioSurface } from '../domain/workspaceStudioNavigation';
import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import { updateSession } from '../session/authService';
import { loadPlatformSession } from '../session/sessionStore';

export const OPERATOR_PE_STORAGE_KEY =
  'conis.platform.operator-pe.v1' as const;

/** @deprecated OF-13 — use WorkspaceStudioSurface */
export type OperatorPeStudioSurface = WorkspaceStudioSurface;

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

let memoryState: OperatorPartnerEnvironmentState | null = null;

function canUseStorage(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const probe = '__conis.operator.pe.probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function getOperatorPartnerEnvironment(): OperatorPartnerEnvironmentState | null {
  if (canUseStorage()) {
    try {
      const raw = localStorage.getItem(OPERATOR_PE_STORAGE_KEY);
      if (raw !== null && raw.length > 0) {
        const parsed = JSON.parse(raw) as OperatorPartnerEnvironmentState;
        if (
          typeof parsed.companyId === 'string' &&
          typeof parsed.workspaceId === 'string' &&
          typeof parsed.projectId === 'string' &&
          typeof parsed.officeReturnHref === 'string'
        ) {
          memoryState = parsed;
          return parsed;
        }
      }
    } catch {
      // fall through to memory
    }
  }
  return memoryState;
}

export function clearOperatorPartnerEnvironment(): void {
  memoryState = null;
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(OPERATOR_PE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function saveOperatorPartnerEnvironment(
  state: OperatorPartnerEnvironmentState,
): void {
  memoryState = state;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(OPERATOR_PE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // keep memory only
  }
}

function resolveTenantId(companyId: string, fallback: string): string {
  const company = getDefaultCompanyRegistry().companies.find(
    (item) => item.id === companyId,
  );
  return company?.tenantId ?? fallback;
}

function hrefForSurface(surface: WorkspaceStudioSurface): string {
  if (surface === 'client') return resolveClientStudioHref();
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
  /** When false, only bind session + bookmark (tests). Default true. */
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
 * Default entry is Client Studio (OF-13A) — Workspace Navigation stays role-filtered.
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

  const state: OperatorPartnerEnvironmentState = {
    companyId,
    workspaceId,
    projectId,
    officePartnerId: input.officePartnerId.trim(),
    officeReturnHref:
      input.officeReturnHref.trim() || resolveCloudStudioHref('office'),
    previous: {
      tenantId: session.tenantId,
      companyId: session.companyId,
      workspaceId: session.workspaceId,
      projectId: session.projectId,
    },
  };
  saveOperatorPartnerEnvironment(state);

  const surface = input.initialSurface ?? 'client';
  if (surface === 'office') {
    clearOperatorPartnerEnvironment();
    return { ok: false, error: 'Office není vstupní Workspace Studio.' };
  }

  const tenantId = resolveTenantId(companyId, session.tenantId);
  const next = updateSession({
    tenantId,
    companyId,
    workspaceId,
    projectId,
    activeStudioId: sessionStudioIdForSurface(surface),
  });
  if (next === null) {
    clearOperatorPartnerEnvironment();
    return { ok: false, error: 'Session se nepodařilo aktualizovat.' };
  }

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
  const state = getOperatorPartnerEnvironment();
  if (state === null) {
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
      state,
      href: returned.href,
      surface: 'office',
    };
  }

  const session = loadPlatformSession();
  if (session === null) {
    return { ok: false, error: 'Nejste přihlášeni.' };
  }

  const next = updateSession({
    companyId: state.companyId,
    workspaceId: state.workspaceId,
    projectId: state.projectId,
    activeStudioId: sessionStudioIdForSurface(surface),
  });
  if (next === null) {
    return { ok: false, error: 'Session se nepodařilo aktualizovat.' };
  }

  const href = hrefForSurface(surface);
  if (options?.navigate !== false && typeof window !== 'undefined') {
    window.location.assign(href);
  }
  return { ok: true, state, href, surface };
}

export function returnFromOperatorPartnerEnvironment(options?: {
  readonly navigate?: boolean;
}):
  | { readonly ok: true; readonly href: string }
  | { readonly ok: false; readonly error: string } {
  const state = getOperatorPartnerEnvironment();
  if (state === null) {
    return { ok: false, error: 'Operator PE mode není aktivní.' };
  }

  const next = updateSession({
    tenantId: state.previous.tenantId,
    companyId: state.previous.companyId,
    workspaceId: state.previous.workspaceId,
    projectId: state.previous.projectId,
    activeStudioId: 'office',
  });
  const href = state.officeReturnHref;
  clearOperatorPartnerEnvironment();
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
