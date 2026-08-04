/**
 * PE-07 — Finalize Pilot Delivery package surface.
 * Studio login, invitation state and activation state are part of the delivery package.
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
  resolveCloudLandingHref,
} from '@embed-engine/platform-access';

import { resetOfficeEventCatalogForTests } from './officeEventCatalog.ts';
import { resetPartnerRegistryForTests } from './officePartnerRegistry.ts';
import { resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import { preparePilotForPartner } from './preparePilotProvisioning.ts';
import {
  activationStatusLabel,
} from './officePilotDeliveryModel.ts';
import {
  buildPilotDeliveryPreview,
  deliverPilot,
  resetPilotDeliveryStoreForTests,
} from './officePilotDeliveryRegistry.ts';

describe('PE-07 Pilot Delivery finalize', () => {
  function resetAll() {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
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

  it('exposes CONIS Studio login entry (not invite deep-link)', () => {
    resetAll();
    preparePilotForPartner('p-dse');
    const preview = buildPilotDeliveryPreview('p-dse');
    assert.ok(preview !== null);
    assert.ok(preview!.invite !== null);
    assert.equal(preview!.workspaceHref, resolveCloudLandingHref());
    assert.equal(preview!.studioLoginHref, resolveCloudLandingHref());
    assert.doesNotMatch(preview!.workspaceHref, /invite=/);
  });

  it('exposes invitation and activation state on the delivery package', () => {
    resetAll();
    preparePilotForPartner('p-dse');
    const result = deliverPilot('p-dse');
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.delivery.package.invite.status, 'activated');
    assert.equal(result.delivery.package.activationStatus, 'activated');
    assert.equal(
      activationStatusLabel(result.delivery.package.activationStatus),
      'Účet aktivován',
    );
    assert.equal(result.delivery.package.pdf.ready, true);
    assert.equal(
      result.delivery.package.workspaceHref,
      resolveCloudLandingHref(),
    );
  });
});
