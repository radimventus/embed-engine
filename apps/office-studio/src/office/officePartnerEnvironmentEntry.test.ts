/**
 * OF-12 / OF-13 — CONIS Admin Partner Environment / Workspace Entry.
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
  resolveCloudStudioHref,
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

describe('OF-13 Workspace Studio Navigation', () => {
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

  it('opens Workspace (Manager) directly without Landing / Invite / Welcome', () => {
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
      initialSurface: 'manager',
      navigate: false,
    });
    assert.equal(entered.ok, true);
    if (!entered.ok) return;

    assert.equal(entered.surface, 'manager');
    assert.equal(entered.href, resolveCloudStudioHref('manager'));
    assert.equal(loadPlatformSession()?.activeStudioId, 'manager');
    assert.equal(
      loadPlatformSession()?.companyId,
      OFFICE_REFERENCE_PLATFORM_IDS.companyId,
    );
    assert.equal(shouldShowPartnerWelcome(loadPlatformSession()!.user.email), false);
    assert.ok(getOperatorPartnerEnvironment() !== null);
  });

  it('filters Workspace switcher by Role Engine and preserves partner context', () => {
    resetAll();
    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );

    const adminStudios = workspaceStudiosForRoles(['conis-admin']);
    assert.deepEqual([...adminStudios], [...WORKSPACE_STUDIO_SWITCH_ORDER]);

    const partnerStudios = workspaceStudiosForRoles(['manager', 'salesman']);
    assert.deepEqual([...partnerStudios], ['client', 'manager', 'sales']);

    preparePilotForPartner(OFFICE_REFERENCE_PARTNER_ID);
    const env = buildOfficePartnerEnvironment(OFFICE_REFERENCE_PARTNER_ID);
    enterOperatorPartnerEnvironment({
      companyId: env.companyId!,
      workspaceId: env.environment!.workspaceId!,
      projectId: env.environment!.projectId!,
      officePartnerId: OFFICE_REFERENCE_PARTNER_ID,
      officeReturnHref: `${resolveCloudStudioHref('office')}partners/${OFFICE_REFERENCE_PARTNER_ID}`,
      initialSurface: 'manager',
      navigate: false,
    });

    const toSales = switchOperatorPartnerStudio('sales', { navigate: false });
    assert.equal(toSales.ok, true);
    assert.equal(loadPlatformSession()?.companyId, env.companyId);
    assert.equal(loadPlatformSession()?.workspaceId, env.environment?.workspaceId);
    assert.equal(loadPlatformSession()?.projectId, env.environment?.projectId);
    assert.equal(loadPlatformSession()?.activeStudioId, 'sales');

    const toBuilder = switchOperatorPartnerStudio('builder', {
      navigate: false,
    });
    assert.equal(toBuilder.ok, true);
    assert.equal(loadPlatformSession()?.companyId, env.companyId);
    assert.equal(loadPlatformSession()?.activeStudioId, 'builder');

    const toOffice = switchOperatorPartnerStudio('office', { navigate: false });
    assert.equal(toOffice.ok, true);
    assert.equal(getOperatorPartnerEnvironment(), null);
    assert.equal(loadPlatformSession()?.activeStudioId, 'office');
    assert.match(toOffice.href, /partners\/p-dse/);
  });

  it('Office Studio return restores admin context and partner detail href', () => {
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

    const returned = returnFromOperatorPartnerEnvironment({ navigate: false });
    assert.equal(returned.ok, true);
    if (!returned.ok) return;
    assert.match(returned.href, /partners\/p-dse/);
    assert.equal(loadPlatformSession()?.companyId, before?.companyId);
    assert.equal(loadPlatformSession()?.activeStudioId, 'office');
  });
});
