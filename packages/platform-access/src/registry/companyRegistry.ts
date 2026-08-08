/**
 * EPIC-BX-14 / BX-15 / PT-PLAT-01 — Canonical Platform Company + Tenant Registry.
 *
 * Read path (all Studios — Builder / Office / Client / Manager / Sales):
 *   defaults → extras hydrate → merge → consumers filter (e.g. published)
 *
 * Project merge rule (PT-PLAT-01):
 *   - Seed projects keep canonical `status` from defaults forever at merge.
 *   - Extras may patch seed metadata (name, description, packageRoot, …).
 *   - Extras MUST NOT demote/promote seed status (published / draft / archived).
 *   - Non-seed extras merge by id as authored (status belongs to publish workflow).
 *   - Result = published seeds ∪ published extras (not “extras override everything”).
 */

import type {
  PlatformCanonicalProject,
  PlatformCompany,
  PlatformProject,
  PlatformProjectStatus,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';
import {
  DEFAULT_CANONICAL_PROJECTS,
  DEFAULT_COMPANIES,
  DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID,
  DEFAULT_PROJECTS,
  DEFAULT_TENANT_ID,
  DEFAULT_TENANTS,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACES,
} from './defaults';
import {
  clearCrossPortJson,
  readCrossPortJson,
  writeCrossPortJson,
} from './crossPortJsonStore';

export type CompanyRegistryState = {
  readonly tenants: readonly PlatformTenant[];
  readonly companies: readonly PlatformCompany[];
  readonly workspaces: readonly PlatformWorkspace[];
  /** Legacy House-capable rows (packageRoot). */
  readonly projects: readonly PlatformProject[];
  /** CAP-PLAT-04c — true delivery Projects (no House Package fields). */
  readonly canonicalProjects: readonly PlatformCanonicalProject[];
};

const SEED_PROJECT_BY_ID = new Map(
  DEFAULT_PROJECTS.map((project) => [project.id, project] as const),
);

/** True when `projectId` is a platform seed (canonical published house). */
export function isSeedProjectId(projectId: string): boolean {
  return SEED_PROJECT_BY_ID.has(projectId);
}

/**
 * Merge tenants / companies / workspaces — extras win by id.
 * Projects use {@link mergeProjects} (seed status is protected).
 */
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

/**
 * PT-PLAT-01 — defaults ⊕ extras with seed `status` locked to defaults.
 */
export function mergeProjects(
  defaults: readonly PlatformProject[],
  extras: readonly PlatformProject[],
): PlatformProject[] {
  const map = new Map<string, PlatformProject>();
  for (const item of defaults) {
    map.set(item.id, item);
  }
  for (const extra of extras) {
    const seed = SEED_PROJECT_BY_ID.get(extra.id);
    if (seed !== undefined) {
      map.set(extra.id, {
        ...seed,
        ...extra,
        id: seed.id,
        status: seed.status,
      });
      continue;
    }
    map.set(extra.id, extra);
  }
  return [...map.values()];
}

/** Strip illegal seed status from persisted extras (heal corrupt cookies). */
function lockSeedProjectStatus(project: PlatformProject): PlatformProject {
  const seed = SEED_PROJECT_BY_ID.get(project.id);
  if (seed === undefined) return project;
  if (project.status === seed.status) return project;
  return { ...project, status: seed.status };
}

function sanitizeProjectExtras(
  projects: readonly PlatformProject[],
): PlatformProject[] {
  return projects.map(lockSeedProjectStatus);
}

let mutableExtras: {
  tenants: PlatformTenant[];
  companies: PlatformCompany[];
  workspaces: PlatformWorkspace[];
  projects: PlatformProject[];
  canonicalProjects: PlatformCanonicalProject[];
} = {
  tenants: [],
  companies: [],
  workspaces: [],
  projects: [],
  canonicalProjects: [],
};

export const COMPANY_EXTRAS_STORAGE_KEY = 'conis.platform.companyExtras.v1';
/** Cookie twin — shared across local Studio ports (PT-PROJECT-01 / PT-CS-07). */
export const COMPANY_EXTRAS_COOKIE = 'conis_platform_company_extras_v1';

let lastExtrasRaw: string | null = null;

function emptyExtras(): typeof mutableExtras {
  return {
    tenants: [],
    companies: [],
    workspaces: [],
    projects: [],
    canonicalProjects: [],
  };
}

function parseExtras(raw: string): typeof mutableExtras {
  try {
    const parsed = JSON.parse(raw) as Partial<typeof mutableExtras>;
    return {
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
      projects: sanitizeProjectExtras(
        Array.isArray(parsed.projects) ? parsed.projects : [],
      ),
      canonicalProjects: Array.isArray(parsed.canonicalProjects)
        ? parsed.canonicalProjects
        : [],
    };
  } catch {
    return emptyExtras();
  }
}

/** Reconcile from cookie (cross-port) + localStorage; keep in-memory when store unavailable. */
function ensureExtrasHydrated(): void {
  const raw = readCrossPortJson({
    cookieName: COMPANY_EXTRAS_COOKIE,
    storageKey: COMPANY_EXTRAS_STORAGE_KEY,
  });
  if (raw === lastExtrasRaw) return;
  if ((raw === null || raw.length === 0) && lastExtrasRaw !== null) {
    // Persist succeeded in-memory; DOM store missing (Node tests) — do not wipe.
    return;
  }
  lastExtrasRaw = raw;
  mutableExtras =
    raw === null || raw.length === 0 ? emptyExtras() : parseExtras(raw);
}

function persistExtrasToStorage(): void {
  const json = JSON.stringify(mutableExtras);
  lastExtrasRaw = json;
  writeCrossPortJson({
    cookieName: COMPANY_EXTRAS_COOKIE,
    storageKey: COMPANY_EXTRAS_STORAGE_KEY,
    json,
  });
}

export function getDefaultCompanyRegistry(): CompanyRegistryState {
  ensureExtrasHydrated();
  return {
    tenants: mergeById(DEFAULT_TENANTS, mutableExtras.tenants),
    companies: mergeById(DEFAULT_COMPANIES, mutableExtras.companies),
    workspaces: mergeById(DEFAULT_WORKSPACES, mutableExtras.workspaces),
    projects: mergeProjects(DEFAULT_PROJECTS, mutableExtras.projects),
    canonicalProjects: mergeById(
      DEFAULT_CANONICAL_PROJECTS,
      mutableExtras.canonicalProjects,
    ),
  };
}

export function findCanonicalProject(
  state: CompanyRegistryState,
  projectId: string,
): PlatformCanonicalProject | undefined {
  return state.canonicalProjects.find((project) => project.id === projectId);
}

/**
 * CAP-PLAT-04c — resolve delivery Project for a legacy House row.
 * House must not duplicate Project fields; link via canonicalProjectId only.
 */
export function resolveCanonicalProjectForHouseRow(
  houseRow: Pick<PlatformProject, 'id' | 'canonicalProjectId' | 'companyId'>,
): PlatformCanonicalProject | null {
  const registry = getDefaultCompanyRegistry();
  const linkedId = houseRow.canonicalProjectId?.trim();
  if (linkedId !== undefined && linkedId.length > 0) {
    const direct = findCanonicalProject(registry, linkedId);
    if (direct !== undefined) return direct;
  }
  const byCompany = registry.canonicalProjects.find(
    (project) => project.companyId === houseRow.companyId,
  );
  return byCompany ?? null;
}

/** Reset mutable pilot provisions (tests). */
export function resetCompanyRegistryExtras(): void {
  mutableExtras = emptyExtras();
  lastExtrasRaw = null;
  clearCrossPortJson({
    cookieName: COMPANY_EXTRAS_COOKIE,
    storageKey: COMPANY_EXTRAS_STORAGE_KEY,
  });
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
    canonicalProjects: mutableExtras.canonicalProjects,
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
 * PT-PDM-02 / PT-PLAT-01 — Builder-only write into the Shared Project Repository.
 * Upserts by id into extras. Seed `status` is locked to defaults.
 */
export function upsertBuilderProject(project: PlatformProject): CompanyRegistryState {
  ensureExtrasHydrated();
  const normalized = lockSeedProjectStatus(project);
  mutableExtras = {
    ...mutableExtras,
    projects: [
      ...mutableExtras.projects.filter((item) => item.id !== normalized.id),
      normalized,
    ],
  };
  persistExtrasToStorage();
  return getDefaultCompanyRegistry();
}

/** Builder-only — create/update Company identity in Canonical Registry. */
export function upsertBuilderCompany(company: PlatformCompany): CompanyRegistryState {
  ensureExtrasHydrated();
  mutableExtras = {
    ...mutableExtras,
    companies: [
      ...mutableExtras.companies.filter((item) => item.id !== company.id),
      company,
    ],
  };
  persistExtrasToStorage();
  return getDefaultCompanyRegistry();
}

/**
 * CAP-PLAT-04R2a — Builder-only create/update Canonical Project (no House).
 * Persists {@link PlatformCanonicalProject}; never authors a House row.
 */
export function upsertBuilderCanonicalProject(
  project: PlatformCanonicalProject,
): CompanyRegistryState {
  ensureExtrasHydrated();
  const normalized: PlatformCanonicalProject = {
    id: project.id.trim(),
    companyId: project.companyId.trim(),
    workspaceId: project.workspaceId.trim(),
    name: project.name.trim(),
    slug: project.slug.trim(),
    description: project.description.trim(),
  };
  if (normalized.id.length === 0) {
    throw new Error('upsertBuilderCanonicalProject: project id is required');
  }
  mutableExtras = {
    ...mutableExtras,
    canonicalProjects: [
      ...mutableExtras.canonicalProjects.filter(
        (item) => item.id !== normalized.id,
      ),
      normalized,
    ],
  };
  persistExtrasToStorage();
  return getDefaultCompanyRegistry();
}

/** Builder-only — create/update Workspace identity in Canonical Registry. */
export function upsertBuilderWorkspace(
  workspace: PlatformWorkspace,
): CompanyRegistryState {
  ensureExtrasHydrated();
  mutableExtras = {
    ...mutableExtras,
    workspaces: [
      ...mutableExtras.workspaces.filter((item) => item.id !== workspace.id),
      workspace,
    ],
  };
  persistExtrasToStorage();
  return getDefaultCompanyRegistry();
}

/** Builder-only — remove authored override / extra project. Seeds remain from defaults. */
export function removeBuilderProject(projectId: string): boolean {
  ensureExtrasHydrated();
  const before = mutableExtras.projects.length;
  mutableExtras = {
    ...mutableExtras,
    projects: mutableExtras.projects.filter((item) => item.id !== projectId),
  };
  persistExtrasToStorage();
  return before !== mutableExtras.projects.length;
}

/**
 * Builder-only — status transition (publish / ready / draft).
 * PT-PLAT-01 — seed projects refuse status changes; use metadata upsert instead.
 * Explicit publish workflow applies to non-seed authored projects only.
 */
export function setBuilderProjectStatus(
  projectId: string,
  status: PlatformProjectStatus,
): CompanyRegistryState | null {
  ensureExtrasHydrated();
  const registry = getDefaultCompanyRegistry();
  const current = findProject(registry, projectId);
  if (current === undefined) return null;
  const seed = SEED_PROJECT_BY_ID.get(projectId);
  if (seed !== undefined) {
    return registry;
  }
  return upsertBuilderProject({ ...current, status });
}

export {
  DEFAULT_TENANT_ID,
  DEFAULT_COMPANY_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_PROJECT_ID,
};
export { DEFAULT_CANONICAL_PROJECT_ID } from './defaults';
