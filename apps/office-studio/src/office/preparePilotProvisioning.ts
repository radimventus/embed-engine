/**
 * CS-01 / PE-03 / PE-10 / OF-11 — One-click Partner Environment provisioning.
 * Clones the Office reference template (Reference House + Client/Manager/Sales),
 * then applies partner-specific firm name, logo and hero branding.
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
import {
  OFFICE_REFERENCE_PARTNER_ID,
  OFFICE_REFERENCE_PARTNER_NAME,
  OFFICE_REFERENCE_PROJECT_LABEL,
  brandingLabelsForPartner,
} from './officeReferencePartner';

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
 * Prepare pilot for an existing Office partner — copy of the reference template.
 * Provisions shared Workspace / Project (Reference House) / Client+Manager+Sales,
 * then customizes firm name, logo and hero only.
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

  const firmName = partner.company.legalName || partner.name;
  // Reference partner keeps stable platform IDs (company-domy-s-energi…).
  const provisionName =
    partnerId === OFFICE_REFERENCE_PARTNER_ID
      ? OFFICE_REFERENCE_PARTNER_NAME
      : firmName;
  const provision = provisionPilotWorkspace({
    companyName: provisionName,
  });
  // Template clone — Reference House + Client / Manager / Sales studios.
  const pilotWorkspace = getPilotWorkspace(provision.company.id);
  if (pilotWorkspace === null) {
    return null;
  }

  const brandLabels = brandingLabelsForPartner(firmName);
  const branding = upsertPartnerBranding({
    companyId: provision.company.id,
    firmName,
    logoLabel: brandLabels.logoLabel,
    heroLabel: brandLabels.heroLabel,
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
    detail: `${updated.name} · ${OFFICE_REFERENCE_PROJECT_LABEL} · Client/Manager/Sales · invite ${invite.token}`,
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
 * Create a new Office partner from the reference template and prepare the pilot.
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
