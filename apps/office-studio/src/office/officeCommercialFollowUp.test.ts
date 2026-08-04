/**
 * PE-09 — Commercial Follow-up activity + status + dashboard + timeline.
 * PT-CJ-00 activates the partner account at prepare (password conis).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
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
import { PILOT_DELIVERY_PASSWORD } from './officeReferencePartner.ts';

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
    preparePilotForPartner('p-dse');
    const delivered = deliverPilot('p-dse');
    assert.equal(delivered.ok, true);
    if (!delivered.ok) return;

    let followUp = buildPartnerCommercialFollowUp('p-dse');
    assert.ok(followUp !== null);
    // PT-CJ-00 — account already activated; waiting for first Studio login.
    assert.equal(followUp?.activity.accountActivated, true);
    assert.equal(followUp?.activity.firstLogin, false);
    assert.equal(followUp?.status, 'ready_for_contact');
    assert.equal(followUp?.activity.inviteOpened, false);
    assert.equal(followUp?.activity.lastVisitedStudio, null);

    markInviteOpened(delivered.delivery.package.invite.token);
    followUp = buildPartnerCommercialFollowUp('p-dse');
    assert.equal(followUp?.activity.inviteOpened, true);

    const loggedIn = login({
      email: delivered.delivery.preview.email,
      password: PILOT_DELIVERY_PASSWORD,
      rememberMe: false,
    });
    assert.equal(loggedIn.ok, true);
    if (!loggedIn.ok) return;

    touchUserLastStudio(loggedIn.session.user.id, 'manager');

    followUp = syncCommercialFollowUpTimeline('p-dse');
    assert.ok(followUp !== null);
    assert.equal(followUp?.activity.ndaAccepted, true);
    assert.equal(followUp?.activity.accountActivated, true);
    assert.equal(followUp?.activity.firstLogin, true);
    assert.equal(followUp?.activity.lastVisitedStudio, 'Manager Studio');
    assert.equal(followUp?.status, 'active');
    assert.equal(followUp?.newlyActivated, true);

    const kinds = listPartnerTimeline('p-dse', 50).map((event) => event.kind);
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
    preparePilotForPartner('p-dse');
    deliverPilot('p-dse');
    const dashboard = buildOfficeFollowUpDashboard();
    // Activated account without first login → ready for contact / follow-up.
    assert.ok(
      dashboard.readyForFollowUp.some((item) => item.partnerId === 'p-dse') ||
        dashboard.newlyActivated.some((item) => item.partnerId === 'p-dse'),
    );
    assert.equal(
      dashboard.waitingActivation.some((item) => item.partnerId === 'p-dse'),
      false,
    );
  });

  it('records ready_for_contact timeline event', () => {
    resetAll();
    preparePilotForPartner('p-dse');
    const delivered = deliverPilot('p-dse');
    assert.equal(delivered.ok, true);
    if (!delivered.ok) return;

    const followUp = syncCommercialFollowUpTimeline('p-dse');
    assert.equal(followUp?.status, 'ready_for_contact');
    const kinds = listPartnerTimeline('p-dse', 50).map((event) => event.kind);
    assert.ok(kinds.includes('followup.ready_for_contact'));
  });
});
