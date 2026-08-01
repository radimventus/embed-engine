/**
 * EPIC-BX-15 — Automatic pilot workspace provisioning for a firm.
 */

import type {
  PlatformCompany,
  PlatformProject,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';
import {
  appendPilotProvision,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';
import { PILOT_HOUSE_PACKAGE_ROOT } from '../registry/defaults';

export type PilotProvisionResult = {
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
}

/**
 * Each pilot firm gets Company + Workspace + first Project + House Package root.
 */
export function provisionPilotWorkspace(input: {
  readonly companyName: string;
}): PilotProvisionResult {
  const slug = slugify(input.companyName) || `pilot-${Date.now()}`;
  const companyId = `company-${slug}`;
  const tenantId = `tenant-${slug}`;
  const workspaceId = `workspace-${slug}`;
  const projectId = `project-${slug}-01`;
  const createdAt = new Date().toISOString();

  const existing = getDefaultCompanyRegistry().companies.find(
    (item) => item.id === companyId,
  );
  if (existing !== undefined) {
    const state = getDefaultCompanyRegistry();
    const tenant = state.tenants.find((item) => item.companyId === companyId)!;
    const workspace = state.workspaces.find(
      (item) => item.companyId === companyId,
    )!;
    const project = state.projects.find(
      (item) => item.companyId === companyId,
    )!;
    return { tenant, company: existing, workspace, project };
  }

  const tenant: PlatformTenant = {
    id: tenantId,
    name: `${input.companyName.trim()} Pilot`,
    companyId,
    pilot: true,
    createdAt,
  };
  const company: PlatformCompany = {
    id: companyId,
    name: input.companyName.trim(),
    tenantId,
  };
  const workspace: PlatformWorkspace = {
    id: workspaceId,
    companyId,
    name: `${input.companyName.trim()} Main`,
  };
  const project: PlatformProject = {
    id: projectId,
    workspaceId,
    companyId,
    name: `${input.companyName.trim()} Pilot Project`,
    packageRoot: PILOT_HOUSE_PACKAGE_ROOT,
    status: 'ready',
    slug: `${slug}-pilot`,
    objectType: 'villa',
    description: 'Automaticky provisionovaný pilotní projekt s House Package.',
  };

  appendPilotProvision({ tenant, company, workspace, project });
  return { tenant, company, workspace, project };
}
