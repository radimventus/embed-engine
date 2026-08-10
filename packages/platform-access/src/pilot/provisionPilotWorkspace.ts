/**
 * EPIC-BX-15 / PE-03 — Automatic pilot workspace provisioning for a firm.
 * Attaches CONIS sample project (Reference House) and initializes partner studios.
 */

import type {
  PlatformCanonicalProject,
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
  /** Canonical Project scope for sessions, invites, and every Studio. */
  readonly project: PlatformCanonicalProject;
  /** Houses assigned to the canonical Project (published and draft). */
  readonly houses: readonly PlatformProject[];
};

/**
 * Read the Builder-owned Partner / Project / House scope needed by Office
 * access provisioning. This resolver never creates registry entities.
 */
export function resolvePilotWorkspace(
  companyId: string,
): PilotProvisionResult | null {
  const normalizedCompanyId = companyId.trim();
  if (normalizedCompanyId.length === 0) return null;

  const state = getDefaultCompanyRegistry();
  const company = state.companies.find(
    (item) => item.id === normalizedCompanyId,
  );
  const tenant = state.tenants.find(
    (item) => item.companyId === normalizedCompanyId,
  );
  const workspace = state.workspaces.find(
    (item) => item.companyId === normalizedCompanyId,
  );
  const project = state.canonicalProjects.find(
    (item) => item.companyId === normalizedCompanyId,
  );
  if (
    company === undefined ||
    tenant === undefined ||
    workspace === undefined ||
    project === undefined
  ) {
    return null;
  }

  const houses = state.projects.filter(
    (item) => item.canonicalProjectId === project.id,
  );
  if (houses.length === 0) return null;

  return { tenant, company, workspace, project, houses };
}

function slugify(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
}

/**
 * Each pilot firm gets Company + Workspace + canonical Project + assigned Houses.
 */
export function provisionPilotWorkspace(input: {
  readonly companyName: string;
}): PilotProvisionResult {
  const slug = slugify(input.companyName) || `pilot-${Date.now()}`;
  const companyId = `company-${slug}`;
  const tenantId = `tenant-${slug}`;
  const workspaceId = `workspace-${slug}`;
  const canonicalProjectId = `project-${slug}`;
  const referenceHouseId = `reference-v1-${companyId}-${canonicalProjectId}-bungalov-4kk`;
  const createdAt = new Date().toISOString();

  const existing = getDefaultCompanyRegistry().companies.find(
    (item) => item.id === companyId,
  );
  if (existing !== undefined) {
    const state = getDefaultCompanyRegistry();
    const tenant =
      state.tenants.find((item) => item.companyId === companyId) ?? {
        id: tenantId,
        name: `${existing.name} Pilot`,
        companyId,
        pilot: true,
        createdAt,
      };
    const company =
      existing.tenantId === tenant.id
        ? existing
        : { ...existing, tenantId: tenant.id };
    const workspace = state.workspaces.find(
      (item) => item.companyId === companyId,
    )!;
    const existingProject = state.canonicalProjects.find(
      (item) => item.companyId === companyId,
    );
    if (existingProject === undefined) {
      const project: PlatformCanonicalProject = {
        id: canonicalProjectId,
        companyId,
        workspaceId: workspace.id,
        name: CONIS_SAMPLE_PROJECT_LABEL,
        slug: `${slug}-reference-house`,
        description:
          'Ukázkový projekt CONIS (Reference House) — připojen automaticky při provisioning.',
      };
      const referenceHouse: PlatformProject = {
        id: referenceHouseId,
        workspaceId: workspace.id,
        companyId,
        name: 'BUNGALOV 4KK',
        packageRoot: PILOT_HOUSE_PACKAGE_ROOT,
        status: 'ready',
        slug: 'bungalov-4kk',
        objectType: 'reference-house',
        description: 'Reference House attached during Partner provisioning.',
        dataMode: 'REFERENCE_DEMO',
        canonicalProjectId,
      };
      appendPilotProvision({
        tenant,
        company,
        workspace,
        project: referenceHouse,
        canonicalProject: project,
      });
      const result = {
        tenant,
        company,
        workspace,
        project,
        houses: [referenceHouse],
      };
      initializePilotWorkspace(result);
      return result;
    }
    const houses = state.projects.filter(
      (item) => item.canonicalProjectId === existingProject.id,
    );
    const result = {
      tenant,
      company,
      workspace,
      project: existingProject,
      houses,
    };
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
  const project: PlatformCanonicalProject = {
    id: canonicalProjectId,
    companyId,
    workspaceId,
    name: CONIS_SAMPLE_PROJECT_LABEL,
    slug: `${slug}-reference-house`,
    description:
      'Ukázkový projekt CONIS (Reference House) — připojen automaticky při provisioning.',
  };
  const referenceHouse: PlatformProject = {
    id: referenceHouseId,
    workspaceId,
    companyId,
    name: 'BUNGALOV 4KK',
    packageRoot: PILOT_HOUSE_PACKAGE_ROOT,
    status: 'ready',
    slug: 'bungalov-4kk',
    objectType: 'reference-house',
    description: 'Reference House attached during Partner provisioning.',
    dataMode: 'REFERENCE_DEMO',
    canonicalProjectId,
  };

  appendPilotProvision({
    tenant,
    company,
    workspace,
    project: referenceHouse,
    canonicalProject: project,
  });
  const result = {
    tenant,
    company,
    workspace,
    project,
    houses: [referenceHouse],
  };
  initializePilotWorkspace(result);
  return result;
}
