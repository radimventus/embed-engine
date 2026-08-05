/**
 * EPIC-BX-14 / BX-15 — Platform Company + Tenant Registry.
 */

import type {
  PlatformCompany,
  PlatformProject,
  PlatformProjectStatus,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';
import {
  DEFAULT_COMPANIES,
  DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID,
  DEFAULT_PROJECTS,
  DEFAULT_TENANT_ID,
  DEFAULT_TENANTS,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACES,
} from './defaults';

export type CompanyRegistryState = {
  readonly tenants: readonly PlatformTenant[];
  readonly companies: readonly PlatformCompany[];
  readonly workspaces: readonly PlatformWorkspace[];
  readonly projects: readonly PlatformProject[];
};

/** Merge defaults with extras — extras win by id (Builder authoring overrides). */
function mergeById<T extends { readonly id: string }>(
  defaults: readonly T[],
  extras: readonly T[],
): T[] {
  const map = new Map<string, T>();
  for (const item of defaults) {
    map.set(item.id, item);
  }
  for (const item of extras) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

let mutableExtras: {
  tenants: PlatformTenant[];
  companies: PlatformCompany[];
  workspaces: PlatformWorkspace[];
  projects: PlatformProject[];
} = {
  tenants: [],
  companies: [],
  workspaces: [],
  projects: [],
};

const COMPANY_EXTRAS_STORAGE_KEY = 'conis.platform.companyExtras.v1';

function loadExtrasFromStorage(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(COMPANY_EXTRAS_STORAGE_KEY);
    if (raw === null || raw.length === 0) return;
    const parsed = JSON.parse(raw) as Partial<typeof mutableExtras>;
    mutableExtras = {
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch {
    // ignore corrupt storage
  }
}

function persistExtrasToStorage(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(COMPANY_EXTRAS_STORAGE_KEY, JSON.stringify(mutableExtras));
  } catch {
    // quota / private mode
  }
}

let extrasHydrated = false;

function ensureExtrasHydrated(): void {
  if (extrasHydrated) return;
  extrasHydrated = true;
  loadExtrasFromStorage();
}

export function getDefaultCompanyRegistry(): CompanyRegistryState {
  ensureExtrasHydrated();
  return {
    tenants: mergeById(DEFAULT_TENANTS, mutableExtras.tenants),
    companies: mergeById(DEFAULT_COMPANIES, mutableExtras.companies),
    workspaces: mergeById(DEFAULT_WORKSPACES, mutableExtras.workspaces),
    projects: mergeById(DEFAULT_PROJECTS, mutableExtras.projects),
  };
}

/** Reset mutable pilot provisions (tests). */
export function resetCompanyRegistryExtras(): void {
  mutableExtras = {
    tenants: [],
    companies: [],
    workspaces: [],
    projects: [],
  };
  extrasHydrated = true;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(COMPANY_EXTRAS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function appendPilotProvision(input: {
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
}): CompanyRegistryState {
  ensureExtrasHydrated();
  const withoutDup = {
    tenants: mutableExtras.tenants.filter((item) => item.id !== input.tenant.id),
    companies: mutableExtras.companies.filter(
      (item) => item.id !== input.company.id,
    ),
    workspaces: mutableExtras.workspaces.filter(
      (item) => item.id !== input.workspace.id,
    ),
    projects: mutableExtras.projects.filter(
      (item) => item.id !== input.project.id,
    ),
  };
  mutableExtras = {
    tenants: [...withoutDup.tenants, input.tenant],
    companies: [...withoutDup.companies, input.company],
    workspaces: [...withoutDup.workspaces, input.workspace],
    projects: [...withoutDup.projects, input.project],
  };
  persistExtrasToStorage();
  return getDefaultCompanyRegistry();
}

export function findTenant(
  state: CompanyRegistryState,
  tenantId: string,
): PlatformTenant | undefined {
  return state.tenants.find((item) => item.id === tenantId);
}

export function findCompany(
  state: CompanyRegistryState,
  companyId: string,
): PlatformCompany | undefined {
  return state.companies.find((item) => item.id === companyId);
}

export function findWorkspace(
  state: CompanyRegistryState,
  workspaceId: string,
): PlatformWorkspace | undefined {
  return state.workspaces.find((item) => item.id === workspaceId);
}

export function findProject(
  state: CompanyRegistryState,
  projectId: string,
): PlatformProject | undefined {
  return state.projects.find((item) => item.id === projectId);
}

export function listWorkspacesForCompany(
  state: CompanyRegistryState,
  companyId: string,
): readonly PlatformWorkspace[] {
  return state.workspaces.filter((item) => item.companyId === companyId);
}

export function listProjectsForWorkspace(
  state: CompanyRegistryState,
  workspaceId: string,
): readonly PlatformProject[] {
  return state.projects.filter((item) => item.workspaceId === workspaceId);
}

export function listProjectsForCompany(
  state: CompanyRegistryState,
  companyId: string,
): readonly PlatformProject[] {
  return state.projects.filter((item) => item.companyId === companyId);
}

/**
 * PT-PDM-02 — Builder-only write into the Shared Project Repository.
 * Upserts by id into extras (overrides defaults when ids match).
 */
export function upsertBuilderProject(project: PlatformProject): CompanyRegistryState {
  ensureExtrasHydrated();
  mutableExtras = {
    ...mutableExtras,
    projects: [
      ...mutableExtras.projects.filter((item) => item.id !== project.id),
      project,
    ],
  };
  persistExtrasToStorage();
  return getDefaultCompanyRegistry();
}

/** Builder-only — remove authored override / extra project. */
export function removeBuilderProject(projectId: string): boolean {
  ensureExtrasHydrated();
  const before = mutableExtras.projects.length;
  const isDefault = DEFAULT_PROJECTS.some((item) => item.id === projectId);
  mutableExtras = {
    ...mutableExtras,
    projects: mutableExtras.projects.filter((item) => item.id !== projectId),
  };
  /** Soft-delete default seeds by marking them absent via a tombstone draft remove — defaults stay. */
  if (isDefault) {
    persistExtrasToStorage();
    return before !== mutableExtras.projects.length;
  }
  persistExtrasToStorage();
  return before !== mutableExtras.projects.length;
}

/** Builder-only — status transition (publish / ready / draft). */
export function setBuilderProjectStatus(
  projectId: string,
  status: PlatformProjectStatus,
): CompanyRegistryState | null {
  ensureExtrasHydrated();
  const registry = getDefaultCompanyRegistry();
  const current = findProject(registry, projectId);
  if (current === undefined) return null;
  return upsertBuilderProject({ ...current, status });
}

export {
  DEFAULT_TENANT_ID,
  DEFAULT_COMPANY_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_PROJECT_ID,
};
