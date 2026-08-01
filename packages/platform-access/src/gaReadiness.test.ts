import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildGaReadinessReport,
  clearPlatformSession,
  login,
  logout,
} from './index';

describe('gaReadiness (EPIC-BX-18)', () => {
  it('answers GA readiness from existing GM / capability signals', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildGaReadinessReport(result.session);
    assert.equal(report.matrix.length, 10);
    assert.ok(report.dashboard.overallReadinessPercent >= 0);
    assert.ok(
      ['GO', 'GO WITH CONDITIONS', 'NO GO'].includes(report.goNoGo.decision),
    );
    assert.ok(report.operationalHealth.some((item) => item.id === 'platform'));
    assert.ok(report.operationalHealth.some((item) => item.id === 'session'));
    assert.equal(report.checklist.length, 11);
    assert.ok(report.certification.fingerprint.length > 0);
    assert.ok(report.executive.recommendation.length > 0);
    assert.ok(
      report.matrix.some((row) => row.id === 'customer-success'),
    );
    logout();
  });

  it('returns NO GO when session is missing', () => {
    clearPlatformSession();
    const report = buildGaReadinessReport(null);
    assert.equal(report.goNoGo.decision, 'NO GO');
    assert.ok(report.goNoGo.blockers.length > 0);
    assert.match(report.dashboard.overallLabel, /Není připraveno|GA/i);
  });

  it('does not invent a second readiness source — matrix maps GM domains', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const report = buildGaReadinessReport(result.session);
    const ids = report.matrix.map((row) => row.id);
    assert.deepEqual(ids, [
      'platform',
      'builder',
      'manager',
      'sales',
      'runtime',
      'publish',
      'intelligence',
      'capability',
      'authentication',
      'customer-success',
    ]);
    logout();
  });
});
