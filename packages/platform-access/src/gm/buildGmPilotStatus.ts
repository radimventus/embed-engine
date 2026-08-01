/**
 * EPIC-BX-16 — Pilot firm lifecycle summary.
 */

import { listPendingInvites } from '../pilot/inviteStore';
import {
  findCompany,
  getDefaultCompanyRegistry,
  listProjectsForCompany,
} from '../registry/companyRegistry';
import type {
  GmPilotFirmStatus,
  GmPilotLifecycle,
  GmPilotStatusSummary,
} from './gmTypes';

const LIFECYCLE_LABELS: Record<GmPilotLifecycle, string> = {
  aktivni: 'aktivní',
  onboarding: 'onboarding',
  'ceka-na-data': 'čeká na data',
  produkce: 'produkce',
};

function deriveLifecycle(input: {
  readonly hasPublished: boolean;
  readonly hasReadyProject: boolean;
  readonly pendingInvites: number;
  readonly waitingForPackage: boolean;
}): GmPilotLifecycle {
  if (input.hasPublished) return 'produkce';
  if (input.waitingForPackage) return 'ceka-na-data';
  if (input.pendingInvites > 0 && !input.hasReadyProject) return 'onboarding';
  if (input.hasReadyProject) return 'aktivni';
  return 'onboarding';
}

export function buildGmPilotStatusSummary(): GmPilotStatusSummary {
  const registry = getDefaultCompanyRegistry();
  const invites = listPendingInvites();
  const firms: GmPilotFirmStatus[] = registry.tenants
    .filter((tenant) => tenant.pilot)
    .map((tenant) => {
      const company = findCompany(registry, tenant.companyId);
      const projects = listProjectsForCompany(registry, tenant.companyId);
      const pendingForCompany = invites.filter(
        (invite) => invite.companyId === tenant.companyId,
      ).length;
      const hasPublished = projects.some(
        (project) => project.status === 'published',
      );
      const hasReadyProject = projects.some(
        (project) =>
          project.status === 'ready' || project.status === 'published',
      );
      const waitingForPackage = projects.some(
        (project) =>
          project.packageRoot.trim().length === 0 ||
          project.status === 'draft',
      );
      const lifecycle = deriveLifecycle({
        hasPublished,
        hasReadyProject,
        pendingInvites: pendingForCompany,
        waitingForPackage: waitingForPackage && !hasPublished,
      });
      return {
        tenantId: tenant.id,
        companyId: tenant.companyId,
        companyName: company?.name ?? tenant.name,
        lifecycle,
        lifecycleLabel: LIFECYCLE_LABELS[lifecycle],
        detail: `${projects.length} project(s) · ${pendingForCompany} pending invite(s)`,
      };
    });

  const counts: Record<GmPilotLifecycle, number> = {
    aktivni: 0,
    onboarding: 0,
    'ceka-na-data': 0,
    produkce: 0,
  };
  for (const firm of firms) {
    counts[firm.lifecycle] += 1;
  }

  return { firms, counts };
}
