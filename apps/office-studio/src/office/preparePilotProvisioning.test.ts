import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  PILOT_PARTNER_ROLES,
  activateInvite,
  canAccessStudio,
  clearPlatformSession,
  createPilotInvite,
  dismissPartnerWelcome,
  getPartnerBranding,
  isPilotPartnerRoles,
  login,
  logout,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerBrandingStore,
  resetPartnerWelcomeStore,
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

describe('CS-01 Pilot Partner Provisioning', () => {
  it('prepares pilot in one click with invite, branding, package and partner roles', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetOperationsRegistryForTests();
    resetCompanyRegistryExtras();
    resetInviteStore();
    resetPartnerBrandingStore();
    resetPartnerWelcomeStore();
    resetUserRegistry();
    clearPlatformSession();

    const prepared = prepareNewPilotPartner({
      firmName: 'Pilot Domů',
      contactName: 'Anna Pilot',
      contactEmail: 'anna@pilotdomu.cz',
    });
    assert.ok(prepared !== null);
    assert.equal(prepared?.packageId, 'pilot-1');
    assert.equal(prepared?.partner.status, 'active');
    assert.equal(prepared?.invite.status, 'pending');
    assert.deepEqual([...prepared!.invite.roles], [...PILOT_PARTNER_ROLES]);
    assert.equal(prepared?.invite.companyId, prepared?.provision.company.id);
    assert.equal(prepared?.invite.projectId, prepared?.provision.project.id);
    assert.match(prepared!.provision.project.packageRoot, /house-package/);
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
  });

  it('blocks activation without NDA and shows welcome after consent + password', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetOperationsRegistryForTests();
    resetCompanyRegistryExtras();
    resetInviteStore();
    resetPartnerBrandingStore();
    resetPartnerWelcomeStore();
    resetUserRegistry();
    clearPlatformSession();

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
  });
});
