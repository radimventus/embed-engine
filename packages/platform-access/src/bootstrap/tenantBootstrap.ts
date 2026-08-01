/**
 * EPIC-BX-15 — Tenant Bootstrap: Tenant → Company → Workspace → Project → Studio.
 */

import type { PlatformSession } from '../domain/types';
import type { TenantBootstrap } from '../domain/pilotTypes';
import {
  findCompany,
  findProject,
  findTenant,
  findWorkspace,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';

export function bootstrapTenant(
  session: PlatformSession,
): TenantBootstrap | null {
  const registry = getDefaultCompanyRegistry();
  const tenant = findTenant(registry, session.tenantId);
  const company = findCompany(registry, session.companyId);
  const workspace = findWorkspace(registry, session.workspaceId);
  if (
    tenant === undefined ||
    company === undefined ||
    workspace === undefined
  ) {
    return null;
  }
  const project =
    session.projectId !== null
      ? (findProject(registry, session.projectId) ?? null)
      : null;

  return {
    tenant,
    company,
    workspace,
    project,
    user: session.user,
    studioId: session.activeStudioId,
  };
}
