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
} from "../domain/types";
import type { PlatformTenant } from "../domain/pilotTypes";
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
} from "./defaults";
import {
  clearCrossPortJson,
  readCrossPortJson,
  writeCrossPortJson,
} from "./crossPortJsonStore";
import {
  durableProjectPrivacyUrl,
  resetDurableProjectConfigs,
} from "./durableProjectConfig";

export type CompanyRegistryState = {
  readonly tenants: readonly PlatformTenant[];
  readonly companies: readonly PlatformCompany[];
  readonly workspaces: readonly PlatformWorkspace[];
  /** Legacy House-capable rows (packageRoot). */
  readonly projects: readonly PlatformProject[];
  /** CAP-PLAT-04c — true delivery Projects (no House Package fields). */
  readonly canonicalProjects: readonly PlatformCanonicalProject[];
};

export type CreateCanonicalPartnerInput = {
  readonly name: string;
  readonly tenantId?: string;
};

export type CanonicalPartnerIdentity = {
  readonly companyId: string;
  readonly workspaceId: string;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
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
        // A persisted editor snapshot must not sever a seeded House from its
        // canonical package merely because its legacy package field is blank.
        packageRoot:
          extra.packageRoot.trim().length > 0
            ? extra.packageRoot
            : seed.packageRoot,
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
  houses?: any[];
} = {
  tenants: [],
  companies: [],
  workspaces: [],
  projects: [],
  canonicalProjects: [],
  houses: [],
};

export const COMPANY_EXTRAS_STORAGE_KEY = "conis.platform.companyExtras.v1";
/** Cookie twin — shared across local Studio ports (PT-PROJECT-01 / PT-CS-07). */
export const COMPANY_EXTRAS_COOKIE = "conis_platform_company_extras_v1";

let lastExtrasRaw: string | null = null;

function emptyExtras(): typeof mutableExtras {
  return {
    tenants: [],
    companies: [],
    workspaces: [],
    projects: [],
    canonicalProjects: [],
    houses: [],
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
      houses: Array.isArray(parsed.houses) ? parsed.houses : [],
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

function stripBrowserPrivacyUrl(
  project: PlatformCanonicalProject,
): PlatformCanonicalProject {
  const privacyUrl = durableProjectPrivacyUrl(project.id);
  return privacyUrl === undefined
    ? {
        id: project.id,
        companyId: project.companyId,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
      }
    : {
        id: project.id,
        companyId: project.companyId,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        privacyUrl,
      };
}

export function getDefaultCompanyRegistry(): CompanyRegistryState {
  ensureExtrasHydrated();
  return {
    tenants: mergeById(DEFAULT_TENANTS, mutableExtras.tenants),
    companies: mergeById(DEFAULT_COMPANIES, mutableExtras.companies).map(
      (company) => ({
        id: company.id,
        name: company.name,
        tenantId: company.tenantId,
      }),
    ),
    workspaces: mergeById(DEFAULT_WORKSPACES, mutableExtras.workspaces),
    projects: mergeProjects(DEFAULT_PROJECTS, mutableExtras.projects),
    canonicalProjects: mergeById(
      DEFAULT_CANONICAL_PROJECTS,
      mutableExtras.canonicalProjects,
    ).map(stripBrowserPrivacyUrl),
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
  houseRow: Pick<PlatformProject, "id" | "canonicalProjectId" | "companyId">,
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
  resetDurableProjectConfigs();
  clearCrossPortJson({
    cookieName: COMPANY_EXTRAS_COOKIE,
    storageKey: COMPANY_EXTRAS_STORAGE_KEY,
  });
}

export function appendPilotProvision(input: {
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project?: PlatformProject;
  readonly canonicalProject?: PlatformCanonicalProject;
}): CompanyRegistryState {
  ensureExtrasHydrated();
  const project = input.project;
  const canonicalProject = input.canonicalProject;
  const withoutDup = {
    tenants: mutableExtras.tenants.filter(
      (item) => item.id !== input.tenant.id,
    ),
    companies: mutableExtras.companies.filter(
      (item) => item.id !== input.company.id,
    ),
    workspaces: mutableExtras.workspaces.filter(
      (item) => item.id !== input.workspace.id,
    ),
    projects:
      project === undefined
        ? mutableExtras.projects
        : mutableExtras.projects.filter((item) => item.id !== project.id),
    canonicalProjects: mutableExtras.canonicalProjects.filter(
      (item) => item.id !== canonicalProject?.id,
    ),
  };
  mutableExtras = {
    tenants: [...withoutDup.tenants, input.tenant],
    companies: [...withoutDup.companies, input.company],
    workspaces: [...withoutDup.workspaces, input.workspace],
    projects:
      project === undefined
        ? withoutDup.projects
        : [...withoutDup.projects, project],
    canonicalProjects:
      canonicalProject === undefined
        ? mutableExtras.canonicalProjects
        : [...withoutDup.canonicalProjects, canonicalProject],
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

/** Canonical Workspace ownership reader for Company-rooted writes. */
export function getCanonicalWorkspaceForCompany(
  companyId: string,
): PlatformWorkspace | null {
  const normalizedCompanyId = companyId.trim();
  if (normalizedCompanyId.length === 0) return null;
  return (
    getDefaultCompanyRegistry().workspaces.find(
      (workspace) => workspace.companyId === normalizedCompanyId,
    ) ?? null
  );
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

function canonicalPartnerSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function nextCanonicalPartnerId(
  prefix: "tenant" | "company" | "workspace",
  slug: string,
  knownIds: ReadonlySet<string>,
): string {
  const base = `${prefix}-${slug}`;
  let candidate = base;
  let suffix = 2;
  while (knownIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/**
 * Creates or resolves the shared Partner identity used by every Studio.
 * Commercial/contact lifecycle data deliberately remains outside this boundary.
 */
export function createCanonicalPartner(
  input: CreateCanonicalPartnerInput,
): CanonicalPartnerIdentity {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new Error("createCanonicalPartner: partner name is required");
  }

  const registry = getDefaultCompanyRegistry();
  const existingCompany = registry.companies.find(
    (company) =>
      company.name.trim().localeCompare(name, undefined, {
        sensitivity: "accent",
      }) === 0,
  );
  if (existingCompany !== undefined) {
    const existingWorkspace = registry.workspaces.find(
      (workspace) => workspace.companyId === existingCompany.id,
    );
    if (existingWorkspace !== undefined) {
      return {
        companyId: existingCompany.id,
        workspaceId: existingWorkspace.id,
        company: existingCompany,
        workspace: existingWorkspace,
      };
    }

    const workspace = {
      id: nextCanonicalPartnerId(
        "workspace",
        canonicalPartnerSlug(existingCompany.name) || "partner",
        new Set(registry.workspaces.map((item) => item.id)),
      ),
      companyId: existingCompany.id,
      name: `${existingCompany.name} Workspace`,
    };
    mutableExtras = {
      ...mutableExtras,
      workspaces: [
        ...mutableExtras.workspaces.filter((item) => item.id !== workspace.id),
        workspace,
      ],
    };
    persistExtrasToStorage();
    return {
      companyId: existingCompany.id,
      workspaceId: workspace.id,
      company: existingCompany,
      workspace,
    };
  }

  const slug = canonicalPartnerSlug(name) || "partner";

  const companyId = nextCanonicalPartnerId(
    "company",
    slug,
    new Set(registry.companies.map((item) => item.id)),
  );

  const requestedTenantId = input.tenantId?.trim() ?? "";
  const tenantId =
    requestedTenantId.length > 0
      ? requestedTenantId
      : nextCanonicalPartnerId(
          "tenant",
          slug,
          new Set(registry.tenants.map((item) => item.id)),
        );

  const existingTenant = registry.tenants.find((item) => item.id === tenantId);

  if (existingTenant !== undefined && existingTenant.companyId !== companyId) {
    throw new Error(
      "createCanonicalPartner: Tenant already belongs to another Company",
    );
  }

  const tenant: PlatformTenant = existingTenant ?? {
    id: tenantId,
    name,
    companyId,
    pilot: false,
    createdAt: new Date().toISOString(),
  };

  const company: PlatformCompany = {
    id: companyId,
    name,
    tenantId,
  };

  const workspace: PlatformWorkspace = {
    id: nextCanonicalPartnerId(
      "workspace",
      slug,
      new Set(registry.workspaces.map((item) => item.id)),
    ),
    companyId: company.id,
    name: `${name} Workspace`,
  };
  mutableExtras = {
    ...mutableExtras,
    tenants: [
      ...mutableExtras.tenants.filter((item) => item.id !== tenant.id),
      tenant,
    ],
    companies: [...mutableExtras.companies, company],
    workspaces: [...mutableExtras.workspaces, workspace],
  };
  persistExtrasToStorage();
  return {
    companyId: company.id,
    workspaceId: workspace.id,
    company,
    workspace,
  };
}

/**
 * PT-PDM-02 / PT-PLAT-01 — Builder-only write into the Shared Project Repository.
 * Upserts by id into extras. Seed `status` is locked to defaults.
 */
export function upsertBuilderProject(
  project: PlatformProject,
): CompanyRegistryState {
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
export function upsertBuilderCompany(
  company: PlatformCompany,
): CompanyRegistryState {
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
  const canonicalWorkspace = getCanonicalWorkspaceForCompany(project.companyId);
  const normalized: PlatformCanonicalProject = {
    id: project.id.trim(),
    companyId: project.companyId.trim(),
    // Compatibility writers may predate a Workspace. When one exists, it is
    // authoritative and prevents callers from deriving a mismatched id.
    workspaceId: canonicalWorkspace?.id ?? project.workspaceId.trim(),
    name: project.name.trim(),
    slug: project.slug.trim(),
    description: project.description.trim(),
  };
  if (normalized.id.length === 0) {
    throw new Error("upsertBuilderCanonicalProject: project id is required");
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
export { DEFAULT_CANONICAL_PROJECT_ID } from "./defaults";

export type CanonicalRegistryAuthoritySnapshotInput = {
  readonly houses?: readonly any[];
  readonly tenants: readonly PlatformTenant[];
  readonly companies: readonly PlatformCompany[];
  readonly workspaces: readonly PlatformWorkspace[];
  readonly projects: readonly PlatformCanonicalProject[];
};

export function hydrateCanonicalRegistryFromAuthority(
  snapshot: CanonicalRegistryAuthoritySnapshotInput,
): CompanyRegistryState {
  ensureExtrasHydrated();

  mutableExtras = {
    ...mutableExtras,
    tenants: [...snapshot.tenants],
    companies: [...snapshot.companies],
    workspaces: [...snapshot.workspaces],
    canonicalProjects: [...snapshot.projects],
    houses: [...((snapshot as any).houses ?? [])],
  };

  persistExtrasToStorage();

  return getDefaultCompanyRegistry();
}

export function getHydratedCanonicalHouses(): readonly any[] {
  ensureExtrasHydrated();
  return mutableExtras.houses ?? [];
}
