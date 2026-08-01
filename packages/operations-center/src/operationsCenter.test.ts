import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildOperationsCenterReport,
  isOperationsCenterDeclared,
} from './index';
import {
  clearPlatformSession,
  login,
  logout,
} from '@embed-engine/platform-access';

describe('operationsCenter (EPIC-BX-19)', () => {
  it('aggregates platform overview, timeline, alerts, metrics and executive view', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildOperationsCenterReport(result.session);
    assert.equal(report.overview.length, 9);
    assert.ok(report.overview.every((area) => area.label.length > 0));
    assert.ok(Array.isArray(report.timeline));
    assert.ok(Array.isArray(report.alerts));
    assert.ok(report.metrics.activeCompanies >= 1);
    assert.ok(report.metrics.activeProjects >= 1);
    assert.ok(report.executive.currentPlatformStatus.length > 0);
    assert.ok(report.executive.recommendedActions.length > 0);
    logout();
  });

  it('is declared as Manager capability operations-center', () => {
    assert.equal(isOperationsCenterDeclared(), true);
  });

  it('uses the same Company registry — no second ops model', () => {
    clearPlatformSession();
    const loggedOut = buildOperationsCenterReport(null);
    assert.ok(loggedOut.metrics.activeCompanies >= 1);
    assert.ok(
      loggedOut.overview.some((area) => area.id === 'customer-success'),
    );
  });
});
