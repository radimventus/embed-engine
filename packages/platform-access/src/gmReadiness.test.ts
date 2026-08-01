import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildGmReadinessReport,
  GM_ENGINEERING_DEBT,
  isPlatformAdmin,
  login,
  logout,
  provisionPilotWorkspace,
  resetCompanyRegistryExtras,
} from './index';
import { clearPlatformSession } from './session/sessionStore';

describe('gmReadiness (EPIC-BX-16)', () => {
  it('builds a single executive summary from readiness domains', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildGmReadinessReport(result.session);
    assert.equal(report.domains.length, 10);
    assert.ok(report.executive.scorePercent >= 80);
    assert.ok(
      report.executive.stage === 'Ready for Pilot' ||
        report.executive.stage === 'Ready for GM',
    );
    assert.equal(
      report.executive.passCount +
        report.executive.warningCount +
        report.executive.failCount,
      report.executive.domainCount,
    );
    logout();
  });

  it('aggregates operational health without inventing new services', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildGmReadinessReport(result.session);
    const healthIds = report.health.items.map((item) => item.id);
    assert.deepEqual(healthIds, [
      'runtime',
      'publish',
      'session',
      'capability',
      'intelligence',
    ]);
    assert.equal(
      report.health.items.find((item) => item.id === 'session')?.verdict,
      'PASS',
    );
    logout();
  });

  it('summarizes pilot firm lifecycle from registry signals', () => {
    resetCompanyRegistryExtras();
    provisionPilotWorkspace({ companyName: 'Alpine Living' });
    const report = buildGmReadinessReport(null);
    assert.ok(report.pilots.firms.length >= 2);
    assert.ok(
      report.pilots.firms.some((firm) => firm.companyName === 'AC Modular'),
    );
    assert.ok(
      report.pilots.firms.some((firm) => firm.companyName === 'Alpine Living'),
    );
    const total =
      report.pilots.counts.aktivni +
      report.pilots.counts.onboarding +
      report.pilots.counts['ceka-na-data'] +
      report.pilots.counts.produkce;
    assert.equal(total, report.pilots.firms.length);
    resetCompanyRegistryExtras();
  });

  it('exposes a unified GM checklist with PASS / TODO / BLOCKED', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildGmReadinessReport(result.session);
    assert.equal(report.checklist.length, 10);
    assert.ok(report.checklist.every((item) =>
      ['PASS', 'TODO', 'BLOCKED'].includes(item.state),
    ));
    assert.equal(
      report.checklist.find((item) => item.id === 'authentication')?.state,
      'PASS',
    );
    assert.equal(
      report.checklist.find((item) => item.id === 'platform-shell')?.state,
      'PASS',
    );
    logout();
  });

  it('lists architectural debt only (not bugs)', () => {
    assert.ok(GM_ENGINEERING_DEBT.length >= 5);
    assert.ok(
      GM_ENGINEERING_DEBT.every(
        (item) => item.title.length > 0 && item.area.length > 0,
      ),
    );
    const report = buildGmReadinessReport(null);
    assert.equal(report.debt.length, GM_ENGINEERING_DEBT.length);
  });

  it('gates GM ops to platform admins', () => {
    assert.equal(isPlatformAdmin(['conis-admin']), true);
    assert.equal(isPlatformAdmin(['project-admin']), true);
    assert.equal(isPlatformAdmin(['builder']), false);
    assert.equal(isPlatformAdmin(['manager']), false);
  });
});
