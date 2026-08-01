/**
 * EPIC-BX-14 — Workspace Bootstrap: User → Company → Workspace → Project → Studio.
 */

import type {
  PlatformSession,
  PlatformStudioId,
  WorkspaceBootstrap,
} from '../domain/types';
import {
  findCompany,
  findProject,
  findWorkspace,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';

export function bootstrapWorkspace(
  session: PlatformSession,
): WorkspaceBootstrap | null {
  const registry = getDefaultCompanyRegistry();
  const company = findCompany(registry, session.companyId);
  const workspace = findWorkspace(registry, session.workspaceId);
  if (company === undefined || workspace === undefined) {
    return null;
  }
  const project =
    session.projectId !== null
      ? (findProject(registry, session.projectId) ?? null)
      : null;

  return {
    user: session.user,
    company,
    workspace,
    project,
    studioId: session.activeStudioId,
  };
}

export function resolveStudioHref(studioId: PlatformStudioId): string {
  switch (studioId) {
    case 'builder':
      return 'http://127.0.0.1:4177/';
    case 'manager':
      return 'http://127.0.0.1:4175/';
    case 'sales':
      return 'http://127.0.0.1:4179/';
  }
}
