import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  analyzeCustomerSuccess,
  buildCustomerSuccessReport,
  type CustomerSuccessSnapshotInput,
} from './index';
import {
  clearPlatformSession,
  login,
  logout,
} from '@embed-engine/platform-access';

function fixture(
  patch: Partial<CustomerSuccessSnapshotInput> = {},
): CustomerSuccessSnapshotInput {
  return {
    companyId: 'ac-modular',
    companyName: 'AC Modular',
    workspaceId: 'ac-modular-main',
    workspaceName: 'AC Modular Main',
    projectCount: 3,
    publishedProjectCount: 1,
    readyProjectCount: 3,
    hasHousePackage: true,
    sessionActive: true,
    lastLoginAt: '2026-08-01T08:00:00.000Z',
    lastPublishAt: '2026-08-01T09:00:00.000Z',
    lastPublishLabel: 'v1.0.0',
    pendingInviteCount: 0,
    activityLabels: [
      'Login radim',
      'Preview villa',
      'Publish v1',
      'Lead pipeline',
    ],
    capabilityActiveCount: 6,
    builderHref: 'http://127.0.0.1:4177/',
    managerHref: 'http://127.0.0.1:4175/',
    salesHref: 'http://127.0.0.1:4179/',
    ...patch,
  };
}

describe('customerSuccess (EPIC-BX-17)', () => {
  it('builds onboarding, adoption, health, timeline and recommendations', () => {
    const report = buildCustomerSuccessReport(fixture());
    assert.equal(report.onboarding.length, 7);
    assert.ok(report.adoptionScore >= 70);
    assert.equal(report.health, 'Healthy');
    assert.equal(report.timeline.length, 5);
    assert.ok(Array.isArray(report.recommendations));
    assert.ok(
      report.recommendations.every((item) => item.href.length > 0),
    );
    const needsWork = buildCustomerSuccessReport(
      fixture({ projectCount: 1, publishedProjectCount: 0, lastPublishAt: null }),
    );
    assert.ok(needsWork.recommendations.length >= 1);
  });

  it('marks early onboarding In Progress and health At Risk when empty', () => {
    const report = buildCustomerSuccessReport(
      fixture({
        sessionActive: false,
        lastLoginAt: null,
        projectCount: 0,
        publishedProjectCount: 0,
        readyProjectCount: 0,
        hasHousePackage: false,
        lastPublishAt: null,
        activityLabels: [],
        capabilityActiveCount: 0,
      }),
    );
    assert.equal(report.onboarding[0]?.state, 'In Progress');
    assert.equal(report.health, 'At Risk');
    assert.ok(report.adoptionScore < 40);
  });

  it('analyzes the same Company model from platform-access', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const report = analyzeCustomerSuccess({ session: result.session });
    assert.ok(report !== null);
    assert.equal(report?.companyId, 'ac-modular');
    assert.equal(report?.workspaceId, 'ac-modular-main');
    assert.ok((report?.adoptionScore ?? 0) > 0);
    logout();
  });
});
