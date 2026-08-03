/**
 * PE-10 / PE-11 — Office view of Partner Environment + lifecycle / workspace summary.
 */

import {
  buildPartnerEnvironment,
  listInvites,
  type PartnerEnvironment,
  type PartnerEnvironmentChecklist,
} from '@embed-engine/platform-access';

import {
  buildPartnerWorkspaceSummary,
  getPartnerEnvironmentRecord,
  partnerEnvironmentStatusLabel,
  partnerLifecycleStatusLabel,
  type PartnerEnvironmentLifecycleStatus,
  type PartnerEnvironmentRecord,
  type PartnerLifecycleStatus,
  type PartnerStudioAccess,
  type PartnerWorkspaceSummary,
} from './officePartnerEnvironmentLifecycle';
import { getPartner } from './officePartnerRegistry';

export type OfficePartnerEnvironmentItem = {
  readonly id: keyof PartnerEnvironmentChecklist;
  readonly label: string;
  readonly ready: boolean;
};

export type OfficePartnerEnvironmentView = {
  readonly partnerId: string;
  readonly companyId: string | null;
  readonly environment: PartnerEnvironment | null;
  readonly items: readonly OfficePartnerEnvironmentItem[];
  readonly ready: boolean;
  readonly inviteToken: string | null;
  readonly inviteReadyToSend: boolean;
  readonly lifecycle: PartnerEnvironmentRecord;
  readonly workspaceSummary: PartnerWorkspaceSummary | null;
  readonly permanentWorkspace: boolean;
  readonly pilotMode: boolean;
  readonly environmentStatus: PartnerEnvironmentLifecycleStatus;
  readonly environmentStatusLabel: string;
  readonly lifecycleStatus: PartnerLifecycleStatus | null;
  readonly lifecycleStatusLabel: string;
  readonly studioAccess: PartnerStudioAccess;
  readonly statusChangedAt: string | null;
  readonly statusChangeReason: string | null;
  readonly lastAdminActionLabel: string;
};

const CHECKLIST_LABELS_PILOT: Readonly<
  Record<keyof PartnerEnvironmentChecklist, string>
> = Object.freeze({
  partnerEnvironment: 'Partner Environment',
  branding: 'Branding partnera',
  pilotProject: 'Pilot Project',
  clientStudio: 'Client Studio',
  managerStudio: 'Manager Studio',
  salesStudio: 'Sales Studio',
  inviteReadyToSend: 'Pozvánka připravená k odeslání',
});

const CHECKLIST_LABELS_ACTIVE: Readonly<
  Record<keyof PartnerEnvironmentChecklist, string>
> = Object.freeze({
  partnerEnvironment: 'Partner Environment',
  branding: 'Studio Branding',
  pilotProject: 'Projekty',
  clientStudio: 'Client Studio',
  managerStudio: 'Manager Studio',
  salesStudio: 'Sales Studio',
  inviteReadyToSend: 'Přístup partnera',
});

const CHECKLIST_ORDER: readonly (keyof PartnerEnvironmentChecklist)[] =
  Object.freeze([
    'partnerEnvironment',
    'branding',
    'pilotProject',
    'clientStudio',
    'managerStudio',
    'salesStudio',
    'inviteReadyToSend',
  ]);

function resolveCompanyIdForPartner(partnerId: string): string | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const email = partner.contact.email.trim().toLowerCase();
  if (email.length === 0) return null;
  const invite = listInvites().find((item) => item.email === email) ?? null;
  return invite?.companyId ?? null;
}

export function buildOfficePartnerEnvironment(
  partnerId: string,
): OfficePartnerEnvironmentView {
  const companyId = resolveCompanyIdForPartner(partnerId);
  const environment =
    companyId !== null ? buildPartnerEnvironment(companyId) : null;
  const checklist = environment?.checklist;
  const lifecycle = getPartnerEnvironmentRecord(partnerId);
  const labels = lifecycle.pilotMode
    ? CHECKLIST_LABELS_PILOT
    : CHECKLIST_LABELS_ACTIVE;
  const items = CHECKLIST_ORDER.map((id) => ({
    id,
    label: labels[id],
    ready: checklist?.[id] === true,
  }));
  const summary = buildPartnerWorkspaceSummary(partnerId);

  return {
    partnerId,
    companyId,
    environment,
    items,
    ready: environment?.ready === true,
    inviteToken: environment?.invite?.token ?? null,
    inviteReadyToSend: checklist?.inviteReadyToSend === true,
    lifecycle,
    workspaceSummary: summary,
    permanentWorkspace: lifecycle.permanentWorkspace,
    pilotMode: lifecycle.pilotMode,
    environmentStatus: lifecycle.status,
    environmentStatusLabel: partnerEnvironmentStatusLabel(lifecycle.status),
    lifecycleStatus: lifecycle.lifecycleStatus,
    lifecycleStatusLabel: partnerLifecycleStatusLabel(lifecycle.lifecycleStatus),
    studioAccess: lifecycle.studioAccess,
    statusChangedAt: lifecycle.statusChangedAt,
    statusChangeReason: lifecycle.statusChangeReason,
    lastAdminActionLabel: summary?.lastAdminActionLabel ?? '—',
  };
}
