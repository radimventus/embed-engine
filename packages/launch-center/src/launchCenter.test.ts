import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearPlatformSession,
  login,
  logout,
  buildGaReadinessReport,
  buildPilotReadyReport,
} from '@embed-engine/platform-access';

import { buildLaunchCenterReport } from './index';

describe('launchCenter (EPIC-BX-23)', () => {
  it('aggregates existing readiness without inventing a second model', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const report = buildLaunchCenterReport(result.session);
    const ga = buildGaReadinessReport(result.session);
    const pilot = buildPilotReadyReport(result.session);

    assert.equal(report.checklist.length, 10);
    assert.ok(
      report.checklist.every((item) =>
        ['PASS', 'TODO', 'BLOCKED'].includes(item.state),
      ),
    );
    assert.equal(report.timeline.length, 6);
    assert.equal(
      report.pilotGate.verdict,
      pilot.ready ? 'YES' : 'NO',
    );
    assert.equal(report.gaGate.verdict, ga.goNoGo.decision);
    assert.ok(report.executive.currentStage.length > 0);
    assert.ok(report.executive.recommendedNextAction.length > 0);
    assert.ok(report.dashboard.gaReadiness.includes('%'));
    logout();
  });

  it('exposes Pilot Gate and GA Gate as projections of existing sources', () => {
    clearPlatformSession();
    const report = buildLaunchCenterReport(null);
    assert.equal(report.pilotGate.label, 'Pilot Ready');
    assert.ok(['YES', 'NO'].includes(report.pilotGate.verdict));
    assert.ok(
      ['GO', 'GO WITH CONDITIONS', 'NO GO'].includes(report.gaGate.verdict),
    );
  });
});
