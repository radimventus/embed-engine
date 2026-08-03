/**
 * EPIC-BX-15 / PE-03 — Automatic pilot workspace provisioning for a firm.
 * Attaches CONIS sample project (Reference House) and initializes partner studios.
 */

import type {
  PlatformCompany,
  PlatformProject,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';
import { CONIS_SAMPLE_PROJECT_LABEL } from '../domain/pilotWorkspace';
import {
  appendPilotProvision,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';
import { PILOT_HOUSE_PACKAGE_ROOT } from '../registry/defaults';
import { initializePilotWorkspace } from './pilotWorkspaceStore';

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
    const result = { tenant, company: existing, workspace, project };
    initializePilotWorkspace(result);
    return result;
  }

  const firmName = input.companyName.trim();
  const tenant: PlatformTenant = {
    id: tenantId,
    name: `${firmName} Pilot`,
    companyId,
    pilot: true,
    createdAt,
  };
  const company: PlatformCompany = {
    id: companyId,
    name: firmName,
    tenantId,
  };
  const workspace: PlatformWorkspace = {
    id: workspaceId,
    companyId,
    name: `${firmName} Pilot Workspace`,
  };
  const project: PlatformProject = {
    id: projectId,
    workspaceId,
    companyId,
    name: CONIS_SAMPLE_PROJECT_LABEL,
    packageRoot: PILOT_HOUSE_PACKAGE_ROOT,
    status: 'ready',
    slug: `${slug}-reference-house`,
    objectType: 'villa',
    description:
      'Ukázkový projekt CONIS (Reference House) — připojen automaticky při provisioning.',
  };

  appendPilotProvision({ tenant, company, workspace, project });
  const result = { tenant, company, workspace, project };
  initializePilotWorkspace(result);
  return result;
}
