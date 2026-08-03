/**
 * PE-07 — Pilot Delivery one-click package + timeline.
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

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import { resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import { preparePilotForPartner } from './preparePilotProvisioning.ts';
import {
  buildPilotDeliveryPreview,
  deliverPilot,
  getPilotDelivery,
  resetPilotDeliveryStoreForTests,
} from './officePilotDeliveryRegistry.ts';

describe('PE-07 Pilot Delivery', () => {
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

  it('builds delivery preview with PDF, invite info, activation and workspace link', () => {
    resetAll();
    const prepared = preparePilotForPartner('p-dse');
    assert.ok(prepared !== null);

    const preview = buildPilotDeliveryPreview('p-dse');
    assert.ok(preview !== null);
    assert.equal(preview?.partnerName, getPartner('p-dse')?.name);
    assert.ok((preview?.email.length ?? 0) > 0);
    assert.equal(preview?.pdf.attached, true);
    assert.equal(preview?.pdf.ready, true);
    assert.match(preview!.pdf.name, /\.pdf$/i);
    assert.ok(preview!.invite !== null);
    assert.equal(preview!.invite?.status, 'pending');
    assert.equal(preview!.activationStatus, 'awaiting_activation');
    assert.ok(Date.parse(preview!.invite!.expiresAt) > Date.now());
    assert.equal(
      preview!.workspaceHref,
      resolvePartnerInviteHref(preview!.invite!.token),
    );
    assert.match(preview!.workspaceHref, /[?&]invite=/);
    assert.deepEqual([...preview!.accessibleStudios], [
      'client',
      'manager',
      'sales',
    ]);
  });

  it('delivers pilot in one action and writes PilotPrepared + PilotDelivered', () => {
    resetAll();
    preparePilotForPartner('p-dse');

    const result = deliverPilot('p-dse');
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.delivery.package.pdf.ready, true);
    assert.match(result.delivery.package.workspaceHref, /invite=/);
    assert.equal(
      result.delivery.package.activationStatus,
      'awaiting_activation',
    );
    assert.equal(result.delivery.package.invite.status, 'pending');
    assert.equal(getPilotDelivery('p-dse')?.id, result.delivery.id);

    const kinds = listPartnerTimeline('p-dse', 50).map((event) => event.kind);
    assert.ok(kinds.includes('pilot.prepared'));
    assert.ok(kinds.includes('pilot.delivered'));

    const labels = listPartnerTimeline('p-dse', 50).map((event) => event.label);
    assert.ok(labels.includes('PilotPrepared'));
    assert.ok(labels.includes('PilotDelivered'));

    assert.match(getPartner('p-dse')?.nextStep ?? '', /Pilot odeslán/i);
  });
});
