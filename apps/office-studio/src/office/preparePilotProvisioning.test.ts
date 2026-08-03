/**
 * PE-10 — Partner Environment Provisioning (one-click Připravit pilot).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONIS_SAMPLE_PROJECT_LABEL,
  PILOT_PARTNER_ROLES,
  activateInvite,
  canAccessStudio,
  clearPlatformSession,
  createPilotInvite,
  dismissPartnerWelcome,
  getPartnerBranding,
  isPartnerEnvironmentReady,
  isPilotWorkspaceReady,
  isPilotPartnerRoles,
  login,
  logout,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerBrandingStore,
  resetPartnerWelcomeStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
  shouldShowPartnerWelcome,
  studiosForRoles,
} from '@embed-engine/platform-access';

import {
  prepareNewPilotPartner,
  preparePilotForPartner,
} from './preparePilotProvisioning.ts';
import {
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import { resetOfficeEventCatalogForTests } from './officeEventCatalog.ts';
import { getLicense, resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import { getSalesCase } from './officeSalesRegistry.ts';
import { buildOfficePartnerEnvironment } from './officePartnerEnvironment.ts';
import {
  deliverPilot,
  resetPilotDeliveryStoreForTests,
} from './officePilotDeliveryRegistry.ts';

describe('CS-01 / PE-03 / PE-10 Partner Environment Provisioning', () => {
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

  it('prepares complete Partner Environment in one click', () => {
    resetAll();

    const prepared = prepareNewPilotPartner({
      firmName: 'Pilot Domů',
      contactName: 'Anna Pilot',
      contactEmail: 'anna@pilotdomu.cz',
    });
    assert.ok(prepared !== null);
    assert.equal(prepared?.packageId, 'pilot-1');
    assert.equal(prepared?.partner.status, 'active');
    assert.equal(
      prepared?.partner.nextStep,
      'Pilot připraven — pozvánka k odeslání',
    );
    assert.equal(prepared?.invite.status, 'pending');
    assert.equal(prepared?.invite.sendCount, 0);
    assert.equal(prepared?.invite.lastSentAt, null);
    assert.deepEqual([...prepared!.invite.roles], [...PILOT_PARTNER_ROLES]);
    assert.equal(prepared?.invite.companyId, prepared?.provision.company.id);
    assert.equal(prepared?.invite.projectId, prepared?.provision.project.id);
    assert.match(prepared!.provision.project.packageRoot, /house-package/);
    assert.equal(prepared!.provision.project.name, CONIS_SAMPLE_PROJECT_LABEL);
    assert.equal(
      prepared!.pilotWorkspace.sampleProjectLabel,
      CONIS_SAMPLE_PROJECT_LABEL,
    );
    assert.equal(prepared!.pilotWorkspace.studios.client.ready, true);
    assert.equal(prepared!.pilotWorkspace.studios.manager.ready, true);
    assert.equal(prepared!.pilotWorkspace.studios.sales.ready, true);
    assert.equal(isPilotWorkspaceReady(prepared!.provision.company.id), true);
    assert.equal(isPartnerEnvironmentReady(prepared!.provision.company.id), true);
    assert.equal(prepared!.environment.ready, true);
    assert.equal(prepared!.environment.checklist.inviteReadyToSend, true);
    assert.equal(prepared!.environment.checklist.branding, true);
    assert.equal(prepared!.environment.checklist.pilotProject, true);
    assert.equal(
      getPartnerBranding(prepared!.provision.company.id)?.firmName,
      'Pilot Domů',
    );
    assert.equal(getSalesCase(prepared!.partner.id)?.offer.packageId, 'pilot-1');
    assert.equal(getLicense(prepared!.partner.id)?.type, 'pilot');
    assert.equal(isPilotPartnerRoles(prepared!.invite.roles), true);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'manager'), true);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'sales'), true);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'builder'), false);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'office'), false);
    assert.deepEqual([...studiosForRoles(prepared!.invite.roles)].sort(), [
      'manager',
      'sales',
    ]);

    const officeView = buildOfficePartnerEnvironment(prepared!.partner.id);
    assert.equal(officeView.ready, true);
    assert.equal(officeView.inviteReadyToSend, true);
    assert.ok(officeView.items.every((item) => item.ready));
  });

  it('keeps invite ready until pilot delivery stamps send', () => {
    resetAll();
    const prepared = preparePilotForPartner('p-nord');
    assert.ok(prepared !== null);
    assert.equal(prepared?.invite.sendCount, 0);

    const delivered = deliverPilot('p-nord');
    assert.equal(delivered.ok, true);

    const env = buildOfficePartnerEnvironment('p-nord');
    assert.equal(env.inviteReadyToSend, false);
    assert.equal(env.environment?.invite?.sendCount, 1);
    assert.ok(env.environment?.invite?.lastSentAt !== null);
    assert.equal(env.ready, true);
  });

  it('blocks activation without NDA and shows welcome after consent + password', () => {
    resetAll();

    const prepared = preparePilotForPartner('p-nord');
    assert.ok(prepared !== null);
    const partner = getPartner('p-nord');
    assert.equal(partner?.status, 'active');

    const denied = activateInvite({
      token: prepared!.invite.token,
      password: 'pilot-secret',
      ndaAccepted: false,
    });
    assert.equal(denied.ok, false);

    const activated = activateInvite({
      token: prepared!.invite.token,
      password: 'pilot-secret',
      ndaAccepted: true,
    });
    assert.equal(activated.ok, true);
    if (!activated.ok) return;
    assert.ok(activated.invite.ndaAcceptedAt !== null);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), true);

    const loggedIn = login({
      email: activated.user.email,
      password: 'pilot-secret',
      rememberMe: false,
    });
    assert.equal(loggedIn.ok, true);
    if (!loggedIn.ok) return;
    assert.equal(loggedIn.session.companyId, prepared!.provision.company.id);
    assert.equal(loggedIn.session.projectId, prepared!.provision.project.id);
    assert.equal(canAccessStudio(loggedIn.session.user.roles, 'office'), false);
    assert.equal(canAccessStudio(loggedIn.session.user.roles, 'builder'), false);

    dismissPartnerWelcome(activated.user.email);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), false);
    logout();
  });

  it('creates invite for existing partner without contact email failure path', () => {
    resetPartnerRegistryForTests();
    resetInviteStore();
    const invite = createPilotInvite({
      email: 'x@y.cz',
      displayName: 'X',
      roles: PILOT_PARTNER_ROLES,
      invitedByUserId: 'user-radim',
    });
    assert.equal(invite.status, 'pending');
    assert.equal(invite.sendCount, 0);
  });
});
