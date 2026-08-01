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

describe('commercialPlatform (EPIC-BX-22)', () => {
  it('reads entitlements from Capability Registry SSOT including hidden', () => {
    const all = listCapabilities();
    assert.ok(
      all.every((item) =>
        ['included', 'optional', 'experimental', 'hidden'].includes(
          item.entitlement,
        ),
      ),
    );
    assert.equal(requireCapability('dashboard').entitlement, 'included');
    assert.equal(requireCapability('pipeline').entitlement, 'hidden');
    assert.equal(
      requireCapability('customer-success').entitlement,
      'optional',
    );
    assert.equal(
      requireCapability('commercial-platform').id,
      'commercial-platform',
    );
  });

  it('projects subscriptions without a second Company model', () => {
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
    assert.ok(
      ['current', 'due', 'lapsed', 'not-applicable'].includes(
        report.subscriptions[0]?.renewalState ?? '',
      ),
    );
    assert.ok(report.licenses.length === report.subscriptions.length);
    assert.ok(report.entitlements.length === listCapabilities().length);
    assert.ok(report.dashboard.companies.length >= 1);
    assert.ok(report.dashboard.activeCompanies >= 1);
    assert.ok(report.executive.revenueReadiness.length > 0);
    assert.ok(report.executive.commercialRisks.length >= 1);
    assert.ok(report.executive.constraints.length >= 1);
    assert.ok(Array.isArray(report.dashboard.upgradeOpportunities));
    logout();
  });

  it('applies deterministic plan entitlement rules including hidden', () => {
    assert.equal(isCapabilityAvailableOnPlan('included', 'Starter'), true);
    assert.equal(isCapabilityAvailableOnPlan('optional', 'Starter'), false);
    assert.equal(isCapabilityAvailableOnPlan('optional', 'Growth'), true);
    assert.equal(isCapabilityAvailableOnPlan('experimental', 'Growth'), false);
    assert.equal(isCapabilityAvailableOnPlan('experimental', 'Scale'), true);
    assert.equal(isCapabilityAvailableOnPlan('hidden', 'Trial'), false);
    assert.equal(isCapabilityAvailableOnPlan('hidden', 'Scale'), false);
  });
});
