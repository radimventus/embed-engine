/**
 * OF-11 — Reference Partner Consolidation.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONIS_SAMPLE_PROJECT_LABEL,
  clearPlatformSession,
  getPartnerBranding,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerBrandingStore,
  resetPartnerWelcomeStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
} from '@embed-engine/platform-access';

import { resetOfficeEventCatalogForTests } from './officeEventCatalog.ts';
import { resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import { resetPartnerRegistryForTests, listPartners } from './officePartnerRegistry.ts';
import { resetPilotDeliveryStoreForTests } from './officePilotDeliveryRegistry.ts';
import {
  prepareNewPilotPartner,
  preparePilotForPartner,
} from './preparePilotProvisioning.ts';
import {
  LEGACY_OFFICE_DEMO_PARTNERS,
  OFFICE_REFERENCE_PARTNER_ID,
  OFFICE_REFERENCE_PARTNER_NAME,
  OFFICE_REFERENCE_PLATFORM_IDS,
  OFFICE_REFERENCE_PROJECT_LABEL,
  brandingLabelsForPartner,
} from './officeReferencePartner.ts';
import { getHandoff, resetHandoffRegistryForTests } from './officeHandoffRegistry.ts';
import { getSalesCase, resetSalesRegistryForTests } from './officeSalesRegistry.ts';
import { resetDocumentRegistryForTests } from './officeDocumentRegistry.ts';

describe('OF-11 Reference Partner Consolidation', () => {
  function resetAll(): void {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetDocumentRegistryForTests();
    resetHandoffRegistryForTests();
    resetOperationsRegistryForTests();
    resetCompanyRegistryExtras();
    resetInviteStore();
    resetPartnerBrandingStore();
    resetPartnerWelcomeStore();
    resetPilotWorkspaceStore();
    resetPilotDeliveryStoreForTests();
    resetUserRegistry();
    clearPlatformSession();
  }

  it('seeds a single canonical reference partner', () => {
    resetAll();
    const partners = listPartners();
    assert.equal(partners.length, 1);
    assert.equal(partners[0]?.id, OFFICE_REFERENCE_PARTNER_ID);
    assert.equal(partners[0]?.name, OFFICE_REFERENCE_PARTNER_NAME);
    assert.ok(
      LEGACY_OFFICE_DEMO_PARTNERS.every(
        (legacy) => !partners.some((partner) => partner.id === legacy.id),
      ),
    );

    const handoff = getHandoff(OFFICE_REFERENCE_PARTNER_ID);
    assert.equal(handoff?.workspace?.id, OFFICE_REFERENCE_PLATFORM_IDS.workspaceId);
    assert.equal(
      handoff?.workspace?.project.id,
      OFFICE_REFERENCE_PLATFORM_IDS.projectId,
    );
    assert.equal(
      handoff?.workspace?.project.name,
      OFFICE_REFERENCE_PROJECT_LABEL,
    );
    assert.equal(
      handoff?.workspace?.project.object.id,
      OFFICE_REFERENCE_PLATFORM_IDS.objectId,
    );
    assert.equal(getSalesCase(OFFICE_REFERENCE_PARTNER_ID)?.offer.packageId, 'pilot');
  });

  it('Připravit pilot clones Reference House template and customizes branding', () => {
    resetAll();

    const prepared = prepareNewPilotPartner({
      firmName: 'Nový Partner Domů',
      contactName: 'Eva Nová',
      contactEmail: 'eva@novypartner.cz',
    });
    assert.ok(prepared !== null);
    assert.equal(prepared!.provision.project.name, CONIS_SAMPLE_PROJECT_LABEL);
    assert.equal(prepared!.provision.project.name, OFFICE_REFERENCE_PROJECT_LABEL);
    assert.equal(prepared!.pilotWorkspace.studios.client.ready, true);
    assert.equal(prepared!.pilotWorkspace.studios.manager.ready, true);
    assert.equal(prepared!.pilotWorkspace.studios.sales.ready, true);

    assert.equal(prepared!.invite.companyId, prepared!.provision.company.id);
    assert.equal(prepared!.invite.workspaceId, prepared!.provision.workspace.id);
    assert.equal(prepared!.invite.projectId, prepared!.provision.project.id);

    const expected = brandingLabelsForPartner('Nový Partner Domů');
    assert.equal(prepared!.branding.firmName, 'Nový Partner Domů');
    assert.equal(prepared!.branding.logoLabel, expected.logoLabel);
    assert.equal(prepared!.branding.heroLabel, expected.heroLabel);
    assert.equal(
      getPartnerBranding(prepared!.provision.company.id)?.heroLabel,
      expected.heroLabel,
    );
  });

  it('reference partner prepares onto aligned platform IDs', () => {
    resetAll();
    const prepared = preparePilotForPartner(OFFICE_REFERENCE_PARTNER_ID);
    assert.ok(prepared !== null);
    assert.equal(
      prepared!.provision.company.id,
      OFFICE_REFERENCE_PLATFORM_IDS.companyId,
    );
    assert.equal(
      prepared!.provision.workspace.id,
      OFFICE_REFERENCE_PLATFORM_IDS.workspaceId,
    );
    assert.equal(
      prepared!.provision.project.id,
      OFFICE_REFERENCE_PLATFORM_IDS.projectId,
    );
    assert.equal(prepared!.provision.project.name, OFFICE_REFERENCE_PROJECT_LABEL);
  });
});
