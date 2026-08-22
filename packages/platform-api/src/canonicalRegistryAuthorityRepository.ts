import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import {
  DEFAULT_CANONICAL_PROJECTS,
  DEFAULT_COMPANIES,
  DEFAULT_TENANTS,
  DEFAULT_WORKSPACES,
} from '@embed-engine/platform-access';
import type {
  PlatformCanonicalProject,
  PlatformCompany,
  PlatformTenant,
  PlatformWorkspace,
} from '@embed-engine/platform-access';

import { platformApiStatePath } from './platformApiConfig';

export type CanonicalRegistryAuthorityBundle = {
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformCanonicalProject;
};


export type PlatformCanonicalHouse = {
  readonly id: string;
  readonly canonicalProjectId: string;
  readonly name: string;
  readonly packageRoot?: string;
  readonly status?: string;
};

export type CanonicalRegistryAuthoritySnapshot = {
  readonly tenants: readonly PlatformTenant[];
  readonly companies: readonly PlatformCompany[];
  readonly workspaces: readonly PlatformWorkspace[];
  readonly projects: readonly PlatformCanonicalProject[];
  readonly houses: readonly PlatformCanonicalHouse[];
};


type CanonicalRegistryAuthorityExtras = {
  readonly tenants: readonly PlatformTenant[];
  readonly companies: readonly PlatformCompany[];
  readonly workspaces: readonly PlatformWorkspace[];
  readonly canonicalProjects: readonly PlatformCanonicalProject[];
  readonly houses: readonly PlatformCanonicalHouse[];
};

export type PlatformCanonicalProjectRuntimeAuthority = {
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
};

const EMPTY_EXTRAS: CanonicalRegistryAuthorityExtras = {
  tenants: [],
  companies: [],
  workspaces: [],
  canonicalProjects: [],
  houses: [],
};

function normalize(value: string): string {
  return value.trim();
}

function requireId(label: string, value: string): string {
  const normalized = normalize(value);
  if (normalized.length === 0) {
    throw new Error(`${label} is required.`);
  }
  return normalized;
}

function cloneExtras(
  input: CanonicalRegistryAuthorityExtras,
): CanonicalRegistryAuthorityExtras {
  return {
    tenants: [...input.tenants],
    companies: [...input.companies],
    workspaces: [...input.workspaces],
    canonicalProjects: [...input.canonicalProjects],
    houses: [...(input.houses ?? [])],
  };
}

function parseExtras(raw: string): CanonicalRegistryAuthorityExtras {
  const parsed = JSON.parse(raw) as Partial<CanonicalRegistryAuthorityExtras>;

  return {
    tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
    companies: Array.isArray(parsed.companies) ? parsed.companies : [],
    workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
    canonicalProjects: Array.isArray(parsed.canonicalProjects)
      ? parsed.canonicalProjects
      : [],
    houses: Array.isArray(parsed.houses) ? parsed.houses : [],
  };
}

function upsertById<T extends { readonly id: string }>(
  items: readonly T[],
  value: T,
): readonly T[] {
  return [...items.filter((item) => item.id !== value.id), value];
}

function findById<T extends { readonly id: string }>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}

export class FileCanonicalRegistryAuthorityRepository {
  readonly statePath: string;

  constructor(
    statePath = platformApiStatePath('canonical-registry-extras.json'),
  ) {
    this.statePath = statePath;
  }

  private async readExtras(): Promise<CanonicalRegistryAuthorityExtras> {
    try {
      return parseExtras(await readFile(this.statePath, 'utf8'));
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return cloneExtras(EMPTY_EXTRAS);
      }
      throw error;
    }
  }

  private async writeExtras(
    extras: CanonicalRegistryAuthorityExtras,
  ): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });

    const temporaryPath = `${this.statePath}.${process.pid}.${Date.now()}.tmp`;

    await writeFile(
      temporaryPath,
      `${JSON.stringify(extras, null, 2)}\n`,
      'utf8',
    );

    await rename(temporaryPath, this.statePath);
  }

  async listExtras(): Promise<CanonicalRegistryAuthorityExtras> {
    return cloneExtras(await this.readExtras());
  }

  async upsertAuthorityBundle(
    input: CanonicalRegistryAuthorityBundle,
  ): Promise<PlatformCanonicalProjectRuntimeAuthority> {
    const tenant: PlatformTenant = {
      ...input.tenant,
      id: requireId('tenant.id', input.tenant.id),
      companyId: requireId('tenant.companyId', input.tenant.companyId),
    };

    const company: PlatformCompany = {
      ...input.company,
      id: requireId('company.id', input.company.id),
      tenantId: requireId('company.tenantId', input.company.tenantId),
    };

    const workspace: PlatformWorkspace = {
      ...input.workspace,
      id: requireId('workspace.id', input.workspace.id),
      companyId: requireId('workspace.companyId', input.workspace.companyId),
    };

    const project: PlatformCanonicalProject = {
      ...input.project,
      id: requireId('project.id', input.project.id),
      companyId: requireId('project.companyId', input.project.companyId),
      workspaceId: requireId('project.workspaceId', input.project.workspaceId),
    };

    if (tenant.companyId !== company.id) {
      throw new Error('Tenant company binding does not match Company.');
    }

    if (company.tenantId !== tenant.id) {
      throw new Error('Company tenant binding does not match Tenant.');
    }

    if (workspace.companyId !== company.id) {
      throw new Error('Workspace does not belong to Company.');
    }

    if (project.companyId !== company.id) {
      throw new Error('Project does not belong to Company.');
    }

    if (project.workspaceId !== workspace.id) {
      throw new Error('Project does not belong to Workspace.');
    }

    const extras = await this.readExtras();

    const existingProject =
      findById(DEFAULT_CANONICAL_PROJECTS, project.id) ??
      findById(extras.canonicalProjects, project.id);

    if (
      existingProject !== undefined &&
      (existingProject.companyId !== project.companyId ||
        existingProject.workspaceId !== project.workspaceId)
    ) {
      throw new Error('Canonical Project ownership cannot be changed.');
    }

    const existingCompany =
      findById(DEFAULT_COMPANIES, company.id) ??
      findById(extras.companies, company.id);

    if (
      existingCompany !== undefined &&
      existingCompany.tenantId !== company.tenantId
    ) {
      throw new Error('Company ownership cannot be changed.');
    }

    const existingWorkspace =
      findById(DEFAULT_WORKSPACES, workspace.id) ??
      findById(extras.workspaces, workspace.id);

    if (
      existingWorkspace !== undefined &&
      existingWorkspace.companyId !== workspace.companyId
    ) {
      throw new Error('Workspace ownership cannot be changed.');
    }

    const next: CanonicalRegistryAuthorityExtras = {
      tenants: upsertById(extras.tenants, tenant),
      companies: upsertById(extras.companies, company),
      workspaces: upsertById(extras.workspaces, workspace),
      canonicalProjects: upsertById(extras.canonicalProjects, project),
      houses: extras.houses ?? [],
    };

    await this.writeExtras(next);

    return {
      tenantId: tenant.id,
      companyId: company.id,
      workspaceId: workspace.id,
      projectId: project.id,
    };
  }


  async upsertHouseAuthority(house: PlatformCanonicalHouse): Promise<PlatformCanonicalHouse> {
    const normalizedHouse: PlatformCanonicalHouse = {
      id: requireId('house.id', house.id),
      canonicalProjectId: requireId('house.canonicalProjectId', house.canonicalProjectId),
      name: requireId('house.name', house.name),
      ...(house.packageRoot !== undefined ? { packageRoot: house.packageRoot } : {}),
      ...(house.status !== undefined ? { status: house.status } : {}),
    };

    const extras = await this.readExtras();
    const nextHouses = upsertById(extras.houses ?? [], normalizedHouse);
    await this.writeExtras({
      ...extras,
      houses: nextHouses,
    });
    return normalizedHouse;
  }

  async readAuthoritySnapshot(): Promise<CanonicalRegistryAuthoritySnapshot> {
    const extras = await this.readExtras();

    const byId = <T extends { readonly id: string }>(
      defaults: readonly T[],
      dynamic: readonly T[],
    ): readonly T[] =>
      [...new Map(
        [...defaults, ...dynamic].map((item) => [item.id, item]),
      ).values()];

    return {
      tenants: byId(DEFAULT_TENANTS, extras.tenants),
      companies: byId(DEFAULT_COMPANIES, extras.companies),
      workspaces: byId(DEFAULT_WORKSPACES, extras.workspaces),
      projects: byId(
        DEFAULT_CANONICAL_PROJECTS,
        extras.canonicalProjects,
      ),
      houses: extras.houses ?? [],
    };
  }

  async resolveProjectAuthority(
    projectIdInput: string,
  ): Promise<PlatformCanonicalProjectRuntimeAuthority | null> {
    const projectId = normalize(projectIdInput);
    if (projectId.length === 0) return null;

    const extras = await this.readExtras();

    const project =
      findById(DEFAULT_CANONICAL_PROJECTS, projectId) ??
      findById(extras.canonicalProjects, projectId);

    if (project === undefined) return null;

    const company =
      findById(DEFAULT_COMPANIES, project.companyId) ??
      findById(extras.companies, project.companyId);

    if (company === undefined) return null;

    const workspace =
      findById(DEFAULT_WORKSPACES, project.workspaceId) ??
      findById(extras.workspaces, project.workspaceId);

    if (
      workspace === undefined ||
      workspace.companyId !== company.id
    ) {
      return null;
    }

    const tenant =
      findById(DEFAULT_TENANTS, company.tenantId) ??
      findById(extras.tenants, company.tenantId);

    if (
      tenant === undefined ||
      tenant.companyId !== company.id
    ) {
      return null;
    }

    return {
      tenantId: tenant.id,
      companyId: company.id,
      workspaceId: workspace.id,
      projectId: project.id,
    };
  }
}
