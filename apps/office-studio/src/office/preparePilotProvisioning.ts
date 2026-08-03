/**
 * CS-01 / PE-03 / PE-10 — One-click Partner Environment provisioning.
 * Creates Partner Environment, branding, Pilot Project, Client/Manager/Sales,
 * and an invitation ready to send (not delivered).
 * Builder / Office remain CONIS-only; partner invite gets Manager + Sales roles.
 */

import {
  PILOT_PARTNER_ROLES,
  buildPartnerEnvironment,
  createPilotInvite,
  getPilotWorkspace,
  provisionPilotWorkspace,
  upsertPartnerBranding,
  type PartnerEnvironment,
  type PilotInvite,
  type PilotProvisionResult,
  type PilotWorkspace,
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
import { getSalesCase, selectSalesPackage } from './officeSalesRegistry';
import type { OfficePackageId } from './officeSalesModel';

export type PreparePilotResult = {
  readonly partner: OfficePartner;
  readonly provision: PilotProvisionResult;
  readonly pilotWorkspace: PilotWorkspace;
  readonly invite: PilotInvite;
  readonly branding: PartnerBranding;
  readonly environment: PartnerEnvironment;
  readonly packageId: OfficePackageId;
};

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Prepare pilot for an existing Office partner — complete Partner Environment.
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
  // PE-03 / PE-10 — provision initializes Partner Environment studios + sample.
  const pilotWorkspace = getPilotWorkspace(provision.company.id);
  if (pilotWorkspace === null) {
    return null;
  }

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

  const existingPackage =
    getSalesCase(partnerId)?.offer.packageId ?? 'pilot';
  selectSalesPackage(partnerId, existingPackage);
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
      nextStep: 'Pilot připraven — pozvánka k odeslání',
    }) ?? partner;

  const environment = buildPartnerEnvironment(provision.company.id);
  if (environment === null) {
    return null;
  }

  appendOfficeEvent({
    kind: 'pilot.ready',
    label: 'Partner Environment připraven',
    detail: `${updated.name} · ${pilotWorkspace.sampleProjectLabel} · Client/Manager/Sales · invite ${invite.token}`,
    partnerId: updated.id,
  });

  return {
    partner: updated,
    provision,
    pilotWorkspace,
    invite,
    branding,
    environment,
    packageId: existingPackage,
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
