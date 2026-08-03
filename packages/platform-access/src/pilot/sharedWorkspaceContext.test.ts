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
  returnFromOperatorPartnerEnvironment,
  switchOperatorPartnerStudio,
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
      projectId: 'proj-dse',
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
    assert.equal(ctx?.projectId, 'proj-dse');
    assert.equal(ctx?.activeStudio, 'client');
    assert.equal(isOperatorWorkspaceMode(), true);
    assert.ok(getOperatorPartnerEnvironment() !== null);

    const session = loadPlatformSession();
    assert.deepEqual(session?.workspaceContext, ctx);

    if (typeof localStorage !== 'undefined') {
      assert.equal(localStorage.getItem(OPERATOR_PE_STORAGE_KEY), null);
    }
  });

  it('preserves partner Workspace Context across studio switches', () => {
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
      projectId: 'proj-dse',
      officePartnerId: 'p-dse',
      officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
      navigate: false,
    });

    for (const surface of ['manager', 'sales', 'builder', 'client'] as const) {
      const switched = switchOperatorPartnerStudio(surface, { navigate: false });
      assert.equal(switched.ok, true);
      const ctx = getSharedWorkspaceContext();
      assert.ok(ctx !== null);
      assert.equal(ctx?.companyId, 'co-dse');
      assert.equal(ctx?.workspaceId, 'ws-dse');
      assert.equal(ctx?.projectId, 'proj-dse');
      assert.equal(ctx?.partnerId, 'p-dse');
      assert.equal(ctx?.activeStudio, surface);
      assert.equal(loadPlatformSession()?.companyId, 'co-dse');
    }
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
      projectId: 'proj-dse',
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
