/**
 * PE-10 — Partner Environment Provisioning (one-click Připravit pilot).
 */

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

  it('prepares access for an existing canonical Partner Environment', () => {
    resetAll();

    const prepared = preparePilotForPartner('p-dse');
    assert.ok(prepared !== null);
    assert.equal(prepared?.packageId, 'pilot');
    assert.equal(prepared?.partner.status, 'active');
    assert.equal(
      prepared?.partner.nextStep,
      'Pilot připraven — pozvánka k odeslání',
    );
    assert.equal(prepared?.invite.status, 'activated');
    assert.equal(prepared?.invite.sendCount, 0);
    assert.equal(prepared?.invite.lastSentAt, null);
    assert.deepEqual([...prepared!.invite.roles], [...PILOT_PARTNER_ROLES]);
    assert.equal(prepared?.invite.companyId, prepared?.provision.company.id);
    assert.equal(prepared?.invite.projectId, prepared?.provision.project.id);
    assert.match(
      prepared!.provision.houses[0]?.packageRoot ?? '',
      /bungalov-4kk/,
    );
    assert.equal(prepared!.provision.project.name, 'Domy s energií');
    assert.equal(
      prepared!.pilotWorkspace.sampleProjectLabel,
      'Reference House',
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
      'Domy s energií s.r.o.',
    );
    assert.equal(getSalesCase(prepared!.partner.id)?.offer.packageId, 'pilot');
    assert.equal(getLicense(prepared!.partner.id)?.type, 'pilot');
    assert.equal(isPilotPartnerRoles(prepared!.invite.roles), true);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'manager'), true);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'sales'), true);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'builder'), false);
    assert.equal(canAccessStudio(prepared!.invite.roles, 'office'), false);
    assert.deepEqual([...studiosForRoles(prepared!.invite.roles)].sort(), [
      'client',
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
    const prepared = preparePilotForPartner('p-dse');
    assert.ok(prepared !== null);
    assert.equal(prepared?.invite.sendCount, 0);

    const delivered = deliverPilot('p-dse');
    assert.equal(delivered.ok, true);

    const env = buildOfficePartnerEnvironment('p-dse');
    assert.equal(env.inviteReadyToSend, false);
    assert.equal(env.environment?.invite?.sendCount, 1);
    assert.ok(env.environment?.invite?.lastSentAt !== null);
    assert.equal(env.ready, true);
  });

  it('fails when Builder has not prepared a Partner Project and House set', () => {
    resetAll();

    const prepared = prepareNewPilotPartner({
      firmName: 'Builder Prerequisite',
      contactName: 'Anna Pilot',
      contactEmail: 'anna@pilotdomu.cz',
    });

    assert.equal(prepared, null);
  });

  it('maps the Office DSE alias onto its canonical Partner and Project scope', () => {
    resetAll();

    const prepared = preparePilotForPartner('p-dse');

    assert.ok(prepared !== null);
    assert.equal(prepared?.canonicalPartnerId, 'company-domy-s-energii');
    assert.equal(prepared?.provision.company.id, 'company-domy-s-energii');
    assert.equal(prepared?.provision.project.id, 'project-domy-s-energii');
    assert.ok(
      prepared?.provision.houses.some(
        (house) => house.name === 'BUNGALOV 4KK',
      ),
    );
    assert.ok(
      prepared?.provision.houses.some(
        (house) => house.name === 'VÁŠ PRVNÍ DŮM 5KK',
      ),
    );
  });

  it('preserves DSE canonical Project scope after partner login', () => {
    resetAll();

    const prepared = preparePilotForPartner('p-dse');
    assert.ok(prepared !== null);
    const loggedIn = login({
      email: 'partner@domysenergii.cz',
      password: 'conis',
      rememberMe: false,
    });

    assert.equal(loggedIn.ok, true);
    if (!loggedIn.ok) return;
    assert.equal(loggedIn.session.companyId, 'company-domy-s-energii');
    assert.equal(loggedIn.session.projectId, 'project-domy-s-energii');
    assert.notEqual(loggedIn.session.projectId, 'project-ac-modular');
  });

  it('blocks activation without NDA and shows welcome after consent + password', () => {
    resetAll();

    const prepared = preparePilotForPartner('p-dse');
    assert.ok(prepared !== null);
    const partner = getPartner('p-dse');
    assert.equal(partner?.status, 'active');

    // Fresh pending invite for NDA gate coverage (PT-CJ-00 activates the delivery invite).
    const pending = createPilotInvite({
      email: 'nda-check@example.cz',
      displayName: 'NDA Check',
      roles: PILOT_PARTNER_ROLES,
      invitedByUserId: 'user-radim',
      tenantId: prepared!.provision.tenant.id,
      companyId: prepared!.provision.company.id,
      workspaceId: prepared!.provision.workspace.id,
      projectId: prepared!.provision.project.id,
    });

    const denied = activateInvite({
      token: pending.token,
      password: 'pilot-secret',
      ndaAccepted: false,
    });
    assert.equal(denied.ok, false);

    const activated = activateInvite({
      token: pending.token,
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
