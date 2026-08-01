/**
 * EPIC-BX-17 — Adapter: existing Company/Workspace/Project → CS snapshot.
 * Does not introduce a second customer model.
 */

import { composeStudioById } from '@embed-engine/capabilities';
import {
  findCompany,
  findWorkspace,
  getDefaultCompanyRegistry,
  listPendingInvites,
  listProjectsForCompany,
  listRecentActivity,
  readLastPublish,
  resolveCloudStudioHref,
  type PlatformSession,
} from '@embed-engine/platform-access';

import type { CustomerSuccessSnapshotInput } from '../domain/types';
import { buildCustomerSuccessReport } from '../engine/buildCustomerSuccessReport';
import type { CustomerSuccessReport } from '../domain/types';

function countActiveCapabilities(): number {
  let total = 0;
  for (const studioId of ['builder', 'manager', 'sales'] as const) {
    try {
      const host = composeStudioById(studioId);
      total += host.healthReport().filter((item) => item.active).length;
      // Composition implies declared capabilities are usable for adoption.
      total += Math.min(host.declaredIds.length, 3);
    } catch {
      // ignore missing studio
    }
  }
  return total;
}

export function buildCustomerSuccessSnapshot(input: {
  readonly session: PlatformSession | null;
  readonly companyId?: string;
  readonly workspaceId?: string;
}): CustomerSuccessSnapshotInput | null {
  const registry = getDefaultCompanyRegistry();
  const companyId =
    input.companyId ?? input.session?.companyId ?? registry.companies[0]?.id;
  if (companyId === undefined) return null;

  const company = findCompany(registry, companyId);
  if (company === undefined) return null;

  const workspaceId =
    input.workspaceId ??
    input.session?.workspaceId ??
    registry.workspaces.find((item) => item.companyId === companyId)?.id;
  if (workspaceId === undefined) return null;

  const workspace = findWorkspace(registry, workspaceId);
  if (workspace === undefined) return null;

  const projects = listProjectsForCompany(registry, companyId);
  const lastPublish = readLastPublish();
  const activity = listRecentActivity(20);
  const pendingInviteCount = listPendingInvites().filter(
    (invite) => invite.companyId === companyId,
  ).length;

  return {
    companyId: company.id,
    companyName: company.name,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    projectCount: projects.length,
    publishedProjectCount: projects.filter((p) => p.status === 'published')
      .length,
    readyProjectCount: projects.filter(
      (p) => p.status === 'ready' || p.status === 'published',
    ).length,
    hasHousePackage: projects.some((p) => p.packageRoot.trim().length > 0),
    sessionActive: input.session !== null,
    lastLoginAt: input.session?.lastLoginAt ?? null,
    lastPublishAt: lastPublish?.at ?? null,
    lastPublishLabel: lastPublish?.label ?? null,
    pendingInviteCount,
    activityLabels: activity.map((item) => `${item.label} ${item.detail}`),
    capabilityActiveCount: countActiveCapabilities(),
    builderHref: resolveCloudStudioHref('builder'),
    managerHref: resolveCloudStudioHref('manager'),
    salesHref: resolveCloudStudioHref('sales'),
  };
}

export function analyzeCustomerSuccess(input: {
  readonly session: PlatformSession | null;
  readonly companyId?: string;
  readonly workspaceId?: string;
}): CustomerSuccessReport | null {
  const snapshot = buildCustomerSuccessSnapshot(input);
  if (snapshot === null) return null;
  return buildCustomerSuccessReport(snapshot);
}
