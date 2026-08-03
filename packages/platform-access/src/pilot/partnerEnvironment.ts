/**
 * PE-10 — Partner Environment projection (complete pilot surface checklist).
 * Aggregates provision + branding + pilot workspace + invite readiness.
 * No Runtime / capabilities — Office orchestration view model.
 */

import type { PartnerBranding } from '../domain/partnerBranding';
import type { PilotInvite } from '../domain/pilotTypes';
import {
  CONIS_SAMPLE_PROJECT_LABEL,
  type PartnerPilotStudioId,
  type PilotWorkspace,
} from '../domain/pilotWorkspace';
import { getPartnerBranding } from './partnerBrandingStore';
import { listInvites } from './inviteStore';
import {
  getPilotWorkspace,
  isPilotWorkspaceReady,
} from './pilotWorkspaceStore';

export type PartnerEnvironmentChecklist = {
  readonly partnerEnvironment: boolean;
  readonly branding: boolean;
  readonly pilotProject: boolean;
  readonly clientStudio: boolean;
  readonly managerStudio: boolean;
  readonly salesStudio: boolean;
  readonly inviteReadyToSend: boolean;
};

export type PartnerEnvironment = {
  readonly companyId: string;
  readonly workspaceId: string | null;
  readonly projectId: string | null;
  readonly projectLabel: string | null;
  readonly branding: PartnerBranding | null;
  readonly pilotWorkspace: PilotWorkspace | null;
  readonly invite: PilotInvite | null;
  readonly studios: Readonly<Record<PartnerPilotStudioId, boolean>>;
  readonly checklist: PartnerEnvironmentChecklist;
  readonly ready: boolean;
};

function findInviteForCompany(companyId: string): PilotInvite | null {
  const invites = listInvites().filter((item) => item.companyId === companyId);
  if (invites.length === 0) return null;
  return (
    invites.find((item) => item.status === 'pending') ??
    invites.find((item) => item.status === 'activated') ??
    invites[0] ??
    null
  );
}

function isInviteReadyToSend(invite: PilotInvite | null): boolean {
  if (invite === null) return false;
  if (invite.status !== 'pending') return false;
  return invite.sendCount === 0 && invite.lastSentAt === null;
}

/**
 * Build Partner Environment checklist for a provisioned company.
 */
export function buildPartnerEnvironment(
  companyId: string,
): PartnerEnvironment | null {
  const trimmed = companyId.trim();
  if (trimmed.length === 0) return null;

  const pilotWorkspace = getPilotWorkspace(trimmed);
  const branding = getPartnerBranding(trimmed);
  const invite = findInviteForCompany(trimmed);
  const environmentReady = isPilotWorkspaceReady(trimmed);

  const studios = {
    client: pilotWorkspace?.studios.client.ready === true,
    manager: pilotWorkspace?.studios.manager.ready === true,
    sales: pilotWorkspace?.studios.sales.ready === true,
  } as const;

  const checklist: PartnerEnvironmentChecklist = {
    partnerEnvironment: environmentReady,
    branding: branding !== null,
    pilotProject:
      pilotWorkspace !== null &&
      pilotWorkspace.sampleProjectLabel === CONIS_SAMPLE_PROJECT_LABEL,
    clientStudio: studios.client,
    managerStudio: studios.manager,
    salesStudio: studios.sales,
    inviteReadyToSend: isInviteReadyToSend(invite),
  };

  const inviteReadyOrSent =
    checklist.inviteReadyToSend ||
    (invite !== null && invite.sendCount > 0);

  const ready =
    checklist.partnerEnvironment &&
    checklist.branding &&
    checklist.pilotProject &&
    checklist.clientStudio &&
    checklist.managerStudio &&
    checklist.salesStudio &&
    inviteReadyOrSent;

  return {
    companyId: trimmed,
    workspaceId: pilotWorkspace?.workspaceId ?? null,
    projectId: pilotWorkspace?.projectId ?? null,
    projectLabel: pilotWorkspace?.sampleProjectLabel ?? null,
    branding,
    pilotWorkspace,
    invite,
    studios,
    checklist,
    ready,
  };
}

export function isPartnerEnvironmentReady(companyId: string): boolean {
  return buildPartnerEnvironment(companyId)?.ready === true;
}
