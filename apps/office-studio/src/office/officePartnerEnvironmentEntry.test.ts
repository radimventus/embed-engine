/**
 * OF-12 — CONIS Admin Partner Environment Entry.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearPlatformSession,
  enterOperatorPartnerEnvironment,
  getOperatorPartnerEnvironment,
  loadPlatformSession,
  login,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetOperatorPartnerEnvironmentForTests,
  resetPartnerBrandingStore,
  resetPartnerWelcomeStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
  resolveClientStudioHref,
  resolveCloudStudioHref,
  returnFromOperatorPartnerEnvironment,
  shouldShowPartnerWelcome,
  switchOperatorPartnerStudio,
} from '@embed-engine/platform-access';

import { resetOfficeEventCatalogForTests } from './officeEventCatalog.ts';
import { resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import {
  OFFICE_REFERENCE_PARTNER_ID,
  OFFICE_REFERENCE_PLATFORM_IDS,
} from './officeReferencePartner.ts';
import { resetPartnerRegistryForTests } from './officePartnerRegistry.ts';
import { preparePilotForPartner } from './preparePilotProvisioning.ts';
import { buildOfficePartnerEnvironment } from './officePartnerEnvironment.ts';
import { resetPilotDeliveryStoreForTests } from './officePilotDeliveryRegistry.ts';

describe('OF-12 Partner Environment Entry', () => {
  function resetAll(): void {
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
    resetOperatorPartnerEnvironmentForTests();
    clearPlatformSession();
  }

  it('opens Partner Environment without invite, NDA or Welcome', () => {
    resetAll();

    const loggedIn = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(loggedIn.ok, true);

    const prepared = preparePilotForPartner(OFFICE_REFERENCE_PARTNER_ID);
    assert.ok(prepared !== null);
    const env = buildOfficePartnerEnvironment(OFFICE_REFERENCE_PARTNER_ID);
    assert.equal(env.ready, true);
    assert.equal(env.companyId, OFFICE_REFERENCE_PLATFORM_IDS.companyId);

    const entered = enterOperatorPartnerEnvironment({
      companyId: env.companyId!,
      workspaceId: env.environment!.workspaceId!,
      projectId: env.environment!.projectId!,
      officePartnerId: OFFICE_REFERENCE_PARTNER_ID,
      officeReturnHref: `${resolveCloudStudioHref('office')}partners/${OFFICE_REFERENCE_PARTNER_ID}`,
      initialSurface: 'client',
      navigate: false,
    });
    assert.equal(entered.ok, true);
    if (!entered.ok) return;

    assert.equal(entered.surface, 'client');
    assert.equal(entered.href, resolveClientStudioHref());

    const session = loadPlatformSession();
    assert.ok(session !== null);
    assert.equal(session!.companyId, OFFICE_REFERENCE_PLATFORM_IDS.companyId);
    assert.equal(session!.workspaceId, OFFICE_REFERENCE_PLATFORM_IDS.workspaceId);
    assert.equal(session!.projectId, OFFICE_REFERENCE_PLATFORM_IDS.projectId);
    assert.ok(session!.user.roles.includes('conis-admin'));

    assert.equal(shouldShowPartnerWelcome(session!.user.email), false);

    const operator = getOperatorPartnerEnvironment();
    assert.ok(operator !== null);
    assert.equal(operator!.officePartnerId, OFFICE_REFERENCE_PARTNER_ID);
  });

  it('keeps partner context when switching Manager / Sales and returns to Office', () => {
    resetAll();
    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );
    const before = loadPlatformSession();
    assert.ok(before !== null);

    preparePilotForPartner(OFFICE_REFERENCE_PARTNER_ID);
    const env = buildOfficePartnerEnvironment(OFFICE_REFERENCE_PARTNER_ID);
    enterOperatorPartnerEnvironment({
      companyId: env.companyId!,
      workspaceId: env.environment!.workspaceId!,
      projectId: env.environment!.projectId!,
      officePartnerId: OFFICE_REFERENCE_PARTNER_ID,
      officeReturnHref: `${resolveCloudStudioHref('office')}partners/${OFFICE_REFERENCE_PARTNER_ID}`,
      initialSurface: 'client',
      navigate: false,
    });

    const toManager = switchOperatorPartnerStudio('manager', {
      navigate: false,
    });
    assert.equal(toManager.ok, true);
    assert.equal(loadPlatformSession()?.companyId, env.companyId);
    assert.equal(
      loadPlatformSession()?.workspaceId,
      env.environment?.workspaceId,
    );
    assert.equal(loadPlatformSession()?.projectId, env.environment?.projectId);
    assert.equal(loadPlatformSession()?.activeStudioId, 'manager');

    const toSales = switchOperatorPartnerStudio('sales', { navigate: false });
    assert.equal(toSales.ok, true);
    assert.equal(loadPlatformSession()?.companyId, env.companyId);
    assert.equal(loadPlatformSession()?.activeStudioId, 'sales');

    const returned = returnFromOperatorPartnerEnvironment({ navigate: false });
    assert.equal(returned.ok, true);
    if (!returned.ok) return;
    assert.match(returned.href, /partners\/p-dse/);
    assert.equal(getOperatorPartnerEnvironment(), null);

    const after = loadPlatformSession();
    assert.ok(after !== null);
    assert.equal(after!.activeStudioId, 'office');
    assert.equal(after!.companyId, before!.companyId);
    assert.equal(after!.workspaceId, before!.workspaceId);
  });
});
