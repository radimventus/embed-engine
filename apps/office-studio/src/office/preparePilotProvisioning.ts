/**
 * CS-01 — One-click pilot partner provisioning (Office orchestration).
 * Builder / Office remain CONIS-only; partner invite gets Manager + Sales roles.
 */

import {
  PILOT_PARTNER_ROLES,
  createPilotInvite,
  provisionPilotWorkspace,
  upsertPartnerBranding,
  type PilotInvite,
  type PilotProvisionResult,
  type PartnerBranding,
} from '@embed-engine/platform-access';

import { appendOfficeEvent } from './officeEventCatalog';
import type { OfficePartner } from './officePartnerModel';
import {
  createPartner,
  draftFromPartner,
  getPartner,
  updatePartner,
} from './officePartnerRegistry';
import { activateLicense } from './officeOperationsRegistry';
import { selectSalesPackage } from './officeSalesRegistry';

export type PreparePilotResult = {
  readonly partner: OfficePartner;
  readonly provision: PilotProvisionResult;
  readonly invite: PilotInvite;
  readonly branding: PartnerBranding;
  readonly packageId: 'pilot-1';
};

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Prepare pilot for an existing Office partner — workspace, invite, branding, Pilot package.
 */
export function preparePilotForPartner(
  partnerId: string,
  invitedByUserId = 'user-radim',
): PreparePilotResult | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;

  const email = partner.contact.email.trim().toLowerCase();
  if (email.length === 0) {
    return null;
  }

  const provision = provisionPilotWorkspace({
    companyName: partner.company.legalName || partner.name,
  });

  const branding = upsertPartnerBranding({
    companyId: provision.company.id,
    firmName: partner.company.legalName || partner.name,
  });

  const invite = createPilotInvite({
    email,
    displayName: partner.contact.name || partner.name,
    roles: PILOT_PARTNER_ROLES,
    invitedByUserId,
    tenantId: provision.tenant.id,
    companyId: provision.company.id,
    workspaceId: provision.workspace.id,
    projectId: provision.project.id,
  });

  selectSalesPackage(partnerId, 'pilot-1');
  activateLicense({
    partnerId,
    type: 'pilot',
    activatedAt: nowIso(),
  });

  const draft = draftFromPartner(partner);
  const updated =
    updatePartner(partnerId, {
      ...draft,
      status: 'active',
      nextStep: 'Pilot aktivován — pozvánka odeslána',
    }) ?? partner;

  appendOfficeEvent({
    kind: 'pilot.ready',
    label: 'Pilot připraven',
    detail: `${updated.name} · invite ${invite.token} · ${provision.project.name}`,
    partnerId: updated.id,
  });

  return {
    partner: updated,
    provision,
    invite,
    branding,
    packageId: 'pilot-1',
  };
}

/**
 * Create a new Office partner and prepare the pilot in one step.
 */
export function prepareNewPilotPartner(input: {
  readonly firmName: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly invitedByUserId?: string;
}): PreparePilotResult | null {
  const partner = createPartner({
    name: input.firmName.trim(),
    status: 'lead',
    nextStep: 'Připravit pilot',
    company: {
      legalName: input.firmName.trim(),
      ico: '',
      city: '',
      country: 'Česko',
    },
    contact: {
      name: input.contactName.trim(),
      email: input.contactEmail.trim(),
      phone: '',
      role: 'Jednatel',
    },
  });
  return preparePilotForPartner(
    partner.id,
    input.invitedByUserId ?? 'user-radim',
  );
}
