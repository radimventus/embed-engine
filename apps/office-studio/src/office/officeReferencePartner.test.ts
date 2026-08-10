/**
 * OF-11 — Reference Partner Consolidation.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearPlatformSession,
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

  it('does not create a Project or House when preparing a new Office partner', () => {
    resetAll();

    const prepared = prepareNewPilotPartner({
      firmName: 'Nový Partner Domů',
      contactName: 'Eva Nová',
      contactEmail: 'eva@novypartner.cz',
    });
    assert.equal(prepared, null);
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
    assert.equal(prepared!.provision.project.name, OFFICE_REFERENCE_PARTNER_NAME);
  });
});
