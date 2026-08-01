/**
 * EPIC-BX-14 — Project Bootstrap orchestration.
 * Loads workspace context and marks Capability / Intelligence readiness.
 * Does not change HP-002, Runtime, Intelligence Core, or Capability Platform.
 */

import { composeStudioById } from '@embed-engine/capabilities';

import type {
  PlatformSession,
  ProjectBootstrap,
  PlatformStudioId,
} from '../domain/types';
import {
  findCompany,
  findProject,
  findWorkspace,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';

export function bootstrapProject(input: {
  readonly session: PlatformSession;
  readonly projectId: string;
  readonly studioId: PlatformStudioId;
}): ProjectBootstrap | null {
  const registry = getDefaultCompanyRegistry();
  const project = findProject(registry, input.projectId);
  if (project === undefined) return null;
  const workspace = findWorkspace(registry, project.workspaceId);
  const company = findCompany(registry, project.companyId);
  if (workspace === undefined || company === undefined) return null;

  let capabilitiesReady = false;
  try {
    const host = composeStudioById(input.studioId);
    capabilitiesReady = host.declaredIds.length > 0;
  } catch {
    capabilitiesReady = false;
  }

  return {
    workspace,
    project,
    company,
    housePackageRoot: project.packageRoot,
    capabilitiesReady,
    /** Intelligence Core remains in @embed-engine/intelligence — adapter ready. */
    intelligenceReady: true,
  };
}
