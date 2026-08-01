/**
 * EPIC-BX-14 / BX-15 — Platform Company + Tenant Registry.
 */

import type {
  PlatformCompany,
  PlatformProject,
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

export function getDefaultCompanyRegistry(): CompanyRegistryState {
  return {
    tenants: [...DEFAULT_TENANTS, ...mutableExtras.tenants],
    companies: [...DEFAULT_COMPANIES, ...mutableExtras.companies],
    workspaces: [...DEFAULT_WORKSPACES, ...mutableExtras.workspaces],
    projects: [...DEFAULT_PROJECTS, ...mutableExtras.projects],
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
}

export function appendPilotProvision(input: {
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
}): CompanyRegistryState {
  mutableExtras = {
    tenants: [...mutableExtras.tenants, input.tenant],
    companies: [...mutableExtras.companies, input.company],
    workspaces: [...mutableExtras.workspaces, input.workspace],
    projects: [...mutableExtras.projects, input.project],
  };
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

export {
  DEFAULT_TENANT_ID,
  DEFAULT_COMPANY_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_PROJECT_ID,
};
