import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { listCapabilities, requireCapability } from '@embed-engine/capabilities';
import {
  clearPlatformSession,
  login,
  logout,
} from '@embed-engine/platform-access';

import {
  buildCommercialPlatformReport,
  isCapabilityAvailableOnPlan,
} from './index';

describe('commercialPlatform (EPIC-BX-21)', () => {
  it('reads entitlements from Capability Registry SSOT', () => {
    const all = listCapabilities();
    assert.ok(all.every((item) => item.entitlement !== undefined));
    assert.equal(requireCapability('dashboard').entitlement, 'included');
    assert.equal(requireCapability('pipeline').entitlement, 'experimental');
    assert.equal(
      requireCapability('customer-success').entitlement,
      'optional',
    );
    assert.equal(
      requireCapability('commercial-platform').id,
      'commercial-platform',
    );
  });

  it('projects subscriptions and licenses without a second Company model', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildCommercialPlatformReport(result.session);
    assert.ok(report.subscriptions.length >= 1);
    assert.equal(report.subscriptions[0]?.companyId, 'ac-modular');
    assert.ok(report.licenses.length === report.subscriptions.length);
    assert.ok(report.entitlements.length === listCapabilities().length);
    assert.ok(report.dashboard.activeCompanies >= 1);
    assert.ok(report.executive.commercialReadiness.length > 0);
    assert.ok(report.executive.constraints.length >= 1);
    logout();
  });

  it('applies deterministic plan entitlement rules', () => {
    assert.equal(isCapabilityAvailableOnPlan('included', 'Starter'), true);
    assert.equal(isCapabilityAvailableOnPlan('optional', 'Starter'), false);
    assert.equal(isCapabilityAvailableOnPlan('optional', 'Growth'), true);
    assert.equal(isCapabilityAvailableOnPlan('experimental', 'Growth'), false);
    assert.equal(isCapabilityAvailableOnPlan('experimental', 'Scale'), true);
  });
});
