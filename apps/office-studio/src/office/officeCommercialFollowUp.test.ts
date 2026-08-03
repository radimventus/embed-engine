/**
 * PE-09 — Commercial Follow-up activity + status + dashboard + timeline.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  activateInvite,
  clearPlatformSession,
  markInviteOpened,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerBrandingStore,
  resetPartnerWelcomeStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
  login,
  touchUserLastStudio,
} from '@embed-engine/platform-access';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import { resetPartnerRegistryForTests } from './officePartnerRegistry.ts';
import { resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import { preparePilotForPartner } from './preparePilotProvisioning.ts';
import {
  deliverPilot,
  resetPilotDeliveryStoreForTests,
} from './officePilotDeliveryRegistry.ts';
import {
  buildOfficeFollowUpDashboard,
} from './officeDashboardData.ts';
import {
  buildPartnerCommercialFollowUp,
  resetCommercialFollowUpStoreForTests,
  resolveCommercialFollowUpStatus,
  syncCommercialFollowUpTimeline,
} from './officeCommercialFollowUpRegistry.ts';
import {
  FOLLOW_UP_ACTIVE_WINDOW_MS,
} from './officeCommercialFollowUpModel.ts';

describe('PE-09 Commercial Follow-up', () => {
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
    resetCommercialFollowUpStoreForTests();
    resetUserRegistry();
    clearPlatformSession();
  }

  it('tracks activity milestones including last visited studio', () => {
    resetAll();
    preparePilotForPartner('p-nord');
    const delivered = deliverPilot('p-nord');
    assert.equal(delivered.ok, true);
    if (!delivered.ok) return;

    let followUp = buildPartnerCommercialFollowUp('p-nord');
    assert.ok(followUp !== null);
    assert.equal(followUp?.status, 'not_taken');
    assert.equal(followUp?.activity.inviteOpened, false);
    assert.equal(followUp?.activity.lastVisitedStudio, null);

    markInviteOpened(delivered.delivery.package.invite.token);
    followUp = buildPartnerCommercialFollowUp('p-nord');
    assert.equal(followUp?.status, 'invite_opened');
    assert.equal(followUp?.activity.inviteOpened, true);

    const activated = activateInvite({
      token: delivered.delivery.package.invite.token,
      password: 'follow-up-secret',
      ndaAccepted: true,
    });
    assert.equal(activated.ok, true);
    if (!activated.ok) return;

    const loggedIn = login({
      email: activated.user.email,
      password: 'follow-up-secret',
      rememberMe: false,
    });
    assert.equal(loggedIn.ok, true);
    if (!loggedIn.ok) return;

    touchUserLastStudio(loggedIn.session.user.id, 'manager');

    followUp = syncCommercialFollowUpTimeline('p-nord');
    assert.ok(followUp !== null);
    assert.equal(followUp?.activity.ndaAccepted, true);
    assert.equal(followUp?.activity.accountActivated, true);
    assert.equal(followUp?.activity.firstLogin, true);
    assert.equal(followUp?.activity.lastVisitedStudio, 'Manager Studio');
    assert.equal(followUp?.status, 'active');
    assert.equal(followUp?.newlyActivated, true);

    const kinds = listPartnerTimeline('p-nord', 50).map((event) => event.kind);
    assert.ok(kinds.includes('followup.invite_opened'));
    assert.ok(kinds.includes('followup.nda_accepted'));
    assert.ok(kinds.includes('followup.account_activated'));
    assert.ok(kinds.includes('followup.first_login'));
  });

  it('escalates to ready_for_contact when activity goes stale', () => {
    resetAll();
    const activity = {
      inviteOpened: true,
      ndaAccepted: true,
      accountActivated: true,
      firstLogin: true,
      lastActivityAt: new Date(
        Date.now() - FOLLOW_UP_ACTIVE_WINDOW_MS - 60_000,
      ).toISOString(),
      lastVisitedStudio: 'Manager Studio',
      inviteOpenedAt: new Date().toISOString(),
      ndaAcceptedAt: new Date().toISOString(),
      activatedAt: new Date(
        Date.now() - FOLLOW_UP_ACTIVE_WINDOW_MS - 60_000,
      ).toISOString(),
      firstLoginAt: new Date().toISOString(),
    };
    assert.equal(
      resolveCommercialFollowUpStatus(activity, new Date().toISOString()),
      'ready_for_contact',
    );
  });

  it('builds PE-09 office dashboard follow-up buckets', () => {
    resetAll();
    preparePilotForPartner('p-nord');
    deliverPilot('p-nord');
    const dashboard = buildOfficeFollowUpDashboard();
    assert.ok(
      dashboard.waitingActivation.some((item) => item.partnerId === 'p-nord'),
    );
    assert.equal(dashboard.newlyActivated.length, 0);
    assert.equal(dashboard.readyForFollowUp.length, 0);
  });

  it('records ready_for_contact timeline event', () => {
    resetAll();
    preparePilotForPartner('p-nord');
    const delivered = deliverPilot('p-nord');
    assert.equal(delivered.ok, true);
    if (!delivered.ok) return;

    const activated = activateInvite({
      token: delivered.delivery.package.invite.token,
      password: 'follow-up-secret',
      ndaAccepted: true,
    });
    assert.equal(activated.ok, true);
    if (!activated.ok) return;

    const staleNow =
      Date.parse(activated.invite.activatedAt ?? new Date().toISOString()) +
      FOLLOW_UP_ACTIVE_WINDOW_MS +
      60_000;

    const followUp = syncCommercialFollowUpTimeline('p-nord', staleNow);
    assert.equal(followUp?.status, 'ready_for_contact');
    const kinds = listPartnerTimeline('p-nord', 50).map((event) => event.kind);
    assert.ok(kinds.includes('followup.ready_for_contact'));
  });
});
