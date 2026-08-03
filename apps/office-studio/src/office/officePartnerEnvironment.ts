/**
 * PE-10 — Office view of Partner Environment checklist.
 */

import {
  buildPartnerEnvironment,
  listInvites,
  type PartnerEnvironment,
  type PartnerEnvironmentChecklist,
} from '@embed-engine/platform-access';

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
};

const CHECKLIST_LABELS: Readonly<
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
  const items = CHECKLIST_ORDER.map((id) => ({
    id,
    label: CHECKLIST_LABELS[id],
    ready: checklist?.[id] === true,
  }));

  return {
    partnerId,
    companyId,
    environment,
    items,
    ready: environment?.ready === true,
    inviteToken: environment?.invite?.token ?? null,
    inviteReadyToSend: checklist?.inviteReadyToSend === true,
  };
}
