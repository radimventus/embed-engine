/**
 * OF-12 / OF-13 / OF-13A — CONIS Admin Partner Environment / Workspace Entry.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearPlatformSession,
  enterOperatorPartnerEnvironment,
  getOperatorPartnerEnvironment,
  getSharedWorkspaceContext,
  isOperatorWorkspaceMode,
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
  resolveWorkspaceHostHref,
  returnFromOperatorPartnerEnvironment,
  shouldShowPartnerWelcome,
  switchOperatorPartnerStudio,
  workspaceStudiosForRoles,
  WORKSPACE_STUDIO_SWITCH_ORDER,
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

describe('OF-13A Workspace Studio Navigation', () => {
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

  it('opens Client Studio as default Workspace entry via Workspace Host', () => {
    resetAll();

    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );

    const prepared = preparePilotForPartner(OFFICE_REFERENCE_PARTNER_ID);
    assert.ok(prepared !== null);
    const env = buildOfficePartnerEnvironment(OFFICE_REFERENCE_PARTNER_ID);
    assert.equal(env.ready, true);

    const entered = enterOperatorPartnerEnvironment({
      companyId: env.companyId!,
      workspaceId: env.environment!.workspaceId!,
      projectId: env.environment!.projectId!,
      officePartnerId: OFFICE_REFERENCE_PARTNER_ID,
      officeReturnHref: `${resolveCloudStudioHref('office')}partners/${OFFICE_REFERENCE_PARTNER_ID}`,
      navigate: false,
    });
    assert.equal(entered.ok, true);
    if (!entered.ok) return;

    assert.equal(entered.surface, 'client');
    assert.equal(entered.href, resolveWorkspaceHostHref());
    assert.notEqual(entered.href, resolveClientStudioHref());
    assert.equal(
      loadPlatformSession()?.companyId,
      OFFICE_REFERENCE_PLATFORM_IDS.companyId,
    );
    assert.equal(shouldShowPartnerWelcome(loadPlatformSession()!.user.email), false);
    assert.ok(getOperatorPartnerEnvironment() !== null);
    assert.equal(isOperatorWorkspaceMode(), true);
    assert.equal(getSharedWorkspaceContext()?.activeStudio, 'client');
    assert.equal(getSharedWorkspaceContext()?.partnerId, OFFICE_REFERENCE_PARTNER_ID);
  });

  it('keeps SSOT studio order and Client in role-filtered switcher', () => {
    assert.deepEqual([...WORKSPACE_STUDIO_SWITCH_ORDER], [
      'client',
      'manager',
      'sales',
      'builder',
      'office',
    ]);

    const adminStudios = workspaceStudiosForRoles(['conis-admin']);
    assert.ok(adminStudios.includes('client'));
    assert.deepEqual([...adminStudios], [...WORKSPACE_STUDIO_SWITCH_ORDER]);

    const partnerStudios = workspaceStudiosForRoles(['manager', 'salesman']);
    assert.deepEqual([...partnerStudios], ['client', 'manager', 'sales']);
  });

  it('preserves partner context across studios and returns via Office', () => {
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

    preparePilotForPartner(OFFICE_REFERENCE_PARTNER_ID);
    const env = buildOfficePartnerEnvironment(OFFICE_REFERENCE_PARTNER_ID);
    enterOperatorPartnerEnvironment({
      companyId: env.companyId!,
      workspaceId: env.environment!.workspaceId!,
      projectId: env.environment!.projectId!,
      officePartnerId: OFFICE_REFERENCE_PARTNER_ID,
      officeReturnHref: `${resolveCloudStudioHref('office')}partners/${OFFICE_REFERENCE_PARTNER_ID}`,
      navigate: false,
    });

    const toManager = switchOperatorPartnerStudio('manager', {
      navigate: false,
    });
    assert.equal(toManager.ok, true);
    assert.equal(loadPlatformSession()?.companyId, env.companyId);
    assert.equal(loadPlatformSession()?.workspaceId, env.environment?.workspaceId);
    assert.equal(loadPlatformSession()?.projectId, env.environment?.projectId);

    const toClient = switchOperatorPartnerStudio('client', { navigate: false });
    assert.equal(toClient.ok, true);
    assert.equal(toClient.surface, 'client');
    assert.equal(toClient.href, resolveWorkspaceHostHref());
    assert.equal(loadPlatformSession()?.companyId, env.companyId);

    const toOffice = switchOperatorPartnerStudio('office', {
      navigate: false,
      retainWorkspace: true,
    });
    assert.equal(toOffice.ok, true);
    assert.equal(toOffice.surface, 'office');
    assert.equal(toOffice.href, resolveWorkspaceHostHref());
    assert.ok(getSharedWorkspaceContext() !== null);
    assert.equal(getSharedWorkspaceContext()?.activeStudio, 'office');
    assert.equal(loadPlatformSession()?.companyId, env.companyId);

    const returned = returnFromOperatorPartnerEnvironment({ navigate: false });
    assert.equal(returned.ok, true);
    if (!returned.ok) return;
    assert.match(returned.href, /partners\/p-dse/);
    assert.equal(getOperatorPartnerEnvironment(), null);
    assert.equal(loadPlatformSession()?.companyId, before?.companyId);
    assert.equal(loadPlatformSession()?.activeStudioId, 'office');
  });
});
