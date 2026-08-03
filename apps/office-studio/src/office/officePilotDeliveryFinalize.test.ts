/**
 * PE-07 — Finalize Pilot Delivery package surface.
 * Deep-link, invitation state and activation state are part of the delivery package.
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
  resolvePartnerInviteHref,
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

  it('exposes partner workspace deep-link with invite token', () => {
    resetAll();
    preparePilotForPartner('p-nord');
    const preview = buildPilotDeliveryPreview('p-nord');
    assert.ok(preview !== null);
    assert.ok(preview!.invite !== null);
    assert.equal(
      preview!.workspaceHref,
      resolvePartnerInviteHref(preview!.invite!.token),
    );
    assert.match(preview!.workspaceHref, /[?&]invite=/);
  });

  it('exposes invitation and activation state on the delivery package', () => {
    resetAll();
    preparePilotForPartner('p-nord');
    const result = deliverPilot('p-nord');
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.delivery.package.invite.status, 'pending');
    assert.equal(
      result.delivery.package.activationStatus,
      'awaiting_activation',
    );
    assert.equal(
      activationStatusLabel(result.delivery.package.activationStatus),
      'Čeká na aktivaci',
    );
    assert.equal(result.delivery.package.pdf.ready, true);
    assert.match(result.delivery.package.workspaceHref, /invite=/);
  });
});
