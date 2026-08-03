import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog';
import { resetDocumentRegistryForTests } from './officeDocumentRegistry';
import { getHandoff, resetHandoffRegistryForTests } from './officeHandoffRegistry';
import {
  getLastPilotRuntimeSummary,
  runPilotRuntime,
  validatePilotRuntime,
} from './officePilotRuntime';
import { PILOT_REQUIRED_EVENT_KINDS } from './officePilotRuntimeModel';
import {
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry';
import { resetSalesRegistryForTests } from './officeSalesRegistry';

describe('officePilotRuntime (OF-06)', () => {
  beforeEach(() => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetDocumentRegistryForTests();
    resetHandoffRegistryForTests();
  });

  it('runs end-to-end Lead → Pilot Ready without manual steps', () => {
    const summary = runPilotRuntime({ partnerName: 'OF06 Pilot Co' });

    assert.equal(summary.pilotReady, true);
    assert.equal(summary.partnerName, 'OF06 Pilot Co');
    assert.ok(summary.completedAt !== null);
    assert.equal(summary.missingEventKinds.length, 0);
    assert.ok(summary.steps.every((step) => step.passed));
    assert.ok(summary.runtimeChecks.every((check) => check.passed));
    assert.ok(summary.timelineChecks.every((check) => check.passed));

    const partner = getPartner(summary.partnerId);
    assert.equal(partner?.status, 'implementation');

    const handoff = getHandoff(summary.partnerId);
    assert.equal(handoff?.status, 'builder_ready');
    assert.ok(handoff?.workspace !== null);
    assert.ok(handoff?.workspace?.project.object !== null);

    const kinds = new Set(
      listPartnerTimeline(summary.partnerId, 100).map((event) => event.kind),
    );
    for (const kind of PILOT_REQUIRED_EVENT_KINDS) {
      assert.ok(kinds.has(kind), `missing timeline event ${kind}`);
    }

    assert.equal(getLastPilotRuntimeSummary()?.partnerId, summary.partnerId);
  });

  it('revalidates an existing pilot partner', () => {
    const first = runPilotRuntime({ partnerName: 'OF06 Revalidate' });
    const again = validatePilotRuntime(first.partnerId);
    assert.equal(again.pilotReady, true);
    assert.equal(again.partnerId, first.partnerId);
  });
});
