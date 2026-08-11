/**
 * OF-14 — Shared Workspace Context (cookie / platform session).
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
  OPERATOR_PE_STORAGE_KEY,
  resetOperatorPartnerEnvironmentForTests,
  resetUserRegistry,
  restoreAuthenticatedPartnerEnvironment,
  returnFromOperatorPartnerEnvironment,
  switchOperatorPartnerStudio,
  updateSession,
  workspaceStudiosForRoles,
} from '../index';

describe('OF-14 Shared Workspace Context', () => {
  function reset(): void {
    resetUserRegistry();
    resetOperatorPartnerEnvironmentForTests();
    clearPlatformSession();
  }

  it('stores operator Workspace Context on the platform session (not host-local storage)', () => {
    reset();
    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );

    const entered = enterOperatorPartnerEnvironment({
      companyId: 'co-dse',
      workspaceId: 'ws-dse',
      projectId: 'project-domy-s-energii',
      officePartnerId: 'p-dse',
      officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
      navigate: false,
    });
    assert.equal(entered.ok, true);

    const ctx = getSharedWorkspaceContext();
    assert.ok(ctx !== null);
    assert.equal(ctx?.operatorMode, true);
    assert.equal(ctx?.partnerId, 'p-dse');
    assert.equal(ctx?.companyId, 'co-dse');
    assert.equal(ctx?.workspaceId, 'ws-dse');
    assert.equal(ctx?.projectId, 'project-domy-s-energii');
    assert.equal(ctx?.activeStudio, 'client');
    assert.equal(isOperatorWorkspaceMode(), true);
    assert.ok(getOperatorPartnerEnvironment() !== null);

    const session = loadPlatformSession();
    assert.deepEqual(session?.workspaceContext, ctx);

    if (typeof localStorage !== 'undefined') {
      assert.equal(localStorage.getItem(OPERATOR_PE_STORAGE_KEY), null);
    }
  });

  it('keeps a Manager in DSE context while denying Office and Builder', () => {
    reset();
    assert.equal(
      login({
        email: 'manager@ac.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );
    assert.equal(
      enterOperatorPartnerEnvironment({
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        officePartnerId: 'p-dse',
        officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
        navigate: false,
      }).ok,
      true,
    );

    assert.equal(
      switchOperatorPartnerStudio('sales', {
        navigate: false,
        retainWorkspace: true,
      }).ok,
      true,
    );
    assert.equal(
      switchOperatorPartnerStudio('office', {
        navigate: false,
        retainWorkspace: true,
      }).ok,
      false,
    );
    assert.equal(
      switchOperatorPartnerStudio('builder', {
        navigate: false,
        retainWorkspace: true,
      }).ok,
      false,
    );
    assert.deepEqual(getSharedWorkspaceContext(), {
      operatorMode: true,
      partnerId: 'p-dse',
      companyId: 'company-domy-s-energii',
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
      activeStudio: 'sales',
      activeHouseId: null,
      officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
      previous: {
        tenantId: 'tenant-ac-modular',
        companyId: 'ac-modular',
        workspaceId: 'ac-modular-main',
        projectId: 'project-ac-modular',
      },
    });
    assert.deepEqual(loadPlatformSession()?.user.roles, ['manager']);
  });

  it('restores the prepared DSE Partner Environment for a Manager session', () => {
    reset();
    assert.equal(
      login({
        email: 'manager@ac.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );
    updateSession({
      tenantId: 'tenant-domy-s-energii',
      companyId: 'company-domy-s-energii',
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
      workspaceContext: null,
    });

    const restored = restoreAuthenticatedPartnerEnvironment();

    assert.ok(restored !== null);
    assert.equal(restored?.companyId, 'company-domy-s-energii');
    assert.equal(restored?.projectId, 'project-domy-s-energii');
    assert.equal(restored?.activeStudio, 'client');
    assert.deepEqual(loadPlatformSession()?.user.roles, ['manager']);
    assert.deepEqual(
      workspaceStudiosForRoles(loadPlatformSession()?.user.roles ?? []),
      ['client', 'manager', 'sales'],
    );
  });

  it('preserves partner Workspace Context across in-shell studio switches including Office', () => {
    reset();
    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );

    enterOperatorPartnerEnvironment({
      companyId: 'co-dse',
      workspaceId: 'ws-dse',
      projectId: 'project-domy-s-energii',
      officePartnerId: 'p-dse',
      officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
      navigate: false,
    });

    for (const surface of [
      'manager',
      'sales',
      'builder',
      'office',
      'client',
    ] as const) {
      const switched = switchOperatorPartnerStudio(surface, {
        navigate: false,
        retainWorkspace: true,
      });
      assert.equal(switched.ok, true);
      const ctx = getSharedWorkspaceContext();
      assert.ok(ctx !== null);
      assert.equal(ctx?.companyId, 'co-dse');
      assert.equal(ctx?.workspaceId, 'ws-dse');
      assert.equal(ctx?.projectId, 'project-domy-s-energii');
      assert.equal(ctx?.partnerId, 'p-dse');
      assert.equal(ctx?.activeStudio, surface);
      assert.equal(loadPlatformSession()?.companyId, 'co-dse');
      assert.equal(switched.href.includes('4183') || switched.href.includes('/studio/workspace'), true);
    }
  });

  it('preserves Shared Project session bind across studio switches (PT-OS-02 / B-03)', () => {
    reset();
    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );

    enterOperatorPartnerEnvironment({
      companyId: 'co-dse',
      workspaceId: 'ws-dse',
      projectId: 'project-domy-s-energii',
      officePartnerId: 'p-dse',
      officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
      navigate: false,
    });

    updateSession({
      projectId: 'project-ac-modular',
      workspaceContext: {
        ...getSharedWorkspaceContext()!,
        projectId: 'project-ac-modular',
      },
    });

    const switched = switchOperatorPartnerStudio('client', {
      navigate: false,
      retainWorkspace: true,
    });
    assert.equal(switched.ok, true);
    assert.equal(loadPlatformSession()?.projectId, 'project-ac-modular');
    assert.equal(
      getSharedWorkspaceContext()?.projectId,
      'project-ac-modular',
    );
    assert.equal(getSharedWorkspaceContext()?.activeStudio, 'client');
  });

  it('clears Shared Workspace Context when returning to Office', () => {
    reset();
    assert.equal(
      login({
        email: 'radim@conis.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      true,
    );
    const beforeCompany = loadPlatformSession()?.companyId;

    enterOperatorPartnerEnvironment({
      companyId: 'co-dse',
      workspaceId: 'ws-dse',
      projectId: 'project-domy-s-energii',
      officePartnerId: 'p-dse',
      officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
      navigate: false,
    });

    const returned = returnFromOperatorPartnerEnvironment({ navigate: false });
    assert.equal(returned.ok, true);
    assert.equal(getSharedWorkspaceContext(), null);
    assert.equal(isOperatorWorkspaceMode(), false);
    assert.equal(loadPlatformSession()?.companyId, beforeCompany);
    assert.equal(loadPlatformSession()?.activeStudioId, 'office');
  });
});
